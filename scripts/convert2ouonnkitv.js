const fs = require("fs");
const path = require("path");

const inputFile = path.join(__dirname, "..", "tv_source", "LunaTV", "LunaTV-config.json");
const outputDir = path.join(__dirname, "..", "tv_source", "OuonnkiTV");

function convertToOuonnkiTVFormat(config) {
  const result = [];

  for (const [key, value] of Object.entries(config.api_site)) {
    result.push({
      id: value.name,
      name: value.name,
      url: value.api,
      detailUrl: value.detail,
      isEnabled: true,
    });
  }

  return result;
}

function filterClean(config) {
  const result = { cache_time: config.cache_time, api_site: {} };
  for (const [key, value] of Object.entries(config.api_site)) {
    if (!value._comment) {
      result.api_site[key] = value;
    }
  }
  return result;
}

function filterCleanNoAdult(config) {
  const result = { cache_time: config.cache_time, api_site: {} };
  for (const [key, value] of Object.entries(config.api_site)) {
    if (!value._comment && !value.name.startsWith("🔞")) {
      result.api_site[key] = value;
    }
  }
  return result;
}

(async () => {
  try {
    if (!fs.existsSync(inputFile)) {
      console.error(`错误: 找不到输入文件: ${inputFile}`);
      process.exit(1);
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const config = JSON.parse(fs.readFileSync(inputFile, "utf8"));

    const raw = convertToOuonnkiTVFormat(config);
    fs.writeFileSync(path.join(outputDir, "raw.json"), JSON.stringify(raw, null, 2), "utf8");
    console.log(`✓ 已生成: raw.json (${raw.length} 个视频源)`);

    const cleanConfig = filterClean(config);
    const clean = convertToOuonnkiTVFormat(cleanConfig);
    fs.writeFileSync(path.join(outputDir, "clean.json"), JSON.stringify(clean, null, 2), "utf8");
    console.log(`✓ 已生成: clean.json (${clean.length} 个视频源)`);

    const cleanNoAdultConfig = filterCleanNoAdult(config);
    const cleanNoAdult = convertToOuonnkiTVFormat(cleanNoAdultConfig);
    fs.writeFileSync(path.join(outputDir, "clean-no-adult.json"), JSON.stringify(cleanNoAdult, null, 2), "utf8");
    console.log(`✓ 已生成: clean-no-adult.json (${cleanNoAdult.length} 个视频源)`);

    console.log("\n所有文件处理完成！");
  } catch (error) {
    console.error(`\n错误: ${error.message}`);
    process.exit(1);
  }
})();
