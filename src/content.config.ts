import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * 文档集合：src/content/docs/<lang>/*.md
 *
 * 侧边栏完全由 frontmatter 的 group + order 决定顺序，
 * 新增一篇只要丢一个 .md 进来，不需要改导航文件。
 */
const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    group: z.enum(['start', 'usage', 'internals', 'maintenance']),
    order: z.number(),
  }),
});

export const collections = { docs };
