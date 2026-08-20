---
name: "homepage-dev"
description: "Homepage personal site project conventions and structure guide. Invoke when modifying any file in this Vue 3 + Vite project, adding features, fixing bugs, or doing refactoring."
---

# Homepage 项目开发规范

## 技术选型

### 整体架构

个人主页项目，纯前端 SPA（单页应用），无后端服务器。所有数据通过 Vite 构建期插件从本地文件扫描生成 JSONL/MD 清单，运行时前端 fetch 加载。音乐播放通过第三方公共 API 实时解析，不依赖本地音频文件。

### 前端框架与构建

| 选型 | 版本 | 选型理由 |
|------|------|----------|
| **Vue 3** | ^3.5.13 | Composition API + `<script setup>` 语法，轻量、响应式天然适合内容驱动的个人站 |
| **Vite 6** | ^6.0.5 | 极快的 dev/build，原生 ESM，插件机制用于构建期自动生成数据清单；`base: './'` 适配子路径部署 |
| **@vitejs/plugin-vue** | ^5.2.1 | Vue SFC 编译，官方标配 |

不使用 vue-router：页面少（6 个视图），用 `App.vue` 中 `activeView` ref + `v-if/v-else-if` 手动切换即可，避免路由库的额外体积和 hash/history 模式配置。

### UI 与样式

| 选型 | 版本 | 选型理由 |
|------|------|----------|
| **Ant Design Vue 4** | ^4.2.6 | 仅使用 `ConfigProvider`（主题注入）+ `Menu`（导航菜单），不引入表单/表格等重组件，按需加载控制体积 |
| **@ant-design/icons-vue** | ^7.0.1 | 导航栏图标 |
| **原生 CSS** | - | 不用 Tailwind/UnoCSS，全局 CSS 变量（`:root` + `html[data-theme="dark"]`）管理主题色，组件内 `<style scoped>` + `:deep()` 穿透 |

### 主题系统

- `useTheme.js`：单例模式，三态切换（light / dark / system），`localStorage` 持久化
- `index.html` 内联首帧脚本：在 Vue 挂载前读取 `localStorage` 设置 `data-theme`，避免暗色用户看到白色闪烁（FOUC）
- Ant Design Vue 通过 `ConfigProvider` 的 `algorithm`（`darkAlgorithm` / `defaultAlgorithm`）同步主题
- Shiki 代码高亮双主题（`github-dark` / `github-light`），CSS `color-scheme` 自动切换

### Markdown 渲染

| 选型 | 版本 | 选型理由 |
|------|------|----------|
| **markdown-it** | ^15.0.0 | 流式解析，插件生态丰富，比 marked 更灵活 |
| **@shikijs/markdown-it** | ^4.4.3 | Shiki 集成 markdown-it 的官方桥接，每行渲染为独立 `.line` 节点，避免行号错位 |
| **shiki** | ^4.4.3 | VS Code 同款 TextMate 语法高亮，双主题输出，按需加载 18 种常用语言控制体积 |
| **markdown-it-anchor** | ^9.2.1 | 标题锚点生成，支持中文 slug，重复标题自动追加序号 |

`useShiki.js` 单例缓存 highlighter，`MarkdownPreview.vue` 封装渲染逻辑，通过 `variant` prop 区分笔记/日志/摘要等场景。

### 地图

| 选型 | 版本 | 选型理由 |
|------|------|----------|
| **高德地图 JS API** | - | 通过 `utils/amap.js` 动态加载，国内访问稳定，支持卫星图层和自定义样式 |
| **maplibre-gl** | ^6.3.0 | 开源 3D 地球渲染（WebGL），展示居住地位置；`optimizeDeps.exclude` 避免预打包破坏 worker |

高德 Key 通过 `vite.config.js` 的 `define` 在构建期烘焙进产物（`__AMAP_API_KEY__`），浏览器运行时无法直接读服务端环境变量。`HomeMap.vue` 同时使用高德（2D 定位标记）和 maplibre-gl（3D 地球）。

