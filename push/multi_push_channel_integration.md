# 多推送通道适配模块（FCM + JPush）

## 目录结构

```text
lib/services/push/
  push_channel.dart
  push_message.dart
  push_service.dart
  push_region_detector.dart
  unified_push_service.dart
  adapters/
    fcm_push_adapter.dart
    jpush_push_adapter.dart
```

## 已接入点（不破坏现有业务）

- `lib/app/di/service_locator.dart`
  - 注册 `PushRegionDetector`
  - 注册 `UnifiedPushService`
- `lib/main.dart`
  - 保留原 `FcmNotificationService.initialize()` 不变
  - 新增 `UnifiedPushService.init()`（异步，不阻塞 UI）
  - 登录态恢复后同步 `updateCurrentUserId()`
- `lib/pages/profile/login_page.dart`
  - 登录成功后同步 `UnifiedPushService.updateCurrentUserId()`

> 当前策略：**新模块并行接入**，不替换原 FCM 业务链路，降低回归风险。

---

## 统一接口设计

`PushService` 统一了以下接口：

- `init()`
- `getToken()`
- `onMessage()`
- `onNotificationClick()`
- `updateCurrentUserId(String? userId)`

其中：

- `FcmPushAdapter`：封装 FCM 的 token、前台消息、点击事件。
- `JPushPushAdapter`：通过 MethodChannel/EventChannel 对接原生 JPush（Flutter 层可编译、可回退）。
- `UnifiedPushService`：按地区选择通道，并统一上报 token。

---

## 通道选择逻辑

`PushRegionDetector` 当前实现：

1. 先请求后端 `/api/push/region`（推荐，支持动态策略）
2. 失败时用 `Platform.localeName` 兜底（`zh_CN/_CN` 视为中国大陆）

规则：

- 中国大陆 -> `jpush`
- 其他地区 -> `fcm`

---

## Token 上报协议（后端接口文档）

### 1) 地区识别（可选但推荐）

- **Method**: `GET`
- **Path**: `/api/push/region`
- **Response 示例**:

```json
{
  "code": 0,
  "region": "CN"
}
```

`region` 建议值：`CN | OTHER`

### 2) 推送注册（必需）

- **Method**: `POST`
- **Path**: `/api/push/register`
- **Request Body**:

```json
{
  "userId": "u_123",
  "deviceId": "4ddf0f8c-4d35-4f6d-8184-6ad6f3320f51",
  "platform": "android",
  "pushChannel": "fcm",
  "pushToken": "xxxxxx"
}
```

字段说明：

- `userId`: 用户 ID
- `deviceId`: 设备唯一 ID（本地持久化）
- `platform`: `android | ios`
- `pushChannel`: `fcm | jpush`
- `pushToken`: `fcmToken | registrationId`

### 3) 透传消息数据约定（建议）

服务端下发 data payload 示例：

```json
{
  "type": "task_reminder",
  "planId": "p_10001",
  "targetRoute": "/",
  "ext": {
    "source": "push"
  }
}
```

---

## 通知点击行为

`UnifiedPushService` 中已统一处理点击事件：

- 默认跳转到“计划页”（`AppRoutes.home`）
- 后续可根据 data 中 `targetRoute` 做精细化路由

---

## Android JPush Native Bridge（示例）

> Flutter 侧 `JPushPushAdapter` 依赖以下通道：
>
> - MethodChannel: `com.reminder.push/jpush_method`
> - EventChannel: `com.reminder.push/jpush_message`
> - EventChannel: `com.reminder.push/jpush_click`

在 Android `MainActivity`（Kotlin）可按如下思路接入（示例）：

```kotlin
// 伪代码示例：请按你项目的 JPush SDK 版本调整 API 名称
class MainActivity : FlutterActivity() {
    private val methodChannelName = "com.reminder.push/jpush_method"
    private val messageEventName = "com.reminder.push/jpush_message"
    private val clickEventName = "com.reminder.push/jpush_click"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, methodChannelName)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "init" -> {
                        // JPushInterface.setDebugMode(true)
                        // JPushInterface.init(applicationContext)
                        result.success(null)
                    }
                    "getRegistrationId" -> {
                        // val rid = JPushInterface.getRegistrationID(applicationContext)
                        val rid = ""
                        result.success(rid)
                    }
                    else -> result.notImplemented()
                }
            }

        // EventChannel 部分：把透传消息和通知点击分别推送给 Flutter
        // messageEvent -> { title, body, data: {...} }
        // clickEvent   -> { title, body, data: {...} }
    }
}
```

---

## 可扩展性

后续新增厂商（如华为、小米、APNs Vendor）只需：

1. 新增 `XXXPushAdapter implements PushService`
2. 在 `UnifiedPushService` 增加选择策略
3. 复用同一套 `reportCurrentToken()` 上报接口

