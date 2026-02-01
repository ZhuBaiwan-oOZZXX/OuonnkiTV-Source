const axios = require("axios");
const fs = require("fs");
const path = require("path");

const url = "https://raw.githubusercontent.com/hafrey1/LunaTV-config/refs/heads/main/LunaTV-config.json";
const targetDir = path.join(__dirname, "..", "tv_source", "LunaTV");
const filepath = path.join(targetDir, "LunaTV-config.json");

(async () => {
  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    console.log("正在下载: LunaTV-config.json");

    const response = await axios.get(url, { responseType: "text" });
    fs.writeFileSync(filepath, response.data, "utf8");

    console.log("✓ 已保存: LunaTV-config.json");
  } catch (error) {
    console.error(`错误: ${error.message}`);
    process.exit(1);
  }
})();
