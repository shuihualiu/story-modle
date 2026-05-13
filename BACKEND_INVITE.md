# 邀请裂变（深度链接）后端改动说明

客户端已实现：分享卡片指向 **`https://www.haloutongxue.com/h5/invite/index.html?invite_code=<邀请人标识>`**（与现有「任务分享」落地页同域、同在 **`/h5/`** 目录下）；被邀请用户安装后通过 Universal Links / App Links 打开同一 URL，App 将 `invite_code` 暂存，在用户**微信登录成功**后调用后端绑定接口。

本文档描述后端需要提供的接口、数据表建议及域名侧配置（与现有业务兼容：未登录仍可打开 App，绑定失败不影响登录主流程）。

---

## 1. 接口：`POST /api/v1/invite/accept`

**鉴权**：需要与现有 API 一致的 Bearer Token（登录后调用）。

**请求 JSON**：

```json
{
  "invite_code": "<字符串，与落地页 query 一致>"
}
```

**语义**：

- 当前用户为被邀请人（invitee），`invite_code` 解析出邀请人（inviter）。
- 幂等：同一 invitee 重复提交应返回成功且不产生多条重复记录。
- 若 `invite_code` 无效、过期、或邀请人与被邀请人为同一用户，返回 **4xx** 及明确 `error` 字段（客户端仅打日志，不阻断使用）。

**成功响应示例（200）**：

```json
{
  "ok": true,
  "inviter_user_id": "<服务端用户ID>",
  "reward_applied": false
}
```

---

## 2. `invite_code` 生成规则（建议）

**推荐**：服务端为每位用户生成稳定、不可枚举的邀请码（如 8～12 位字母数字），存入用户表或独立映射表；客户端分享 URL 使用后端下发的码。

**当前客户端 MVP**：分享链接使用 `user_settings.server_user_id` 作为 `invite_code`，后端需校验：

- 该 ID 对应用户存在；
- 不能接受自己的邀请。

后续可切换为专用码而不改客户端路径协议（仍使用 query `invite_code`）。

---

## 3. 数据表建议（示例）

```sql
CREATE TABLE invite_referrals (
  id BIGSERIAL PRIMARY KEY,
  inviter_user_id TEXT NOT NULL,
  invitee_user_id TEXT NOT NULL,
  invite_code_snapshot TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (invitee_user_id)
);

CREATE INDEX idx_invite_referrals_inviter ON invite_referrals (inviter_user_id);
```

业务奖励（会员天数、金币等）可在绑定成功后异步发放，避免阻塞接口。

---

## 4. 静态资源部署（与现有共享 H5 同一目录）

仓库内文件：**`h5/invite/index.html`**

上传到服务器上与现有分享资源相同的一级目录，例如：

| 服务器路径（示例） | 对外 URL（示例） |
|-------------------|------------------|
| `/var/www/h5/invite/index.html` | `https://www.haloutongxue.com/h5/invite/index.html` |

与已有的 `share_yoga.png`、任务分享相关 H5 **并列在 `h5/` 下**，仅多一个子目录 **`invite/`**，**不会覆盖**原有共享功能页面。

微信开放平台「JS 接口安全域名」需包含 **`www.haloutongxue.com`**（若与任务分享一致，通常已配置）。

---

## 5. iOS Universal Links（AASA）

**签名说明**：Apple「个人免费」开发账号无法在 Provisioning Profile 中包含 **Associated Domains**，本地真机调试时不要往 `ios/Runner/Runner.entitlements` 写入 `com.apple.developer.associated-domains`，否则 Xcode 会报错。使用 **付费 Apple Developer Program** 上架或内测前，在 Xcode → **Signing & Capabilities** → **+ Capability** → **Associated Domains**，并添加例如：

`applinks:www.haloutongxue.com`、`applinks:haloutongxue.com`

（若邀请页与分享页同域，与线上一致即可。）

---

## 5.1 AASA 与「已有 `/h5/*`」的关系（重要）

若线上 **`apple-app-site-association`** 已配置为：

```json
"paths": [ "/h5/*" ]
```

则 **`/h5/invite/index.html` 已被该规则覆盖**，**无需**再单独增加 `/invite/*`；邀请页与任务分享落地页共用同一套 Universal Links 路径前缀即可。

若你尚未配置 AASA，可使用下面示例（**将 `appID` 改为真实 `TeamID.BundleID`，例如 `ABCDE12345.com.haloutongxue.reminder`**）：

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "<APPLE_TEAM_ID>.com.haloutongxue.reminder",
        "paths": [ "/h5/*" ]
      }
    ]
  }
}
```

说明：

- **`/h5/*`**：同时服务「原有共享 / 任务分享 H5」与 **`/h5/invite/`** 邀请页。
- 不建议再拆一套仅含 `"/invite/*"` 的配置（除非邀请页部署在网站根路径 `/invite/` 下）；当前客户端与文档统一为 **`/h5/invite/`**。

文件放置位置（与截图一致）：站点根下 **`.well-known/apple-app-site-association`**（或按苹果文档允许的等价路径），且 **Content-Type** 为 `application/json`（勿带 `.json` 后缀）。

---

## 6. Android App Links（assetlinks.json）

在 **`https://www.haloutongxue.com/.well-known/assetlinks.json`**（与 App Links 校验域名一致）提供 Digital Asset Links，**SHA256 指纹需与上架签名证书一致**：

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.haloutongxue.reminder",
      "sha256_cert_fingerprints": [
        "<RELEASE_KEY_SHA256>"
      ]
    }
  }
]
```

部署完成后，用户从未安装到安装再点击链接，应由系统打开 App 并带上完整 https URL（含 `invite_code`）。

---

## 7. 与现有登录接口的关系

现有 `POST /api/v1/auth/wechat` **无需变更**。绑定仅在客户端登录成功后额外调用 `POST /api/v1/invite/accept`。

若希望一次请求完成登录+绑定，可作为后续优化增加可选字段 `invite_code`（非本次必须）。

---

## 8. 测试清单

- [ ] 已登录用户点击邀请链接 → App 打开 → 自动调用 accept → pending 清除。
- [ ] 未登录用户点击链接 → 强制登录页 → 登录成功 → accept 成功。
- [ ] 重复点击同一邀请链接 → 幂等无重复奖励（按产品规则）。
- [ ] 伪造/过期 invite_code → 4xx，App 仍正常使用。
- [ ] 原有 `/h5/` 下任务分享链接仍可正常打开 App / H5。
