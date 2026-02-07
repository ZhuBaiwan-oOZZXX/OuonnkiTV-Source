const { execSync } = require("child_process");
const path = require("path");

const scripts = [
  "01_download_lunatv_config.js",
  "02_process_lunatv_config.js",
  "03_check_video_sources.js",
  "04_convert_ouonnkitv.js",
];

const scriptsDir = path.join(__dirname, "scripts");

console.log("OuonnkiTV 视频源一键检测脚本\n");

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
