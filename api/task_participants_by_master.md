## 接口：按分享源任务查询参与者

用于“加入分享-习惯（habit）”场景：在**创建/加入后立刻**获取该分享源任务（`master_task_id`）的完整参与者列表，避免依赖同步链路（`sync-trigger`）而出现“关联关系还没生成、短时间查不到”的问题。

### 1) HTTP

- **Method**：`GET`
- **Path**：`/api/v1/task-participants/by-master`

### 2) 请求参数（Query）

- **master_task_id** `string`（必填）
  - 分享源任务 ID（邀请方的任务 ID）
- **task_type** `string`（必填）
  - 任务类型：`habit`（当前仅前端在 habit 加入分享时调用）
- **user_id** `string`（建议必填）
  - 当前用户的服务端 user_id（用于鉴权/审计/限流；项目非 Supabase 时通常仍需要）

示例：

- `GET /api/v1/task-participants/by-master?master_task_id=xxx&task_type=habit&user_id=yyy`

### 3) 响应（200）

```json
{
  "master_task_id": "02fec8b0-1802-4550-adac-63128d93f612",
  "task_type": "habit",
  "participants": [
    {
      "user_id": "bedd7c35-7544-4d09-9d89-0156c7b54a2f",
      "name": "张三",
      "avatar_path": "https://cdn.example.com/a.png",
      "created_at": 1773816964
    }
  ],
  "server_time": 1773817000
}
```

字段说明：

- **participants[]**
  - **user_id** `string`：参与者服务端用户 ID
  - **name** `string`：昵称
  - **avatar_path** `string`：头像 URL/路径（可空字符串）
  - **created_at** `number`：参与时间（秒）；如无可由后端填当前时间
- **server_time** `number`：服务端当前时间（秒，可选）

### 4) 错误响应（示例）

- `400`：缺少参数 / 参数不合法
- `401/403`：无权限
- `404`：master_task_id 不存在或无可见参与者

```json
{ "message": "invalid master_task_id" }
```

### 5) 前端使用说明

前端在`habit`加入分享时会先尝试走`/api/v1/sync-trigger (mode=pull)`拉取`task_participant` ops。
若返回 `ops: []`，则自动调用本接口兜底，并把返回的 `participants` **仅落库到本次 join 生成的本地任务**：

- 本地表：`task_participants`
- 写入规则：
  - `task_id = localTaskId`（本地新建的 habit 任务 ID）
  - `master_task_id = master_task_id`
  - `task_type = habit`
  - `user_id = participants[i].user_id`（以字符串写入，配合去重时的 `CAST(user_id AS TEXT)`）

