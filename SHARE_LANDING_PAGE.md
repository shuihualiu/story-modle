# 分享落地页与「加入计划事项」说明

## 流程概览

1. **App 内**：用户点击「微信」→ 调起微信选择聊天对象 → 分享出去的是**一张图片**（与分享页完全一致：`assets/icons/share_default.png` + 标题、日期、时间、主文案叠加）。
2. **落地页 H5**：与 App 使用**同一张图** `share_default.png`，通过 URL 参数（`title`、`mainText`、`date`、`time`、`tag`、`subtitle`）控制叠加内容，与 `ShareLinkPage` 展示一致；页上另有「加入计划事项」按钮。
3. **点击「加入计划事项」**：
   - 若**已安装**本 App：通过自定义 Scheme 或 Universal Link 唤起 App。
   - 若**未安装**：跳转到应用市场或官网下载页。

---

## 1. App 端已实现内容

- **分享图片**：点击微信分享的是「带叠加文字的卡片图」（`share_default.png` + 标题、日期、时间、主文案），与 `ShareLinkPage` 页面展示**完全一致**；通过构造参数 `title`、`mainText`、`date`、`time`（可选）、`tag`、`subtitle` 控制内容。
- **H5 落地页**：`docs/index.html` 使用同一张图，通过 query 参数（`title`、`mainText`、`date`、`time`、`tag`、`subtitle`）展示相同布局与文案。
- **常量配置**：在 `lib/core/constants/app_constants.dart` 中已预留：
  - `shareLandingPageBaseUrl`：落地页基础 URL（用于需要打开 H5 的场景）
  - `appStoreDownloadUrl` / `androidStoreDownloadUrl` / `officialWebsiteUrl`：未安装时跳转

---

## 2. 你需要完成的部分

### 2.1 部署 H5 落地页

- 将 `docs/index.html` 部署到你的 HTTPS 域名（如 `shareLandingPageBaseUrl`）。
- **必须将 `assets/icons/share_default.png` 一并部署到同目录或同源**，H5 中图片地址为 `share_default.png`（或通过 query `img=` 指定）。
- 打开 H5 时可通过 query 传参与 App 一致：`?title=xxx&mainText=18天&date=2026-02-17 星期二&time=24:00&tag=重要时刻&subtitle=xxx`。

### 2.2 落地页「加入计划事项」逻辑（判断是否安装并跳转）

在 H5 中点击「加入计划事项」时，建议流程：

1. **先尝试唤起 App**
   - **iOS**：使用 Universal Link（推荐）或自定义 Scheme（如 `reminderapp://join`）。
   - **Android**：使用 App Link / Intent 或自定义 Scheme（如 `reminderapp://join`）。
2. **若未安装**：一段时间内（如 2 秒）未离开当前页，则视为未安装，再跳转：
   - **iOS**：跳转 `appStoreDownloadUrl`（App Store 地址）。
   - **Android**：跳转 `androidStoreDownloadUrl`（应用宝等）或 `officialWebsiteUrl`。

示例逻辑（JavaScript）：

```javascript
function joinPlan() {
  var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  var scheme = 'reminderapp://join';           // 与 App 内配置的 URL Scheme 一致
  var appStoreUrl = 'https://apps.apple.com/app/idYOUR_APP_ID';
  var androidStoreUrl = 'https://yourdomain.com/download';

  if (isIOS) {
    window.location.href = scheme;
    setTimeout(function() {
      window.location.href = appStoreUrl;     // 未安装则跳 App Store
    }, 2000);
  } else {
    window.location.href = scheme;
    setTimeout(function() {
      window.location.href = androidStoreUrl; // 未安装则跳应用市场或官网
    }, 2000);
  }
}
```

Universal Link（iOS）需在服务端配置 `apple-app-site-association`，并在 Xcode 中关联域名；Android 应用宝等需使用对应商店的落地链接。

### 2.3 App 端配置「被唤起」

- **iOS**：在 `Info.plist` 中配置 URL Scheme（如 `reminderapp`），若用 Universal Link 还需配置 Associated Domains。
- **Android**：在 `AndroidManifest.xml` 中为对应 Activity 配置 `intent-filter`，处理 `reminderapp://join` 或你的 Scheme。

这样，已安装用户点击「加入计划事项」时即可打开 App。

---

## 3. 落地页 HTML（docs/index.html）

- 与 App 一致：使用 **share_default.png** 作为卡片背景，叠加**标题、日期、时间、主文案**，由 URL 参数控制。
- 参数与 `ShareLinkPage` 构造一致：`title`、`mainText`、`date`、`time`、`tag`、`subtitle`。
- 含「加入计划事项」按钮（唤端 / 未安装跳应用市场或官网）。

部署时请将 `assets/icons/share_default.png` 复制到与 `index.html` 同目录（或配置 `img=` 指向该图），并配置 `shareLandingPageBaseUrl`。

---

## 4. 小结

| 能力 | 说明 |
|------|------|
| 点击「微信」分享 | ✅ 已实现：分享**图片**（share_default + 标题/日期/时间/主文案），与页面一致 |
| H5 展示同一张图+参数 | ✅ 已实现：`docs/index.html` 使用 share_default.png + query 参数 |
| 「加入计划事项」唤起 App | ✅ 需在 App 配置 Scheme/Universal Link，H5 已含唤端逻辑 |
| 未安装跳转应用市场/官网 | ✅ 需在 H5 或常量中填写实际下载链接 |
