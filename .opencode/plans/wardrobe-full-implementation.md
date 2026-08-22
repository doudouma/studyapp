# Wardrobe 完整功能实现计划

## 概述

参考 wardrobe-main 项目，在 studyapp 中实现完整的 AI 驱动服装检测、提取和管理功能，使用 Cloudflare AI 替代 OpenAI。

## 技术架构

| 组件 | wardrobe-main | studyapp 实现 |
|------|---------------|---------------|
| AI 视觉分析 | OpenAI GPT-5.4-mini | `@cf/meta/llama-3.2-11b-vision-instruct` |
| 图片提取 | OpenAI Images Edits API | Cloudflare Images API `segment=foreground` |
| 数据存储 | 本地 JSON 文件 | Cloudflare D1 + R2 |
| 图像处理 | Sharp (Node.js) | Cloudflare Images API |
| 前端框架 | React JSX | React + TypeScript + shadcn/ui |

## 功能实现清单

### 第一阶段：核心基础设施 ✅ 已完成

- [x] 配置 Cloudflare AI binding (`wrangler.toml`)
- [x] 创建数据库表 (`wardrobe_item`, `wardrobe_job`)
- [x] 实现基础 API 端点
- [x] 创建基础路由和组件

### 第二阶段：完善导入流程

#### 2.1 增强上传组件
**当前状态**：基础拖拽/粘贴上传
**目标**：参考 wardrobe-main 的完整导入体验

需要增强的功能：
- [ ] 全屏拖拽覆盖层（带模糊背景）
- [ ] 多文件上传支持
- [ ] 上传进度显示
- [ ] 图片预览和裁剪

#### 2.2 完善 AI 分析流程
**当前状态**：基础分析，显示检测结果
**目标**：3 阶段审核流程

需要实现的功能：
- [ ] **裁剪审核**：显示检测到的服装裁剪图，用户可批准/拒绝
- [ ] **服装审核**：显示提取的服装图片，用户可编辑元数据
- [ ] **重新生成**：支持自定义提示词重新生成

#### 2.3 实现清理编辑器
**当前状态**：无
**目标**：背景移除容差调节

需要实现的功能：
- [ ] 容差滑块（18-110）
- [ ] 实时预览
- [ ] 接受/拒绝清理结果

### 第三阶段：完善画廊功能

#### 3.1 增强画廊网格
**当前状态**：基础网格显示
**目标**：参考 wardrobe-main 的画廊体验

需要增强的功能：
- [ ] 分类筛选标签（All/Tops/Jackets/Bottoms/Accessories/Shoes）
- [ ] 悬停缩放效果
- [ ] 响应式网格布局
- [ ] 空状态提示

#### 3.2 实现项目查看器
**当前状态**：基础编辑对话框
**目标**：侧滑面板，完整编辑功能

需要实现的功能：
- [ ] 侧滑面板（从右侧滑出）
- [ ] 大图预览
- [ ] 元数据编辑（名称、分类、颜色、标签）
- [ ] 颜色选择器（从图片提取调色板）
- [ ] 标签编辑器（添加/删除标签）
- [ ] 脏状态检测（未保存更改提示）

#### 3.3 实现颜色选择器
**当前状态**：无
**目标**：从图片提取颜色，支持手动选择

需要实现的功能：
- [ ] 从图片提取 5 个主要颜色
- [ ] 点击选择颜色
- [ ] 手动输入 HEX 值
- [ ] 主色/副色切换

### 第四阶段：完善编辑功能

#### 4.1 增强编辑对话框
**当前状态**：基础编辑对话框
**目标**：完整的编辑体验

需要增强的功能：
- [ ] 颜色选择器集成
- [ ] 标签编辑器（支持键盘快捷键）
- [ ] 分类下拉选择
- [ ] 保存/取消按钮
- [ ] 删除确认对话框

#### 4.2 实现本地存储
**当前状态**：无
**目标**：参考 wardrobe-main 的本地存储策略

需要实现的功能：
- [ ] 本地编辑存储（localStorage）
- [ ] 本地删除存储（localStorage）
- [ ] 服务器状态合并

### 第五阶段：完善用户体验

#### 5.1 实现拖拽覆盖层
**当前状态**：基础拖拽
**目标**：全屏拖拽覆盖层

需要实现的功能：
- [ ] 全屏覆盖层（带模糊背景）
- [ ] 深度跟踪（防止子元素闪烁）
- [ ] 多文件支持
- [ ] 拖拽状态指示

#### 5.2 实现导入托盘
**当前状态**：无
**目标**：参考 wardrobe-main 的导入托盘

需要实现的功能：
- [ ] 左下角浮动启动器
- [ ] 悬停展开
- [ ] 导入进度弹窗
- [ ] 任务队列显示

#### 5.3 实现状态指示器
**当前状态**：基础加载状态
**目标**：完整的状态指示系统

需要实现的功能：
- [ ] 处理中旋转器
- [ ] 就绪徽章
- [ ] 错误警告
- [ ] 进度条