### 音乐播放

| 选型 | 方式 | 选型理由 |
|------|------|----------|
| **MetingJS 公共 API** | `https://api.i-meto.com/meting/api` | 免费公共接口，根据歌名+歌手搜索 QQ 音乐，返回真实播放 URL、封面、歌词 |
| **原生 Audio API** | `new Audio()` 单例 | 不依赖 Howler.js 等封装，单例 Audio 元素全生命周期复用，切换视图不中断播放 |

`usePlayer.js` 核心：歌曲清单来自 `music.jsonl`（构建期由 Node.js 脚本从 QQ 音乐歌单拉取），播放时实时调 MetingJS API 解析音频 URL（有 30 分钟缓存 + 失效自动重试）。歌词同步由 `useLyrics.js` 处理。

### 数据生成（构建期）

| 脚本/插件 | 语言 | 选型理由 |
|-----------|------|----------|
| `parse-qq-playlist.mjs` | Node.js ESM | QQ 音乐歌单解析（全量字段 + 封面 URL 构造 + 歌单信息） |
| `gen-feed.mjs` | Node.js ESM | 日志合并逻辑简单，用 Node 原生 `fs` 即可，与 Vite 插件同进程调用 |
| `md-meta.mjs` | Node.js ESM | Markdown 元数据提取（标题/日期/摘要/分类/字数），正则解析，无需 remark/front-matter 库 |
| `manifestPlugin()` | Vite 插件 | 通用文件扫描器，参数化配置 dir/outFile/urlBase/test/mapItem，复用于相册和笔记 |

数据格式选用 **JSONL**（JSON Lines，每行一个独立 JSON 对象）而非 JSON 数组：流式友好，前端 `split('\n').map(JSON.parse)` 即可解析，文件 append 不需重写整个数组。

### 部署

- **EdgeOne**（腾讯云边缘计算）：云端构建时注入 `AMAP_API_KEY` 环境变量
- `base: './'`：相对路径，适配子路径部署
- `emptyOutDir: false`：跳过 Vite 清空 dist 目录，避免批量删除保护拦截
- 静态资源全部本地化（favicon、图标、音效），不依赖外链 CDN

### 依赖体积控制策略

- Ant Design Vue 按需引入（仅 ConfigProvider + Menu）
- Shiki 按需加载语言（18 种常用语言 + 别名映射）
- maplibre-gl `optimizeDeps.exclude` 避免 worker 预打包问题
- 不引入 vue-router、pinia、axios 等非必需库
- 构建产物 chunk 超 500KB 警告可忽略（主要是 maplibre-gl）

## 目录结构

```
src/
├── App.vue                 # 根组件：导航切换 + 路由（非 vue-router，用 activeView ref）
├── main.js                 # 入口
├── style.css               # 全局样式 + CSS 变量（亮/暗主题）
├── views/                  # 页面级视图（以 View.vue 结尾）
│   ├── HomeView.vue        # 首页：头像、打字机、Log 最近2条、Note 最近2篇、3D 地球
│   ├── LogView.vue         # 全部日志
│   ├── NoteView.vue        # 全部笔记
│   ├── AlbumView.vue       # 相册
│   ├── MusicView.vue       # 音乐播放器
│   └── AboutView.vue       # 关于我
├── components/             # 通用可复用组件（不以 View 结尾）
│   ├── AppHeader.vue       # 顶部导航栏（含迷你播放器、音量、主题切换）
│   ├── AppFooter.vue       # 页脚
│   ├── MarkdownPreview.vue # Markdown 渲染（variant: note/note-excerpt/log/...）
│   ├── HomeMap.vue         # 3D 地球组件
│   ├── CialloGreet.vue     # Ciallo 问候语
│   └── PhoebePoke.vue      # 菲比戳一戳
├── composables/            # 逻辑复用（以 use 开头）
│   ├── usePlayer.js        # 音乐播放器（单例 Audio，MetingJS 解析）
│   ├── useLyrics.js        # 歌词同步
│   ├── useLog.js           # 日志数据加载（limit 参数控制条数）
│   ├── useNotes.js         # 笔记数据加载（limit 参数控制条数）
│   ├── useTheme.js         # 亮/暗主题
│   ├── useRandomSound.js   # 随机音效
│   └── useShiki.js         # Shiki 代码高亮
└── utils/
    └── amap.js             # 高德地图工具
```

