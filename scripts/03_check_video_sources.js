const fs = require("fs");
const path = require("path");
const axios = require("axios");

const CONFIG_PATH = path.join(__dirname, "..", "tv_source", "LunaTV", "LunaTV-processed.json");
const HISTORY_PATH = path.join(__dirname, "..", "tv_source", "LunaTV", "LunaTV-check-history.json");
const MAX_HISTORY = 30;

const CONFIG = {
  timeout: 4000,
  concurrent: 30,
  maxRetry: 2,
  retryDelay: 1000,
  keyword: process.argv[2] || "斗罗大陆",
  headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  useProxy: true,
  proxyUrl: "https://kuayu.hellow.eu.org",
};

function getProxiedUrl(apiUrl) {
  if (!CONFIG.useProxy) return apiUrl;
  return `${CONFIG.proxyUrl}/${apiUrl}`;
}

const SEARCH_STATUS = {
  SUCCESS: "success",
  NO_RESULTS: "no_results",
  MISMATCH: "mismatch",
  FAILED: "failed",
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function checkSource(api, keyword) {
  for (let i = 1; i <= CONFIG.maxRetry; i++) {
    const startTime = Date.now();
    try {
      const res = await axios.get(`${api}?wd=${encodeURIComponent(keyword)}`, {
        timeout: CONFIG.timeout,
        headers: CONFIG.headers,
      });

      const duration = Date.now() - startTime;
      const list = res.data?.list || [];

      if (!list.length) {
        return { status: SEARCH_STATUS.NO_RESULTS, duration };
      }

      const isMatch = list.some((item) => JSON.stringify(item).includes(keyword));
      return {
        status: isMatch ? SEARCH_STATUS.SUCCESS : SEARCH_STATUS.MISMATCH,
        duration,
      };
    } catch {
      if (i < CONFIG.maxRetry) await delay(CONFIG.retryDelay);
    }
  }

  return { status: SEARCH_STATUS.FAILED, duration: null };
}

async function runWithLimit(tasks, limit, onComplete) {
  const results = new Array(tasks.length);
  let index = 0;

  async function runNext() {
    const i = index++;
    if (i >= tasks.length) return;

    const r = await tasks[i]();
    results[i] = r;
    onComplete(i, r);
    await runNext();
  }

  const workers = Array(Math.min(limit, tasks.length)).fill().map(runNext);
  await Promise.all(workers);
  return results;
}

(async () => {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error("[Error] 配置文件不存在:", CONFIG_PATH);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  const sources = Object.values(config.api_site || {}).map((s) => ({
    name: s.name,
    api: s.api,
    isAdult: s.isAdult || false,
  }));

  console.log(CONFIG.useProxy ? `[Proxy] 代理已开启: ${CONFIG.proxyUrl}\n` : `[Proxy] 代理已关闭\n`);
  console.log(`[Info] 共加载 ${sources.length} 个视频源，开始检测...\n`);

  const startTime = Date.now();
  const tasks = sources.map((s) => async () => {
    const proxiedApi = getProxiedUrl(s.api);
    const result = await checkSource(proxiedApi, CONFIG.keyword);
    return {
      name: s.name,
      api: s.api,
      isAdult: s.isAdult,
      searchStatus: result.status,
      searchDuration: result.duration,
      useProxy: CONFIG.useProxy,
    };
  });

  const results = await runWithLimit(tasks, CONFIG.concurrent, (i, r) => {
    const s = sources[i];
    const durationInfo = r.searchDuration !== null ? ` (${r.searchDuration}ms)` : "";
    console.log(`[${i + 1}/${sources.length}] ${s.name}`);
    console.log(`    search: ${r.searchStatus}${durationInfo}`);
    console.log(`    URL: ${s.api}`);
    console.log();
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  const accessible = results.filter((r) => r.searchStatus !== SEARCH_STATUS.FAILED).length;
  const searchOk = results.filter((r) => r.searchStatus === SEARCH_STATUS.SUCCESS).length;

  const formattedDate = new Date().toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const currentRecord = {
    date: formattedDate,
    keyword: CONFIG.keyword,
    useProxy: CONFIG.useProxy,
    proxyUrl: CONFIG.proxyUrl,
    duration: `${duration}s`,
    stats: {
      total: sources.length,
      accessible: accessible,
      searchOk: searchOk,
    },
    results,
  };

  let history = [];
  if (fs.existsSync(HISTORY_PATH)) {
    try {
      history = JSON.parse(fs.readFileSync(HISTORY_PATH, "utf-8"));
      if (!Array.isArray(history)) history = [];
    } catch {
      history = [];
    }
  }

  history.unshift(currentRecord);
  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY);
  }

  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), "utf-8");

  console.log(`[Done] ${sources.length} sources | ${accessible} accessible | ${searchOk} search ok | ${duration}s`);
  console.log(`[Info] 历史记录已保存: ${HISTORY_PATH} (共 ${history.length} 条)`);
})();
