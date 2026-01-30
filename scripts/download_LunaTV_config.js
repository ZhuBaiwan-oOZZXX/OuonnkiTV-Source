const https = require("https");
const fs = require("fs");
const path = require("path");

const url = "https://raw.githubusercontent.com/hafrey1/LunaTV-config/refs/heads/main/LunaTV-config.json";
const targetDir = path.join(__dirname, "..", "tv_source", "LunaTV");
const filepath = path.join(targetDir, "LunaTV-config.json");

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log("正在下载: LunaTV-config.json");

https
  .get(url, (response) => {
    if (response.statusCode !== 200) {
      console.error(`错误: 状态码 ${response.statusCode}`);
      process.exit(1);
    }

    response.setEncoding("utf8");

    let data = "";
    response.on("data", (chunk) => (data += chunk));
    response.on("end", () => {
      fs.writeFileSync(filepath, data, "utf8");
      console.log("✓ 已保存: LunaTV-config.json");
    });
  })
  .on("error", (err) => {
    console.error(`错误: ${err.message}`);
    process.exit(1);
  });
