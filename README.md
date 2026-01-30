# OuonnkiTV 视频源自动转换项目

本项目自动从 [LunaTV-config](https://github.com/hafrey1/LunaTV-config) 获取每日检测的视频源配置，并将其转换为 [OuonnkiTV](https://github.com/Ouonnki/OuonnkiTV) 可用的格式。

## 特别感谢

- **[LunaTV-config](https://github.com/hafrey1/LunaTV-config)** - 提供每日自动检测和更新的高质量视频源配置
- **[OuonnkiTV](https://github.com/Ouonnki/OuonnkiTV)** - 优秀的视频搜索与播放前端，支持自定义视频源

## 自动更新

通过 GitHub Actions 每天北京时间早上 6 点（UTC 22:00）自动执行：

1. **下载** - 从 LunaTV-config 获取最新的视频源配置
2. **转换** - 将 LunaTV 格式转换为 OuonnkiTV 兼容的 JSON 格式
3. **过滤** - 生成三种不同版本的配置文件
4. **推送** - 将更新后的文件提交到本仓库

## 生成的配置文件

所有配置文件位于 `tv_source/OuonnkiTV/` 目录。

### clean-no-adult.json（推荐）

无成人内容版，过滤了标记注释和 🔞 的视频源。

```
https://raw.githubusercontent.com/ZhuBaiwan-oOZZXX/OuonnkiTV-Source/refs/heads/main/tv_source/OuonnkiTV/clean-no-adult.json
```

### clean.json

清洁版，过滤了标记注释的视频源。

```
https://raw.githubusercontent.com/ZhuBaiwan-oOZZXX/OuonnkiTV-Source/refs/heads/main/tv_source/OuonnkiTV/clean.json
```

### raw.json

完整视频源，包含所有视频源。

```
https://raw.githubusercontent.com/ZhuBaiwan-oOZZXX/OuonnkiTV-Source/refs/heads/main/tv_source/OuonnkiTV/raw.json
```
