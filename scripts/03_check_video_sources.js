const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { promisify } = require("util");

const readFile = promisify(fs.readFile);
const exists = promisify(fs.exists);

const CONFIG_PATH = path.join(__dirname, "..", "tv_source", "LunaTV", "LunaTV-processed.json");
const HISTORY_PATH = path.join(__dirname, "..", "tv_source", "LunaTV", "LunaTV-check-history.json");
const MAX_HISTORY = 30;

const CONFIG = {
  timeout: 6000,
  concurrent: 20,
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
  SEARCH_FAILED: "search_failed",
  SKIPPED: "skipped",
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url) {
  for (let i = 1; i <= CONFIG.maxRetry; i++) {
    try {
      return await axios.get(url, { timeout: CONFIG.timeout, headers: CONFIG.headers });
    } catch {
      if (i < CONFIG.maxRetry) await delay(CONFIG.retryDelay);
    }
  }
  return null;
}

async function checkSearch(api, keyword) {
  const res = await fetchWithRetry(`${api}?wd=${encodeURIComponent(keyword)}`);
  if (!res || res.status !== 200) return SEARCH_STATUS.SEARCH_FAILED;
  const list = res.data?.list || [];
  if (!list.length) return SEARCH_STATUS.NO_RESULTS;
  return list.some((item) => JSON.stringify(item).includes(keyword)) ? SEARCH_STATUS.SUCCESS : SEARCH_STATUS.MISMATCH;
}

async function runWithLimit(tasks, limit, onComplete) {
  const results = new Array(tasks.length);
  let index = 0;

  async function runNext() {
    const i = index++;
    if (i >= tasks.length) return;

    try {
      const r = await tasks[i]();
      results[i] = r;
      onComplete(i, r);
    } catch (e) {
      results[i] = { error: e.message };
      onComplete(i, { error: e.message });
    }

    await runNext();
  }

  const workers = Array(Math.min(limit, tasks.length)).fill().map(runNext);
  await Promise.all(workers);
  return results;
}

(async () => {
  if (!(await exists(CONFIG_PATH))) {
    console.error("❌ 配置文件不存在:", CONFIG_PATH);
    process.exit(1);
  }

  const config = JSON.parse(await readFile(CONFIG_PATH, "utf-8"));
  const sources = Object.values(config.api_site || {}).map((s) => ({
    name: s.name,
    api: s.api,
    isAdult: s.isAdult || false,
  }));

  if (CONFIG.useProxy) {
    console.log(`🌐 代理已开启: ${CONFIG.proxyUrl}\n`);
  }
  console.log(`📊 共加载 ${sources.length} 个视频源，开始检测...\n`);

  const startTime = Date.now();
  const tasks = sources.map((s) => async () => {
    const proxiedApi = getProxiedUrl(s.api);
    const apiAccessible = (await fetchWithRetry(proxiedApi))?.status === 200;
    const searchStatus = apiAccessible ? await checkSearch(proxiedApi, CONFIG.keyword) : SEARCH_STATUS.SKIPPED;
    return { name: s.name, api: s.api, isAdult: s.isAdult, apiAccessible, searchStatus, useProxy: CONFIG.useProxy };
  });

  const results = await runWithLimit(tasks, CONFIG.concurrent, (i, r) => {
    const s = sources[i];
    const apiStatus = r.apiAccessible ? "accessible" : "unreachable";
    const searchInfo = r.apiAccessible ? ` | search: ${r.searchStatus}` : "";
    console.log(`[${i + 1}/${sources.length}] ${s.name}`);
    console.log(`    API: ${apiStatus}${searchInfo}`);
    console.log(`    URL: ${s.api}`);
    console.log();
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  const accessible = results.filter((r) => r.apiAccessible).length;
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
  console.log(`📜 历史记录已保存: ${HISTORY_PATH} (共 ${history.length} 条)`);
})();