### 文件归属规则

- **`views/`**: 以 `View.vue` 结尾的页面级组件，**必须**放在此目录
- **`components/`**: 可复用的非页面级组件，**不以** View 结尾
- **`composables/`**: 逻辑复用 hook，**以 `use` 开头**，camelCase 命名
- **`utils/`**: 纯工具函数
- 组件目录**保持扁平**，不再创建子目录（如 audio/、common/ 等）

## 数据流与自动生成机制

### Vite 插件（vite.config.js）

构建/dev 启动时自动运行的插件，生成文件均在 `.gitignore` 中：

| 插件 | 输入 | 输出 | 说明 |
|------|------|------|------|
| `qq-music:sync` | 歌单 ID（默认 7813925785） | `public/music.jsonl` + `public/music.info.json` | 调用 Python 脚本拉取 QQ 音乐歌单 |
| `log:merge` | `public/log/*.md` | `public/log.md` | 合并日志文件，按日期倒序 |
| `manifest:album` | `public/album/*.{jpg,png,...}` | `public/album.jsonl` | 扫描图片生成清单 |
| `manifest:note` | `public/note/*.md` | `public/note.jsonl` | 扫描笔记，提取标题/日期/摘要/字数 |

### .gitignore 中的自动生成文件（勿手动编辑）

```
public/album.jsonl
public/note.jsonl
public/log.md
```

注意：`public/music.jsonl` 和 `public/music.info.json` **未** 被 gitignore，会提交到仓库。

### 导航机制

不使用 vue-router，而是 `App.vue` 中用 `activeView` ref + `v-if/v-else-if` 切换视图。导航 key 对应关系：

| key | 视图 | 可滚动 |
|-----|------|--------|
| `home` | HomeView | ✅ |
| `log` | LogView | ✅ |
| `notes` | NoteView | ✅ |
| `album` | AlbumView | ✅ |
| `music` | MusicView | ❌（自带内部滚动） |
| `about` | AboutView | ✅ |

AppHeader.vue 的导航菜单项 key 必须与 App.vue 的 `v-else-if` 匹配。`scrollable` computed 列表需同步更新。

## 日志规范（public/log/）

- 文件名：`YYYY-MM-DD.md`（正则 `/^\d{4}-\d{2}-\d{2}\.md$/`）
- **正文不写 `# 日期` 标题**，直接写内容
- 日期由文件名提取，`gen-feed.mjs` 合并时自动在正文前加 `# 日期`（前端解析依赖此格式）
- 文件按日期倒序排列（最新在前）

## 笔记规范（public/note/）

- 文件名：`<标题>.md`，中文标题即可
- Markdown 正文顶部可用 frontmatter 或一级标题作为标题
- `md-meta.mjs` 负责提取标题、日期、摘要、分类
- 输出到 `note.jsonl` 的结构：`{ id, file, title, category, date, excerpt, wordCount }`

## 音乐规范

- 数据来源：`public/music.jsonl`（由 `scripts/parse-qq-playlist.py` 生成）
- 每首歌包含全量 API 字段：title, artist, duration, cover, songmid, albummid, singers, vid, pay, size* 等
- 播放时 `usePlayer.js` 通过 MetingJS API 实时解析音频 URL（URL 有时效，缓存 30 分钟）
- 封面：`cover` 字段（由 albummid 构造 CDN URL）或 MetingJS 返回的 `onlineCover`（优先）
- 歌单 ID 通过环境变量 `QQ_PLAYLIST_ID` 可覆盖

## 样式规范

