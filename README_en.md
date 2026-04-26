# OuonnkiTV Source

English | [简体中文](README.md)

Convert MoonTV/LunaTV video source configuration to [OuonnkiTV](https://github.com/Ouonnki/OuonnkiTV) video source configuration.

> [!NOTE]
> This document is AI-translated from the [Chinese version](README.md).

## Configuration Files

| File Name         | Description                                                                       | Original Link                                                                                                       | Mirror Link 1                                                                                                                            | Mirror Link 2                                                                                                                          |
| ----------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| lite.json         | Lite version: Filtered video sources (no adult content, top 15 by response speed) | [Original](https://raw.githubusercontent.com/Yesbaiwan/OuonnkiTV-Source/main/tv_source/OuonnkiTV/lite.json)         | [Mirror 1](https://gh-proxy.org/https://raw.githubusercontent.com/Yesbaiwan/OuonnkiTV-Source/main/tv_source/OuonnkiTV/lite.json)         | [Mirror 2](https://ghfast.top/https://raw.githubusercontent.com/Yesbaiwan/OuonnkiTV-Source/main/tv_source/OuonnkiTV/lite.json)         |
| full-noadult.json | Full clean version: Filtered video sources (no adult content)                     | [Original](https://raw.githubusercontent.com/Yesbaiwan/OuonnkiTV-Source/main/tv_source/OuonnkiTV/full-noadult.json) | [Mirror 1](https://gh-proxy.org/https://raw.githubusercontent.com/Yesbaiwan/OuonnkiTV-Source/main/tv_source/OuonnkiTV/full-noadult.json) | [Mirror 2](https://ghfast.top/https://raw.githubusercontent.com/Yesbaiwan/OuonnkiTV-Source/main/tv_source/OuonnkiTV/full-noadult.json) |
| full.json         | Full version: Filtered video sources (includes adult content)                     | [Original](https://raw.githubusercontent.com/Yesbaiwan/OuonnkiTV-Source/main/tv_source/OuonnkiTV/full.json)         | [Mirror 1](https://gh-proxy.org/https://raw.githubusercontent.com/Yesbaiwan/OuonnkiTV-Source/main/tv_source/OuonnkiTV/full.json)         | [Mirror 2](https://ghfast.top/https://raw.githubusercontent.com/Yesbaiwan/OuonnkiTV-Source/main/tv_source/OuonnkiTV/full.json)         |
| adult.json        | Adult version: Adult content video sources only                                   | [Original](https://raw.githubusercontent.com/Yesbaiwan/OuonnkiTV-Source/main/tv_source/OuonnkiTV/adult.json)        | [Mirror 1](https://gh-proxy.org/https://raw.githubusercontent.com/Yesbaiwan/OuonnkiTV-Source/main/tv_source/OuonnkiTV/adult.json)        | [Mirror 2](https://ghfast.top/https://raw.githubusercontent.com/Yesbaiwan/OuonnkiTV-Source/main/tv_source/OuonnkiTV/adult.json)        |

## Running Locally

### One-Click Start

```bash
node start.js
```

Execute all processing steps in one go: Download → Process → Check → Convert.

### Step-by-Step Execution

Step-by-step execution requires running each script in the following order:

| Script                       | Function                        | Output                                              |
| ---------------------------- | ------------------------------- | --------------------------------------------------- |
| 01_download_lunatv_config.js | Download LunaTV original config | LunaTV-config.json                                  |
| 02_process_lunatv_config.js  | Clean configuration data        | LunaTV-processed.json                               |
| 03_check_video_sources.js    | Check source availability       | LunaTV-check-result.json                            |
| 04_convert_ouonnkitv.js      | Convert to OuonnkiTV format     | full.json, full-noadult.json, lite.json, adult.json |

### Configuration Guide

Edit `config.js` to customize the following settings:

```javascript
module.exports = {
  skipSslVerification: false,  // Whether to skip SSL certificate verification
  logToFile: true,             // Whether to record detailed logs to file

  proxy: {
    url: "",        // Proxy URL, leave empty to disable
    download: true, // Use proxy when downloading video sources
    check: true,    // Use proxy when searching/checking
    play: false,    // Use proxy when testing playback speed
  },

  check: {
    timeout: 5000,        // Request timeout (milliseconds)
    concurrent: 20,       // Concurrent search requests
    maxRetry: 2,          // Number of retries on failure
    retryDelay: 1000,     // Retry interval (milliseconds)
    keyword: "斗罗大陆",   // Search keyword (normal video sources)
    adultKeyword: "三上悠", // Search keyword (adult video sources), leave empty to use keyword
    headers: { ... },     // HTTP request headers
  },

  playSpeedTest: {
    enable: true,       // Whether to enable playback speed test (false means search check only)
    episodeCount: 3,    // Maximum number of episodes to test per video source
    duration: 5000,     // Duration of each speed test (milliseconds)
    concurrent: 3,      // Concurrent speed test requests
  },
};
```

After filling in the proxy URL, requests will be made using `https://{proxy.url}/originalURL`. Please ensure the proxy URL supports this format. Leave empty to disable.

## Automatic Updates

GitHub Actions automatically runs `start.js` and pushes updates to the repository at 22:00 UTC every day.

## Thanks

- **[LunaTV-config](https://github.com/hafrey1/LunaTV-config)** - Provides daily automatic detection and updates of high-quality video source configurations
- **[OuonnkiTV](https://github.com/Ouonnki/OuonnkiTV)** - Excellent video search and playback frontend with support for custom video sources
