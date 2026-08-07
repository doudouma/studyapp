# Landing + User Guide Redesign

## Purpose
Redesign the homepage (`/`) as a single long-scroll page combining the upload form with a User Guide, inspired by 900.cool.

## Sections (top to bottom)

1. **Hero** — Large headline, subtitle, CTA button scrolling to upload area
2. **Upload Area** — Existing paste/drop tabs, auth-aware extra fields (title/category/tags/share-to-square). Kept below the fold.
3. **Features** — Enhanced 4-column StatsSection: 即时预览, 防钓鱼安全, 7天自动销毁, 学习广场
4. **Quick Start** — 3-step guide: ① 准备内容 ② 上传发布 ③ 分享链接
5. **FAQ** — Accordion: supported formats, size limit, retention, square sharing
6. **Pro Tips** — Tips card grid: file organization, image optimization, local testing, naming
7. **Footer** — Existing AppFooter

## Implementation Plan

### Files to modify
- `app/routes/index.tsx` — Rewrite full page layout
- `app/components/StatsSection.tsx` — Add 4th feature card (7d auto-destroy)
- `app/styles/app.css` — Minor additions if needed for accordion/keyframes

### Files to create
- `app/components/GuideSection.tsx` — Quick Start + FAQ + Pro Tips sections

### Auth handling
- Unauthenticated: Hero → Upload → Features → Quick Start → FAQ → Pro Tips → Footer
- Authenticated: Same structure, Upload area shows extra fields
- Upload success: Same result card page