- 全局 CSS 变量定义在 `src/style.css` 的 `:root` 和 `html[data-theme="dark"]` 中
- 主题通过 `useTheme.js` 管理，`html` 标签上的 `data-theme` 属性切换
- 组件内样式用 `<style scoped>`，需要穿透时用 `:deep()`
- 共享样式块（多视图复用）放在 `style.css` 全局，用语义化 class（如 `.my-log-*`）
- 字体：系统字体栈，中文用 PingFang SC / Microsoft YaHei

## 构建与验证

- **改动后必须运行 `npm run build` 验证无报错**
- build 会自动运行所有 Vite 插件（生成 jsonl/log.md/music.jsonl）
- `emptyOutDir: false`（跳过清空 dist，避免批量删除保护）
- chunk 大小超 500KB 的警告可忽略（maplibre-gl 较大）

## Git 规范

- 分支：`main`
- Commit message 格式：`<type>: <描述>`
  - `feat:` 新功能
  - `refactor:` 重构
  - `fix:` 修复
  - `chore:` 杂项
- 大改动**分块提交**（按逻辑拆分为多个 commit）
- 推送前确保 build 通过

### 主动推送策略

当经过多次修改或大量代码变更后，**应主动触发代码推送**，不要积累过多未提交的改动。推送时遵循以下原则：

1. **分块推送**：按功能模块或逻辑变更拆分为多个独立 commit，逐个推送，不要一次性把所有改动堆在一个 commit 里
   - 例：同时改了播放器、相册、日志三个模块 → 拆成三个 commit 分别推送
2. **触发时机**：以下情况应主动推送
   - 完成一个完整功能点或修复一个 bug 后
   - 连续修改超过 3 个文件后
   - 单次会话中进行了多轮迭代修改后
   - 用户明确要求推送时
3. **推送前检查**：每次推送前运行 `npm run build` 确保无报错
4. **commit 粒度**：一个 commit 只做一件事，message 清晰描述本次变更内容

## 脚本说明（scripts/）

| 脚本 | 用途 |
|------|------|
| `parse-qq-playlist.py` | QQ 音乐歌单解析（全量字段 + 封面 URL 构造 + 歌单信息） |
| `gen-feed.mjs` | 日志合并（导出 `mergeLogs`/`logDir`/`logOut`，兼容旧名 `mergeFeeds`/`feedsDir`） |
| `md-meta.mjs` | Markdown 元数据提取（标题/日期/摘要/分类/字数） |
| `generate-manifest.mjs` | 独立清单生成（手动运行 `npm run gen:manifest`） |
| `gen-thumbs.ps1` | 相册缩略图生成（PowerShell） |
| `fetch-163-lyrics.mjs` | 网易云歌词抓取（工具） |
| `probe-cdn.mjs` | CDN 探测（调试用） |
| `diagnose-music.mjs` | 音乐诊断（调试用） |
| `test-music.mjs` | 音乐测试（调试用） |
| `_shiki_test.mjs` | Shiki 高亮测试（调试用） |

## 环境变量

| 变量 | 用途 | 注入方式 |
|------|------|----------|
| `AMAP_API_KEY` | 高德地图 Key | EdgeOne 云端构建注入，`define` 烘焙进产物 |
| `QQ_PLAYLIST_ID` | QQ 音乐歌单 ID | 可选，默认 `7813925785` |
| || |

## 常见注意事项

1. **新增 View 组件时**：同步更新 `App.vue`（import + v-else-if + scrollable 列表）和 `AppHeader.vue`（导航菜单项）
2. **新增 composable 时**：以 `use` 开头，放在 `src/composables/`，导出函数
3. **import 路径**：从 `views/` 引用 composable 用 `../composables/`，从 `components/` 引用同样用 `../composables/`（两者同级）
4. **不要在 components/ 创建子目录**：保持扁平结构
5. **不要手动编辑 .jsonl 和 log.md**：这些是自动生成的
6. **日志文件不写日期标题**：日期从文件名获取