## 数据模型

### 服装项目 (wardrobe_item)
```typescript
{
  id: string;           // nanoid(10)
  userId: string;       // 用户 ID
  name: string;         // 服装名称
  part: string;         // upperbody, wholebody_up, lowerbody, accessories_up, shoes
  color: string;        // 主色 HEX
  secondaryColor?: string; // 副色 HEX
  tags: string;         // JSON 数组字符串
  imageUrl: string;     // 图片 URL
  thumbnailUrl?: string; // 缩略图 URL
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 导入任务 (wardrobe_job)
```typescript
{
  id: string;           // nanoid(10)
  userId: string;       // 用户 ID
  status: string;       // pending, analyzing, generating, completed, failed
  originalImageUrl: string; // 原始图片 URL
  analysisResult: string;   // JSON 分析结果
  error?: string;       // 错误信息
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

## API 端点

### 上传和分析
| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/wardrobe/upload` | POST | 上传图片并创建任务 |
| `/api/wardrobe/jobs/:id` | GET | 获取任务状态 |
| `/api/wardrobe/jobs/:id/analyze` | POST | 触发 AI 分析 |

### 提取和生成
| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/wardrobe/jobs/:id/extract/:index` | POST | 提取服装并生成图片 |

### 服装管理
| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/wardrobe/items` | GET | 获取服装列表 |
| `/api/wardrobe/items/:id` | PUT | 更新服装信息 |
| `/api/wardrobe/items/:id` | DELETE | 删除服装项 |

### 资源访问
| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/wardrobe/assets/*` | GET | 访问图片资源 |

## AI 模型配置

### 视觉分析
- **模型**: `@cf/meta/llama-3.2-11b-vision-instruct`
- **用途**: 检测图片中的服装
- **输入**: 图片 + 提示词
- **输出**: JSON 格式的服装列表

### 图片提取
- **服务**: Cloudflare Images API
- **功能**: `segment=foreground`
- **用途**: 自动移除背景，保留服装主体

## 前端组件结构

```
app/
├── routes/
│   └── wardrobe.tsx          # 主路由
├── components/
│   └── wardrobe/
│       ├── UploadZone.tsx    # 上传区域
│       ├── ImportFlow.tsx    # 导入流程
│       ├── GarmentGrid.tsx   # 服装网格
│       ├── GarmentCard.tsx   # 服装卡片
│       ├── ItemViewer.tsx    # 项目查看器
│       ├── ItemEditor.tsx    # 项目编辑器
│       ├── ColorPicker.tsx   # 颜色选择器
│       ├── TagEditor.tsx     # 标签编辑器
│       └── CategoryFilter.tsx # 分类筛选
```

## 实现顺序

### 第 1 步：增强上传组件 (1-2 天)
1. 实现全屏拖拽覆盖层
2. 添加多文件支持
3. 实现上传进度显示

### 第 2 步：完善导入流程 (2-3 天)
1. 实现 3 阶段审核流程
2. 添加重新生成功能
3. 实现清理编辑器

### 第 3 步：增强画廊功能 (2-3 天)
1. 实现分类筛选
2. 增强网格显示
3. 实现项目查看器

### 第 4 步：完善编辑功能 (1-2 天)
1. 实现颜色选择器
2. 实现标签编辑器
3. 添加本地存储

### 第 5 步：用户体验优化 (1-2 天)
1. 实现导入托盘
2. 添加状态指示器
3. 优化动画和过渡

## 成本估算

| 功能 | 模型 | 每次成本 | 月度成本 (100 用户) |
|------|------|----------|---------------------|
| 视觉分析 | Llama Vision | ~33 Neurons | ~$0.33 |
| 图片提取 | Images API | 免费 | $0 |
| **总计** | | | **~$0.33/月** |

## 注意事项

1. **Cloudflare AI 限制**：免费层每天 10,000 Neurons，需要监控使用量
2. **图片大小限制**：最大 10MB，需要前端压缩
3. **响应时间**：AI 分析可能需要 10-30 秒，需要异步处理
4. **错误处理**：需要完善的重试机制和错误提示
5. **用户体验**：需要清晰的进度指示和状态反馈

## 测试计划

### 单元测试
- [ ] AI 提示词解析测试
- [ ] 边界框计算测试
- [ ] 数据验证测试

### 集成测试
- [ ] 图片上传流程
- [ ] AI 分析流程
- [ ] 图片提取流程
- [ ] 服装管理 CRUD

### 端到端测试
- [ ] 完整导入流程
- [ ] 画廊展示和编辑
- [ ] 错误处理和恢复

## 参考资源

- [wardrobe-main 项目](https://github.com/tandpfun/wardrobe)
- [Cloudflare Workers AI 文档](https://developers.cloudflare.com/workers-ai/)
- [Cloudflare Images API](https://developers.cloudflare.com/images/)
- [shadcn/ui 组件库](https://ui.shadcn.com/)
