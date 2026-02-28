# 分享落地页与「加入计划事项」说明

## 流程概览

1. **App 内**：用户点击「微信」→ 调起微信选择聊天对象 → 分享出去的是**链接卡片**（标题 + 缩略图），缩略图使用当前分享页的插画图。
2. **对方**：在微信里收到卡片，**点击卡片**会打开你配置的 H5 落地页（如设计图中的「共同计划事项提醒」页面）。
3. **落地页**：展示插画 + 文案 + **「加入计划事项」**按钮。
4. **点击「加入计划事项」**：
   - 若**已安装**本 App：通过自定义 Scheme 或 Universal Link 唤起 App。
   - 若**未安装**：跳转到应用市场（iOS App Store / Android 应用宝等）或官网下载页。

上述功能**可以实现**，需完成以下配置与部署。

---

## 1. App 端已实现内容

- **微信分享**：已支持「分享链接 + 缩略图」。当在 `ShareLinkPage` 中传入 `shareLandingUrl`（或在 `app_constants.dart` 中配置 `shareLandingPageBaseUrl` 并由各详情页传入）时，分享到微信的是**网页链接**，缩略图为分享卡片图，对方点击即打开该 URL。
- **常量配置**：在 `lib/core/constants/app_constants.dart` 中已预留：
  - `shareLandingPageBaseUrl`：落地页基础 URL（需改为你实际部署的域名）
  - `appStoreDownloadUrl`：iOS App Store 链接
  - `androidStoreDownloadUrl`：Android 应用市场链接
  - `officialWebsiteUrl`：官网（兜底）

---

## 2. 你需要完成的部分

### 2.1 部署 H5 落地页

- 将落地页部署到**与微信分享域名一致**的 HTTPS 域名下（微信要求分享链接为 HTTPS）。
- 落地页 URL 应与 `shareLandingPageBaseUrl` 一致（例如 `https://yourdomain.com/share`），这样 App 分享出去的链接才会正确打开该页。

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

## 3. 示例落地页 HTML

项目在 `docs/share_landing_page_example.html` 中提供了一份最小示例，包含：

- 标题「共同计划事项提醒」
- 插画占位区域与说明文案
- 「加入计划事项」按钮及上述唤端 + 未安装跳转应用市场/官网的逻辑

你可基于该文件修改样式与文案，部署到自己的域名后，将 `app_constants.dart` 中的 `shareLandingPageBaseUrl` 改为该页面 URL 即可。

---

## 4. 小结

| 能力 | 说明 |
|------|------|
| 点击「微信」分享 | ✅ 已实现：分享链接+缩略图，对方看到卡片 |
| 对方点击卡片打开落地页 | ✅ 需你部署 H5 并配置 `shareLandingPageBaseUrl` |
| 「加入计划事项」唤起 App | ✅ 需在 H5 中写唤端逻辑，并在 App 配置 Scheme/Universal Link |
| 未安装跳转应用市场/官网 | ✅ 需在 H5 中写跳转逻辑，并填写 `appStoreDownloadUrl` / `androidStoreDownloadUrl` |

整体流程可以实现，按上述步骤配置并部署即可。
