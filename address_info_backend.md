# 收货地址（`adress_info`）服务端对接说明

本文档供后端实现参考，与客户端本地表名、接口路径保持一致。客户端使用 JWT（与其它 `/api/v1` 接口相同的鉴权方式）调用。

## 一、REST 接口

基础路径前缀与网关一致（与 `ApiEndpoints` 中其它接口相同）。以下为约定路径（已在客户端 `lib/core/network/endpoints.dart` 中定义为 `ApiEndpoints.userAddressesBase = '/api/v1/user/addresses'`）。

### 1. 创建或更新（Upsert）

- **方法 / 路径**：`PUT /api/v1/user/addresses/{id}`
- **路径参数**：`id` — 客户端生成的 UUID（URL 需正确编码）
- **请求体（JSON）**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 与路径一致，客户端地址主键 |
| `address` | string | 详细地址 |
| `recipient_name` | string | 收货人姓名 |
| `phone_number` | string | 手机号 |
| `created_at` | int64 | Unix 时间戳（秒），客户端首次创建时间 |
| `updated_at` | int64 | Unix 时间戳（秒），客户端最后更新时间 |

- **语义**：同一登录用户下，以 `id` 唯一；不存在则插入，存在则更新字段（服务端可按 `updated_at` 做幂等/冲突处理）。
- **响应**：`200` / `201` 即可；错误时返回 JSON，`message` / `error` / `detail` 等字段可被客户端解析展示日志。

### 2. 删除

- **方法 / 路径**：`DELETE /api/v1/user/addresses/{id}`
- **路径参数**：`id` — 与 Upsert 使用的 id 一致
- **语义**：删除当前登录用户名下该 `id` 的地址；若已不存在可返回 `204` 或 `200`（幂等删除）。

---

## 二、服务端数据表建议（示例）

表名可按团队规范命名（如 `user_addresses`）。以下为与客户端字段一一对应的示例（PostgreSQL 风格）。

```sql
CREATE TABLE user_addresses (
  id TEXT PRIMARY KEY,                    -- 客户端 UUID
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  created_at BIGINT NOT NULL,             -- Unix 秒
  updated_at BIGINT NOT NULL,
  UNIQUE (user_id, id)
);

CREATE INDEX idx_user_addresses_user_updated
  ON user_addresses (user_id, updated_at DESC);
```

说明：

- `user_id` 从网关解析当前登录用户写入，**禁止**信任请求体中的用户标识。
- `id` 使用客户端传入的 UUID，与用户维度组合唯一。

---

## 三、客户端本地库（仅供参考）

- 表 `adress_info`：本地缓存与离线编辑。
- 字段 `server_sync_status`：`pending` / `synced` / `failed`，用于补传。
- 表 `adress_info_delete_queue`：本地已删但远端删除失败时的 `id` 队列，冷启动与延迟重试会继续调用 `DELETE`。

后端只需实现上述 REST 与存储，无需感知客户端队列细节。
