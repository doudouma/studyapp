# 100mini 番茄钟 Chrome 扩展设计

## 概述

基于 100mini 现有 Pomodoro 番茄钟功能设计一个独立的 Chrome 扩展，作为 100mini 网站伴侣。

## 定位

- 独立 Chrome 扩展（不与现有 100mini Hosting 扩展合并）
- 登录后可同步番茄数据到 100mini 账户
- 未登录时本地可用，但不保存记录到服务器

## 架构

### 组件

```
Service Worker (background.js)
├── Timer 状态机: idle → focus → shortBreak/longBreak → idle
├── chrome.alarms 每秒触发计时
├── chrome.notifications 完成时通知
├── chrome.storage.local 持久化状态
├── sync → POST /api/pomodoro/sessions
└── onStartup → 恢复未完成的计时

Popup (popup/)
├── popup.html — UI 布局
├── popup.css — 样式（380px 宽度）
├── popup.js — 渲染、控制、事件
└── 资源
    ├── manifest.json — extension manifest v3
    ├── icons/ — 16/48/128 图标
    ├── background.js — service worker
    └── sprites/ — 番茄动画帧 (可选本地缓存)
```

### 数据流

```
Popup 打开 ──读──→ chrome.storage.local ──→ 渲染状态
Popup 点击开始 ──发消息──→ Service Worker
    └→ SW 写 { status: 'running', endTime }
    └→ SW 创建 chrome.alarms({ periodInMinutes: 1/60 })

SW alarm 触发 ──→ 计算剩余时间 ──→ 更新 storage
SW 计时完成 ──→ chrome.notifications
          └─→ 如已登录: POST /api/pomodoro/sessions { duration }
          └─→ 更新 sessionCount，判断 4 倍数切长休/短休
          └─→ 自动进入休息倒计时
```

### chrome.storage.local 结构

```typescript
interface PomodoroState {
  mode: 'focus' | 'shortBreak' | 'longBreak'
  status: 'running' | 'paused' | 'idle'
  timeLeft: number          // 剩余秒数
  totalTime: number         // 本轮总秒数
  endTime: number | null    // 运行时的结束时间戳
  sessionCount: number      // 今日已完成番茄数
  lastSyncDate: string      // 'YYYY-MM-DD', 跨天重置
  settings: {
    focusDuration: number          // 默认 25
    shortBreakDuration: number     // 默认 5
    longBreakDuration: number      // 默认 15
    soundEnabled: boolean          // 默认 true
  }
}
```

### Timer 状态机

```
         [开始]         [完成/跳过]
idle ─────────→ focus ────────→ shortBreak ──→ focus
                                  ↑   │
                                  │   [sessionCount % 4 === 0]
                                  │   ↓
                                  └─ longBreak ──→ focus
```

- 每次 focus 完成 → sessionCount++
- sessionCount 为 4 的倍数 → 长休，否则短休
- 跨日重置 sessionCount

## UI

Popup 尺寸 380px，从上到下布局：

```
┌─────────────────────────────┐
│  100mini 番茄钟    [⚙️]    │  Header
├─────────────────────────────┤
│                             │
│       Sprite 动画           │  120x120
│      (frame_00→frame_38)   │
│                             │
│         25:00               │  大号倒计时
│       专注时间              │  模式标签
│                             │
│    [▶ 开始]   [↺ 重置]    │  控制按钮
│                             │
├─────────────────────────────┤
│  👤 user@example.com       │  已登录状态
│  🍅 今日番茄: 5            │  服务器同步
│  [📊 查看详情] → 打开网页  │
│  ───────────────────        │
│  [🔓 登录 100mini]         │  未登录状态
│  ⏳ 本地模式，不保存记录    │
└─────────────────────────────┘
```

### Sprite 动画映射

与网页端一致，按完成进度映射帧：

| 进度 (剩余/总时间) | 帧 | 阶段 |
|---|---|---|
| 100% | frame_00 | 种下种子 |
| 82% | frame_05 | 发芽 |
| 61% | frame_10 | 生长 |
| 43% | frame_17 | 开花 |
| 22% | frame_28 | 小番茄 |
| 0% | frame_38 | 成熟 |

图片从 `https://100mini.com/spritesheet2/frame_XX.webp` 加载。

## 复用的 API

| 端点 | 方法 | 用途 | 认证 |
|---|---|---|---|
| `/api/me` | GET | 检查登录状态 | Cookie |
| `/api/pomodoro/today-count` | GET | 今日/总番茄数 | Cookie |
| `/api/pomodoro/sessions` | POST | 上报完成的番茄 | Cookie |

body: `{ duration: number }`

## 通知

- 专注完成: "🍅 专注结束！该休息了"
- 休息完成: "☕ 休息结束，开始新一轮专注吧"
- 点击通知 → 打开扩展 popup

## 设置面板

⚙️ 按钮打开设置浮层：
- 专注时长: 15/20/25/30/40/50 min
- 短休时长: 3/5/10 min
- 长休时长: 10/15/20/30 min
- 提示音开关

## 权限

```json
{
  "permissions": ["alarms", "notifications", "storage"],
  "host_permissions": ["https://100mini.com/*"]
}
```

## 与现有扩展的差异

| 维度 | 现有 100mini Hosting | 新的番茄钟 |
|---|---|---|
| 用途 | 上传托管 HTML 页面 | Pomodoro 计时 |
| Service Worker | contextMenu + 消息转发 | 后台计时 + 通知 |
| 权限 | contextMenus, activeTab | alarms, notifications, storage |

## 文件结构

```
chrome-extension-pomodoro/
├── manifest.json
├── background.js          # Service Worker
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## 未包含的范围 (YAGNI)

- 离线队列同步（网络恢复后批量上传）
- 多设备同步
- 自定义提示音上传
- 新标签页替换
- 页面级计时统计图表
