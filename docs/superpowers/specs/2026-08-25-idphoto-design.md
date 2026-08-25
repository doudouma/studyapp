# idphoto 证件照工具集成设计

## 背景

把 `template/证件照工具.html`（约 1200 行独立 HTML 工具）集成为 100mini 的免费工具页面，路由 `/idphoto`。

原工具能力（全部浏览器本地完成，照片不上传）：

- **AI 抠图换底色**：transformers.js + RMBG-1.4（fp16 约 88MB，hf-mirror/huggingface 按需下载、浏览器缓存），带遮罩清理管线（双阈值磁滞重建 + 闭运算填孔 + 羽化）、反混色、边缘去污染
- **人脸检测自动定位**：face-api.js TinyFaceDetector，按规格头身比区间自动缩放居中
- **24 种规格预设**：中国常用（一寸/二寸/教资/国考/四六级等 15 种）+ 美/加/英/申根/印/澳/日/韩/巴签证规格 + 自定义尺寸
- **合规检测**：头身比标尺 overlay（仅预览不入导出图）+ 拍摄建议
- **导出**：JPG/PNG、文件大小上限（质量递减搜索）、数字提交预设（DS-160 <240KB 等）
- **相纸排版**：4R/A6/A5/A4、横竖方向、2mm 间距 3mm 边距、300 DPI 网格

**实现方式：混合方案**，核心 JS 逻辑移植为纯 TS 模块，UI 用 React + shadcn 风格重写。AI 库保持运行时 CDN 动态加载（多源容错），主 bundle 零增量。i18n 覆盖全部 5 语言（zh/en/es/fr/pt）。

## 核心流程

```
上传照片 → 选规格 → 选底色 → [一键 AI 生成 | 仅裁剪排版]
  → 自动定位合成（人脸检测 + 头身比）→ 合规检测 + 手动微调
  → 导出证件照 / 相纸排版打印
```

## 1. 文件结构

```
app/lib/idphoto/
  specs.ts          # SIZE_PRESETS(24)、BG_COLORS、PAPERS、DIGITAL 数据
                    # + headRange/headTarget 纯函数
  segmentation.ts   # importTransformers 多CDN容错、segmentImage(RMBG-1.4)、
                    # cleanMask/unmixBg/decontaminate/estimateBg
  face.ts           # face-api.js script 注入(多CDN) + ensureFaceModel/detectFace
  compose.ts        # computeBase 自动定位、composeRender 合成绘制、
                    # srcToCanvas 坐标换算、drawRuler 标尺 overlay
  exportImage.ts    # canvasToBlobLimit 质量搜索压体积、downloadBlob、
                    # buildPrintLayout 相纸排版网格计算
app/components/idphoto/
  IdPhotoWorkbench.tsx   # 状态中枢（useState/useRef，无外部状态库）
  PhotoDropzone.tsx      # 点击/拖拽上传，显示已选文件信息
  SpecPicker.tsx         # 国家筛选下拉 + 规格卡片网格 + 自定义宽高输入
  BgColorPicker.tsx      # 色板(按规格 bgOptions 过滤) + 取色器/hex + 保留原背景
  GeneratePanel.tsx      # 「一键 AI 生成」「仅裁剪排版」按钮 + 进度状态文案
  CompliancePanel.tsx    # 头身比合规结论 badge + 标尺开关 + 拍摄建议列表
  AdjustPanel.tsx        # 缩放/水平/垂直滑条 + 重置
  ExportPanel.tsx        # 数字提交预设/JPG·PNG/KB上限 + 导出按钮 + 结果信息
  PrintLayoutPanel.tsx   # 相纸排版 tab（相纸/双方向选择 + 排版画布 + 导出）
  PreviewCanvas.tsx      # 双层 canvas（结果层 + 标尺 overlay 层）
app/routes/idphoto.tsx   # 路由 + SEO head + 页面组装
```

模块依赖方向：`components → lib/idphoto`；lib 内 `segmentation/face/compose/exportImage → specs`，specs 无依赖。lib 模块不持有全局可变状态（pipeline 缓存 `__segPipe` 留在 segmentation.ts 内部）；canvas 渲染由 Workbench 通过 ref 显式调用。

