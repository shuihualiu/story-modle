# 分享链接跳转 App 未显示分享页 - 排查说明

## 日志标签说明

运行 App 后，在控制台搜索 `[DeepLink]`，可根据以下标签定位问题：

| 标签 | 含义 |
|------|------|
| `[DeepLink][main]` | main() 中获取冷启动链接：uni_links / app_links 的返回值 |
| `[DeepLink][coldStartShareUri set]` | 已把冷启动链接写入 holder，将作为首屏 |
| `[DeepLink][ReminderApp]` | 首屏路由选择：`shareFromDeeplink` 或 `home` |
| `[DeepLink][shareFromDeeplink]` | 路由生成时：是否从 holder 读到 Uri、或回退首页 |
| `[DeepLink][ensureDeepLink]` | build 内 getInitialUri / 600ms 延迟重试的结果 |
| `[DeepLink][stream]` | uriLinkStream 收到链接（从后台被链接唤起时） |
| `[DeepLink][handleUri]` | 收到 Uri 后：是否忽略、是否 push、navigator 是否就绪 |
| `[DeepLink][isShareLinkUri]` | 某 Uri 是否被识别为「分享链接」及原因 |

## 常见情况对照

1. **所有 getInitialUri / getInitialLink 都为 null**  
   → 系统未把链接交给 Flutter，需检查：  
   - iOS：Associated Domains、Universal Link 配置  
   - Android：intent-filter (data scheme/host/path)  
   - 微信内：开放标签「网页跳转移动应用」是否关联、是否用正式包  

2. **有 Uri 但 isShareLinkUri 为 false**  
   → 看 `[DeepLink][isShareLinkUri]` 的 uri/hostMatch/pathMatch/hasShareParams，确认域名是否为 `haloutongxue.com` / `www.haloutongxue.com`，路径是否含 `/h5` 或带 `scene`/`title` 等参数。  

3. **coldStartShareUri 有值，但 shareFromDeeplink 回退到首页**  
   → 说明首屏路由请求时 holder 已被清空或未写入，检查是否先走了其他路由、或 holder 被意外置空。  

4. **handleUri 里 navigatorState==null 或 达到最大重试**  
   → 仅影响「非首屏」的 push 路径（例如从后台被链接唤起）；首屏已改为 shareFromDeeplink 路由，不依赖 navigator 就绪。  

## 当前逻辑简述

- **冷启动**：main() 内用 uni_links 多次 + app_links 一次取链接；若得到分享链接则写入 `coldStartShareUri`，首屏路由设为 `shareFromDeeplink`，首屏即展示分享页。  
- **从后台被链接唤起**：依赖 `uriLinkStream` 收到 Uri，再 push 分享页（带重试）。  
- 分享链接判定：`isShareLinkUri()`（域名 + path/参数），见 `lib/core/deep_link_holder.dart`。
