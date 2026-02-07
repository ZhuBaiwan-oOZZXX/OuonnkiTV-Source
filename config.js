module.exports = {
  proxy: {
    url: "https://kuayu.hellow.eu.org",
    download: true,
    check: false,
  },
  check: {
    timeout: 4000,
    concurrent: 30,
    maxRetry: 2,
    retryDelay: 1000,
    keyword: "斗罗大陆",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
      Accept:
        "application/json, text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    },
  },
};
