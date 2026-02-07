const { execSync } = require("child_process");
const path = require("path");
const config = require("./config.js");

const scripts = [
  "01_download_lunatv_config.js",
  "02_process_lunatv_config.js",
  "03_check_video_sources.js",
  "04_convert_ouonnkitv.js",
];

const scriptsDir = path.join(__dirname, "scripts");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  console.log("OuonnkiTV 视频源一键检测脚本\n");

  const useProxyDownload = config.proxy.url && config.proxy.download;
  const useProxyCheck = config.proxy.url && config.proxy.check;

  console.log("当前配置:");
  console.log(`  代理地址: ${config.proxy.url || "未设置"}`);
  console.log(`  下载使用代理: ${useProxyDownload ? "是" : "否"}`);
  console.log(`  检测使用代理: ${useProxyCheck ? "是" : "否"}`);
  console.log(`  检测关键词: ${config.check.keyword}`);
  console.log(`  超时时间: ${config.check.timeout}ms`);
  console.log(`  并发数: ${config.check.concurrent}`);
  console.log("");

  console.log("2秒后开始执行...\n");
  await sleep(2000);

  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    const scriptPath = path.join(scriptsDir, script);

    console.log(`[${i + 1}/${scripts.length}] 正在执行: ${script}`);

    try {
      execSync(`node "${scriptPath}"`, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
      console.log(`\n>>> [成功] ${script} 执行完成\n`);
    } catch (error) {
      console.error(`\n>>> [失败] ${script} 执行出错`);
      console.error("错误:", error.message);
      process.exit(1);
    }
  }

  console.log("所有脚本执行完成！");
})();
