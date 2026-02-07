const fs = require("fs");
const path = require("path");

const inputFile = path.join(__dirname, "..", "tv_source", "LunaTV", "LunaTV-check-result.json");
const outputDir = path.join(__dirname, "..", "tv_source", "OuonnkiTV");
const LITE_LIMIT = 15;

const outputs = [
  { name: "full.json", filter: (r) => r },
  { name: "full-noadult.json", filter: (r) => r.filter((x) => !x.isAdult) },
  { name: "lite.json", filter: (r) => r.filter((x) => !x.isAdult).slice(0, LITE_LIMIT) },
  { name: "adult.json", filter: (r) => r.filter((x) => x.isAdult) },
];

function convertRecord(r) {
  return { id: r.name, name: r.name, url: r.api, detailUrl: r.detail || r.api, isEnabled: true };
}

function saveJson(filename, records) {
  const data = records.map(convertRecord);
  fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(data, null, 2), "utf8");
  return data.length;
}

(async () => {
  try {
    if (!fs.existsSync(inputFile)) {
      console.error(`错误: 找不到输入文件: ${inputFile}`);
      process.exit(1);
    }
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const results = JSON.parse(fs.readFileSync(inputFile, "utf8")).results;
    const sorted = results
      .filter((r) => r.searchStatus === "success")
      .sort((a, b) => (a.searchDuration || Infinity) - (b.searchDuration || Infinity));

    for (const { name, filter } of outputs) {
      const count = saveJson(name, filter(sorted));
      console.log(`✓ 已生成: ${name} (${count} 个视频源)`);
    }
  } catch (error) {
    console.error(`\n错误: ${error.message}`);
    process.exit(1);
  }
})();
