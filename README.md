# SSH 隧道管理器 · 文档站 / Docs site

[SSH 隧道管理器](https://github.com/hmilyld/SSHTunnel)的文档与介绍页，中英双语，纯静态站点。

- **Astro 7**：内容集合 + 静态输出
- **Tailwind CSS 4**：通过 `@tailwindcss/vite` 接入，设计令牌定义在 `src/styles/global.css`
- **Shiki**：Markdown 代码高亮，浅色 / 深色双主题

## 语言与路由

| 语言 | 首页 | 文档 |
| --- | --- | --- |
| 中文（默认，无前缀） | `/` | `/docs/overview` |
| English | `/en/` | `/en/docs/overview` |

右上角的语言按钮会跳到**同一篇**文档的另一种语言，而不是回到首页。路由是手写的
（没有用 Astro 内置 i18n，静态站不需要它的中间件）。

## 本地开发

```bash
pnpm install
pnpm dev       # http://localhost:4321
pnpm build     # 产出 dist/
pnpm preview   # 预览 dist/
```

## 目录

```text
src/
├── content/docs/
│   ├── zh/*.md         中文正文
│   └── en/*.md         英文正文（与 zh 一一对应）
├── content.config.ts    集合定义与 frontmatter schema
├── i18n/ui.ts           界面文案（导航、页脚、目录标签…）
├── data/
│   ├── site.ts          站点常量：版本号、仓库地址
│   ├── nav.ts           侧边栏分组键与两种语言的显示名
│   └── landing.ts       首页文案（中 / 英各一份）
├── layouts/             BaseLayout（外壳）/ DocsLayout（侧边栏 + 正文 + 目录）
├── components/          顶栏、页脚、侧边栏、目录、示意图、Landing、标识
├── lib/
│   ├── docs.ts          按语言取文档、拼路由
│   └── rehype-wrap-tables.mjs  给表格套横向滚动容器
├── pages/
│   ├── index.astro          中文首页
│   ├── docs/[...slug].astro 中文文档
│   └── en/…                 英文首页与文档
├── styles/global.css    色板、排版、正文样式
└── public/shots/        应用截图（浅色 / 深色各一张，WebP）
```

## 截图

`public/shots/` 里的四张图截自真实应用窗口（1120×600 与 1120×740，@2x），
用 `<html class="dark">` 切换浅色 / 深色两张，不需要 JS：

- 首页：[Shot.astro](src/components/Shot.astro) 组件
- 文档（Markdown 里用原始 HTML）：`<figure class="shot">` + 两张 `img`（`.shot-light` / `.shot-dark`）

换图时保持文件名不变即可（`app-light.webp`、`app-dark.webp`、`dialog-light.webp`、`dialog-dark.webp`），
宽高属性写在标签上，避免布局跳动。

## 新增一篇文档

两种语言各加一个文件，文件名（slug）必须一致，侧边栏与「上一篇 / 下一篇」会自动出现：

```yaml
---
title: 标题 / Title
description: 一句话摘要，会显示在标题下方
group: start        # start / usage / internals / maintenance
order: 11           # 全站顺序，决定上一篇 / 下一篇
---
```

## 部署

线上地址：**https://sshtunnel.hmilyld.com**（Vercel 托管，连接仓库自动部署）。

- 在 Vercel 里 **Add New → Project** 导入这个仓库即可：框架会被识别为 Astro，
  构建命令 `pnpm build`、输出目录 `dist` 都用默认值，不需要 `vercel.json`。
- Node 版本固定 22（`.nvmrc` 与 `package.json` 的 `engines.node`），Astro 7 要求 ≥ 22.23.4。
- 自定义域名在 Vercel 项目 **Settings → Domains** 里添加 `sshtunnel.hmilyld.com`；
  Cloudflare 侧建一条 CNAME：`sshtunnel` → `cname.vercel-dns.com`，代理状态建议 **DNS only**。
- `astro.config.mjs` 的 `site` 决定 canonical 与 `og:url`，换域名时改这一处。

## 设计约定

- 色板：暖纸 `#f4f1e9` + 墨黑 `#16181a` + 锈红 `#9c3d1d`；深色为 `#121311` / `#e9e5d9` / `#e08a63`。
- 字体：系统无衬线（中文回落到 PingFang SC / 微软雅黑），代码用等宽字体，不加载网络字体。
- 排版：正文 16px / 1.9，标题负字距，小标签用等宽大写 + 0.16em 字距替代图标。
- 结构：细线分隔、无圆角卡片、无渐变与阴影；编号（01、02）承担导航作用。
- 主题：`<html class="dark">` 驱动，`localStorage` 持久化，首帧前内联脚本应用，无闪白。
