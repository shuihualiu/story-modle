# 会员记录接口文档

与 PostgreSQL 表 `membership_records` 对齐，供客户端「我的 → 会员实效」与「会员记录」页拉取并缓存到本地 SQLite。

## 表结构（服务端）

```sql
CREATE TABLE IF NOT EXISTS membership_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  is_member BOOLEAN DEFAULT false,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  order_id UUID REFERENCES membership_orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

建议对 `membership_records(user_id, updated_at DESC)` 建索引。

---

## 1. 拉取当前用户会员记录列表

| 项目 | 说明 |
|------|------|
| **Method** | `GET` |
| **Path** | `/api/v1/user/membership-records` |
| **鉴权** | 必须。`Authorization: Bearer <access_token>`；用户身份以 JWT / `auth.uid()` 为准，**不得**信任客户端传入的 `user_id` 查询他人数据。 |

### 请求

无 Query / Body 参数（用户由 Token 解析）。

可选请求头（与项目其它接口一致）：

| Header | 说明 |
|--------|------|
| `Authorization` | `Bearer <token>` |
| `X-User-Id` | 可选，服务端用户 UUID，仅用于联调日志 |

### 成功响应 `200`

```json
{
  "ok": true,
  "data": {
    "records": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": "660e8400-e29b-41d4-a716-446655440001",
        "is_member": true,
        "start_date": "2026-06-21T00:00:00.000Z",
        "end_date": "2027-06-21T00:00:00.000Z",
        "order_id": "770e8400-e29b-41d4-a716-446655440002",
        "product_type": "yearly",
        "bug_item": 1,
        "coin": 0,
        "created_at": "2026-06-21T10:00:00.000Z",
        "updated_at": "2026-06-21T10:00:00.000Z"
      }
    ]
  }
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `ok` | boolean | 是 | `true` 表示成功 |
| `data.records` | array | 是 | 记录列表，按 `start_date` 或 `created_at` **降序**（最新在前） |
| `records[].id` | string (UUID) | 是 | 主键，客户端写入本地 `remote_id` |
| `records[].user_id` | string (UUID) | 是 | 所属用户 |
| `records[].is_member` | boolean | 是 | 该条记录是否表示有效会员区间 |
| `records[].start_date` | string (ISO8601) \| null | 否 | 会员开始时间 |
| `records[].end_date` | string (ISO8601) \| null | 否 | 会员结束时间；「会员实效」展示取当前用户 `is_member=true` 且未过期记录中 **最大的 `end_date`** |
| `records[].order_id` | string (UUID) \| null | 否 | 关联 `membership_orders.id` |
| `records[].product_type` | string | 否 | 来自订单联表，便于客户端展示图标。建议枚举：`continuous_yearly` / `continuous_quarterly` / `three_month` / `monthly` / `yearly` / `coin` |
| `records[].bug_item` | int | 推荐 | 购买类型展示码，客户端**原样写入**本地 `membership_records.bug_item`：`1` 连续包年、`2` 连续包季、`3` 3月会员、`4` 单月会员、`5` 金币购买。展示图标用 `payment_flag_N`（N 与 bug_item 不一一对应）：`1→flag_2` 豹子、`2→flag_3` 猫、`3→flag_3` 猫、`4→flag_4` 老鼠、`5→flag_5` 金币；购买页 `payment_1`/`flag_1` 为永久 SVIP/狮子，无 bug_item 枚举 |
| `records[].coin` | int | 否 | 金币购买时的金币数，默认 `0` |
| `records[].created_at` | string (ISO8601) | 是 | 创建时间 |
| `records[].updated_at` | string (ISO8601) | 是 | 更新时间；客户端仅当远端 `updated_at` 更新时才覆盖本地行 |

时间字段均使用 **UTC ISO8601**；客户端会转换为 Unix 秒存入 SQLite。

### 错误响应

| HTTP | `ok` | 说明 |
|------|------|------|
| `401` | `false` | 未登录或 Token 失效 |
| `403` | `false` | 无权限 |
| `500` | `false` | 服务端错误 |

错误体示例：

```json
{
  "ok": false,
  "message": "unauthorized"
}
```

### 服务端实现要点

1. `SELECT * FROM membership_records WHERE user_id = $currentUserId ORDER BY start_date DESC NULLS LAST, created_at DESC`
2. 可选 `LEFT JOIN membership_orders o ON o.id = r.order_id`，在 JSON 中附带 `product_type`（`o.product_type`）
3. RLS：`auth.uid() = user_id`

### 客户端行为

1. 进入「会员记录」或点击「会员实效」时，**先读本地** `membership_records`，再 **异步** 调用本接口
2. 按 `id`（`remote_id`）Upsert；有变更则刷新列表与「会员实效」日期
3. 接口失败时不影响已展示的本地数据
