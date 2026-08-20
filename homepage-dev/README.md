# Homepage Dev

Personal homepage project conventions and structure guide for a Vue 3 + Vite single-page application.

## Overview

This skill provides development standards and project structure guidelines for a content-driven personal homepage built with Vue 3, Vite 6, and Ant Design Vue 4.

## Tech Stack

- **Vue 3** (^3.5.13) — Composition API + `<script setup>`
- **Vite 6** (^6.0.5) — Build tool with JSONL data generation plugins
- **Ant Design Vue 4** (^4.2.6) — UI components (ConfigProvider + Menu only)
- **Shiki** (^4.4.3) — Syntax highlighting (VS Code style)
- **markdown-it** (^15.0.0) — Markdown rendering
- **maplibre-gl** (^6.3.0) — 3D globe visualization
- **高德地图 JS API** — 2D map markers

## Key Conventions

- No vue-router — uses `activeView` ref + `v-if/v-else-if` for view switching
- Views in `views/` (suffix `View.vue`), components in `components/` (no suffix)
- Composables in `composables/` (prefix `use`, camelCase)
- Theme via CSS variables (`:root` + `html[data-theme="dark"]`)
- Data format: JSONL (JSON Lines) for streaming-friendly parsing
- Build command: `npm run build` (must pass before committing)
- Git branch: `main`, commits follow `<type>: <description>` format

## Scripts

| Script | Purpose |
|--------|---------|
| `parse-qq-playlist.py` | Fetch QQ Music playlist data |
| `gen-feed.mjs` | Merge log files by date |
| `md-meta.mjs` | Extract Markdown metadata |
| `gen-thumbs.ps1` | Generate album thumbnails (PowerShell) |

## Deployment

- EdgeOne (Tencent Cloud) for hosting
- `base: './'` for subdirectory deployment
- `AMAP_API_KEY` injected at build time
