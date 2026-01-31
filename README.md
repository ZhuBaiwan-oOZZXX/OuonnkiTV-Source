# OuonnkiTV Source

为 [OuonnkiTV](https://github.com/Ouonnki/OuonnkiTV) 提供视频源配置。

## 配置文件

- 轻量版（lite.json）：仅包含 API 可访问且搜索成功的非成人视频源。

```
https://raw.githubusercontent.com/ZhuBaiwan-oOZZXX/OuonnkiTV-Source/refs/heads/main/tv_source/OuonnkiTV/lite.json
```

- 完整版（full.json）：包含所有 API 可访问且搜索成功的视频源（包括成人内容）。

```
https://raw.githubusercontent.com/ZhuBaiwan-oOZZXX/OuonnkiTV-Source/refs/heads/main/tv_source/OuonnkiTV/full.json
```

## 工作流程

通过四个脚本按顺序处理视频源，在每天北京时间早上 6 点自动执行并推送至仓库：

| 脚本                         | 功能                  | 输出                      |
| ---------------------------- | --------------------- | ------------------------- |
| 01_download_lunatv_config.js | 下载 LunaTV 原始配置  | LunaTV-config.json        |
| 02_process_lunatv_config.js  | 清理配置数据          | LunaTV-processed.json     |
| 03_check_video_sources.js    | 检测源可用性          | LunaTV-check-history.json |
| 04_convert_ouonnkitv.js      | 转换为 OuonnkiTV 格式 | full.json, lite.json      |

### 检测说明

- 使用代理访问 API（避免网络限制）
- 测试关键词："斗罗大陆"
- 搜索状态：`success`（成功）、`no_results`（无结果）、`mismatch`（结果不匹配）、`search_failed`（搜索失败）
- 保留最近 30 条检测历史记录

## 特别感谢

- **[LunaTV-config](https://github.com/hafrey1/LunaTV-config)** - 提供每日自动检测和更新的高质量视频源配置
- **[OuonnkiTV](https://github.com/Ouonnki/OuonnkiTV)** - 优秀的视频搜索与播放前端，支持自定义视频源
