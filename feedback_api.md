## 意见反馈后端接口文档（App -> Server）

### 1）提交意见反馈（带图片，客户端生成 remote_id）

- **方法**：`POST`
- **路径**：`/api/v1/feedbacks`
- **Content-Type**：`multipart/form-data`
- **鉴权**：建议复用现有 `Authorization: Bearer <token>`（若业务允许匿名，可不强制）

#### 请求参数（FormData）

- **remote_id**：`string`，客户端本地生成的全局唯一ID（例如 `fb_<uuid>`）
- **problem_desc**：`string`，问题描述（可为空，但建议至少有文字或图片之一）
- **images**：`file[]`，图片文件数组，**最多 2 张**
  - 字段名固定为 `images`
  - 单张图片建议 <= 10MB（可复用 AppConstants.maxImageSize）

#### 响应（200）

```json
{ "success": true }
```

#### 常见错误

- **400**：参数不合法（超过2张、无内容等）
- **401**：未授权（如启用鉴权）
- **413**：图片过大

---

### 2）批量获取官方回复（每次打开反馈页时拉取）

- **方法**：`POST`
- **路径**：`/api/v1/feedbacks/replies`
- **Content-Type**：`application/json`
- **鉴权**：同上

#### 请求体

```json
{
  "remote_ids": ["fb_123", "fb_456"]
}
```

- `remote_ids` 全部来自本地 `feedbacks.remote_id`（客户端创建时即生成并持久化）

#### 响应（200）

```json
[
  {
    "remote_id": "fb_123",
    "reply_text": "我们已收到，会在下个版本优化。",
    "reply_updated_at": 1710001234
  },
  {
    "remote_id": "fb_456",
    "reply_text": "该问题已修复，感谢反馈。",
    "reply_updated_at": 1710005678
  }
]
```

#### 说明

- 服务端可只返回有回复/有更新的条目；客户端按 `remote_id` 更新本地 `feedbacks.reply_text/reply_updated_at`。
- `reply_updated_at` 建议为秒级 Unix 时间戳，便于客户端比对与展示。

---

### 3）删除意见反馈（撤回）

- **方法**：`DELETE`
- **路径**：`/api/v1/feedbacks/{remote_id}`
- **Content-Type**：`application/json`
- **鉴权**：同上

#### 路径参数

- **remote_id**：`string`，服务端反馈记录ID

#### 响应（200）

```json
{
  "success": true
}
```

#### 常见错误

- **401**：未授权
- **404**：反馈记录不存在
- **409**：记录状态不允许删除（如已归档）

---

## 服务端改造逻辑（按 remote_id 唯一处理）

### A. 数据模型与约束

- 在反馈表新增/确保字段：`remote_id`（`VARCHAR`/`TEXT`，**唯一索引 UNIQUE**，不可为空）
- 业务侧所有读写删除均以 `remote_id` 为主键语义，不再依赖服务端自增 id 给客户端回写

### B. 保存接口（POST /api/v1/feedbacks）

- 入参必须包含 `remote_id`
- 服务端执行 **upsert(remote_id)**：
  - 若 `remote_id` 不存在：创建新反馈
  - 若 `remote_id` 已存在：按幂等更新（覆盖问题描述/图片等）
- 返回 `{ "success": true }` 即可

### C. 拉取接口（POST /api/v1/feedbacks/replies）

- 按 `remote_ids` 批量查询回复信息并返回
- 返回项至少包含：`remote_id`、`reply_text`、`reply_updated_at`
- 客户端据此按 `remote_id` 回写本地表

### D. 删除接口（DELETE /api/v1/feedbacks/{remote_id}）

- 按 `remote_id` 删除（或软删除）对应反馈
- 若不存在返回 404（或 success=false，按你们网关规范）
- 该接口应天然幂等：重复删除同一 `remote_id` 不应影响主流程

