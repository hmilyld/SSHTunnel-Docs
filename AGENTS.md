# AGENTS.md

Astro 7 + Tailwind CSS 4 的中英双语静态文档站，内容面向 SSH 隧道管理器（Tauri 桌面应用）。
内容与设计都已完成，改动前先读 `README.md`。

## 命令

Node 由 fnm 管理，PowerShell 不会自动加载 profile，先执行：

```powershell
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
```

- `pnpm dev` / `pnpm build` / `pnpm preview`
- 没有测试框架；改动后至少跑一次 `pnpm build`，它同时校验内容集合 schema。

## 双语约定（最重要）

- 每个页面都必须有中文和英文两份。中文在 `src/content/docs/zh/`，英文在
  `src/content/docs/en/`，**文件名（slug）必须一一对应**，否则语言切换会指向 404。
- 路由手写，不用 Astro 内置 i18n（`i18n.routing: 'manual'` 需要 middleware，静态站不需要）。
  中文：`/docs/<slug>`；英文：`/en/docs/<slug>`。拼接统一走 `src/lib/docs.ts` 的
  `docHref` / `homeHref` / `alternateHref`，不要在组件里手拼路径。
- 界面文案在 `src/i18n/ui.ts`（`zh` / `en` 两份，类型强制两边键一致）；首页长文案在
  `src/data/landing.ts`。新增界面文字必须同时补两种语言。
- frontmatter 的 `group` 是稳定键（`start` / `usage` / `internals` / `maintenance`），
  显示名在 `src/data/nav.ts` 里按语言映射，不要在内容里写中文分组名。
- 英文正文里的站内链接要写 `/en/docs/...`；中文正文写 `/docs/...`。
- 应用本身的界面与报错是中文的，英文文档引用报错原文时保留中文，并在上下文里说明。

## 结构

- `src/content/docs/*/*.md` —— 正文。侧边栏与上一篇/下一篇完全由 frontmatter 的
  `group` + `order` 决定，不要手写导航列表。
- `src/content.config.ts` —— frontmatter schema。
- `src/data/site.ts` —— 版本号、仓库地址、中英 tagline；改版本只动这里。
- `src/styles/global.css` —— 色板与 `.doc-prose` 排版，设计令牌通过 `@theme inline` 映射成
  Tailwind 工具类（`bg-paper`、`text-muted`、`border-line`…）。
- `src/layouts/DocsLayout.astro` —— 侧边栏 / 正文 / 右侧目录三栏，滚动高亮脚本也在这里。
- `src/components/Landing.astro` —— 首页结构，文案来自 `src/data/landing.ts`。
- `public/shots/*.webp` —— 应用截图（`app-*` 主窗口、`dialog-*` 新建弹窗，浅色 / 深色各一张）。
  首页用 `<Shot name="app" />`；Markdown 里写原始 HTML：
  `<figure class="shot"><img class="shot-light" …><img class="shot-dark" …><figcaption>…</figcaption></figure>`，
  主题切换由 `global.css` 里的 `.shot` 规则完成，不需要 JS。

## 其他约定

- 正文用 Markdown，不引入 MDX 组件；提示框用 `> **小标题**` 引用块（样式已按此约定写好）。
- 首页文案里的行内代码用反引号写，由 `<Inline />` 渲染成 `<code class="code-inline">`。
- 表格会被 `src/lib/rehype-wrap-tables.mjs` 自动包进 `.table-scroll`，不要手写包裹层。
- Markdown 插件必须通过 `markdown.processor: unified({...})`（`@astrojs/markdown-remark`）传入；
  旧的 `markdown.rehypePlugins` 已废弃，而删掉这个依赖会让构建直接失败。
- 设计上刻意保持：无渐变、无圆角卡片、无阴影、无 emoji 图标；层级靠细线、等宽小标签和编号。
- 中文字体不加载网络字体；深色模式由 `<html class="dark">` 驱动（`@custom-variant dark`）。
- 不要提交 `dist/`、`.astro/`、`node_modules/`（已在 .gitignore）。