## 2. 页面布局

桌面端左右两栏（左控制面板约 370px 可滚动 + 右预览区自适应），移动端上下堆叠。沿用站点绿色主题（#006c49 / dark #0b1c30），AppNav + AppFooter 三段式。

右预览区两个 tab：

1. **证件照预览**：结果 canvas + 标尺 overlay canvas 叠放
2. **相纸排版打印**：排版参数行 + 排版 canvas + 排版导出按钮

## 3. 状态与数据流

Workbench state 与模板一一对应：

```ts
{ srcImg, cutImg, faceBox, personTop, headSrc,
  base,              // {scale,x,y} 由 computeBase 计算
  bgColor, keepBg, presetIdx, regionFilter,
  resultReady, aiBusy }
```

- 微调滑条值（zoom/x/y）为 Workbench state，变更时触发重绘
- AI 流程：加载照片 → detectFace（模型不可用则跳过）→ segmentImage（进度回调更新状态文案）→ computeBase → composeRender
- 换底色即时生效（cutImg 已存在时）；未抠图时仅提示需先 AI 生成，不自动触发
- 全程无 API 调用、无后端依赖、无数据落库

## 4. AI 运行时加载（沿用模板策略）

- face-api.js@0.22.2：script 标签注入，4 个 CDN 源容错（jsdelivr/fastly/gcore/unpkg）；权重 tinyFaceDetector 同样多源
- @huggingface/transformers@3.8.1：动态 import，4 CDN 容错；RMBG-1.4 权重 hf-mirror.com 优先、huggingface.co 兜底，dtype fp16 失败回退 q8
- 加载/推理进度通过回调上报 UI（下载百分比、编译初始化提示）
- 所有外部加载失败均不影响「保留原背景 + 仅裁剪排版」离线路径

## 5. 错误处理与降级

| 场景 | 行为 |
|---|---|
| 人脸检测失败/无人脸 | 居中裁剪兜底 |
| 抠图模型/CDN 全部失败 | i18n 错误文案 + 引导走离线裁剪路径 |
| 非图片文件 | 拦截并提示 |
| 相纸放不下当前规格 | 提示换相纸或调整方向 |
| 大小压不到上限 | 导出最低质量并在结果信息中说明 |

## 6. i18n（全 5 语言）

新增 `idphoto.*` 命名空间约 110 个 key：

- UI 文案：上传区、步骤标题、按钮、状态提示、合规建议、错误信息
- 数据类文案：24 个规格的名称/描述、底色名、数字提交预设说明
- 另加：`nav.idphoto`、`freetool.item.idphoto.title/desc`

zh/en 精确翻译；es/fr/pt 同步翻译补齐。规格数据中的像素/毫米数值不进 locale 文件，只翻译名称与描述。

## 7. 集成点清单

| 文件 | 改动 |
|---|---|
| `app/routes/idphoto.tsx` | 新路由 + head meta（title/desc/keywords/og/twitter） |
| `app/lib/locales/*.json` ×5 | idphoto 命名空间 + nav/freetool 条目 |
| `app/components/HomeHeader.tsx` | 桌面下拉 + 移动菜单加入口；工具页判定加 `/idphoto` |
| `app/routes/freetool.tsx` | 工具卡片 + JSON-LD ItemList 第 5 项 |
| `app/lib/seo.ts` | pageKeys 加 `/idphoto` case |
| `server/api.ts` | sitemap STATIC_PAGES 加 `/idphoto` |

## 8. 测试

- `npm run build` 通过（动态 import 的外部 URL 不进打包产物）
- dev server 手测完整流程：上传 → AI 抠图（观察进度）→ 换底色 → 微调 → 合规标尺 → 导出 JPG/PNG + KB 上限 → 相纸排版导出
- 降级路径：勾选保留原背景 + 仅裁剪排版（无网络也可完成）
- 切换 zh/en 验证文案；验证暗色模式显示
