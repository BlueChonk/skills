# Homepage Dev

个人主页项目开发规范与结构指南，基于 Vue 3 + Vite 的单页应用。

## 概述

本技能为内容驱动型个人主页提供开发标准和项目结构规范，技术栈为 Vue 3 + Vite 6 + Ant Design Vue 4。

## 技术选型

- **Vue 3** (^3.5.13) — Composition API + `<script setup>` 语法
- **Vite 6** (^6.0.5) — 构建工具，含 JSONL 数据生成插件
- **Ant Design Vue 4** (^4.2.6) — UI 组件（仅 ConfigProvider + Menu）
- **Shiki** (^4.4.3) — 语法高亮（VS Code 风格）
- **markdown-it** (^15.0.0) — Markdown 渲染
- **maplibre-gl** (^6.3.0) — 3D 地球可视化
- **高德地图 JS API** — 2D 地图标记

## 核心约定

- 不使用 vue-router — 用 `activeView` ref + `v-if/v-else-if` 切换视图
- 页面级组件放 `views/`（后缀 `View.vue`），通用组件放 `components/`（无后缀）
- 逻辑复用放 `composables/`（前缀 `use`，camelCase 命名）
- 主题通过 CSS 变量管理（`:root` + `html[data-theme="dark"]`）
- 数据格式：JSONL（JSON Lines），流式友好
- 构建命令：`npm run build`（提交前必须通过）
- Git 分支：`main`，提交格式：`<type>: <描述>`

## 脚本说明

| 脚本 | 用途 |
|------|------|
| `parse-qq-playlist.py` | 拉取 QQ 音乐歌单数据 |
| `gen-feed.mjs` | 按日期合并日志文件 |
| `md-meta.mjs` | 提取 Markdown 元数据 |
| `gen-thumbs.ps1` | 生成相册缩略图（PowerShell） |

## 部署

- EdgeOne（腾讯云边缘计算）托管
- `base: './'` 适配子路径部署
- `AMAP_API_KEY` 构建时注入
