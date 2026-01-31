const fs = require("fs");
const path = require("path");

const inputFile = path.join(__dirname, "..", "tv_source", "LunaTV", "LunaTV-check-history.json");
const outputDir = path.join(__dirname, "..", "tv_source", "OuonnkiTV");

function convertRecord(record) {
  return {
    id: record.name,
    name: record.name,
    url: record.api,
    detailUrl: record.detail || record.api,
    isEnabled: true
  };
}

function filterSuccess(results) {
  return results.filter(r => r.apiAccessible && r.searchStatus === "success");
}

function filterNoAdult(results) {
  return results.filter(r => !r.isAdult);
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

    const history = JSON.parse(fs.readFileSync(inputFile, "utf8"));
    const latestRecord = history[0];
    const results = latestRecord.results;

    const successResults = filterSuccess(results);
    const fullData = successResults.map(convertRecord);
    fs.writeFileSync(path.join(outputDir, "full.json"), JSON.stringify(fullData, null, 2), "utf8");
    console.log(`✓ 已生成: full.json (${fullData.length} 个视频源)`);

    const cleanResults = filterNoAdult(successResults);
    const liteData = cleanResults.map(convertRecord);
    fs.writeFileSync(path.join(outputDir, "lite.json"), JSON.stringify(liteData, null, 2), "utf8");
    console.log(`✓ 已生成: lite.json (${liteData.length} 个视频源)`);

    console.log("\n所有文件处理完成！");
  } catch (error) {
    console.error(`\n错误: ${error.message}`);
    process.exit(1);
  }
})();
