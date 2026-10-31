// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';
import rehypeWrapTables from './src/lib/rehype-wrap-tables.mjs';

// https://astro.build/config
export default defineConfig({
  // 纯静态输出；正文来自 src/content/docs/<lang>/ 下的 Markdown
  output: 'static',
  trailingSlash: 'ignore',

  // 双语路由手写：/ 与 /docs/... 是中文，/en/ 与 /en/docs/... 是英文
  // （不使用 Astro 内置 i18n，静态站不需要它的中间件）

  // 两个语言都没有 /docs 索引页，直接送去第一篇
  redirects: {
    '/docs': '/docs/overview',
    '/en/docs': '/en/docs/overview',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    // 给 Markdown 表格套一层横向滚动容器（src/lib/rehype-wrap-tables.mjs）
    processor: unified({
      rehypePlugins: [rehypeWrapTables],
    }),
    // 浅色 / 深色两套 token，具体颜色由 CSS 变量切换（见 src/styles/global.css）
    shikiConfig: {
      themes: {
        light: 'min-light',
        dark: 'min-dark',
      },
      defaultColor: false,
      wrap: false,
    },
  },
});
