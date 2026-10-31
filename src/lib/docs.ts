import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/ui';

export type DocEntry = CollectionEntry<'docs'>;

/** 按语言取文档：内容集合里的 id 形如 `zh/overview` */
export async function getDocs(locale: Locale): Promise<DocEntry[]> {
  const all = await getCollection('docs');
  return all
    .filter((entry) => entry.id.startsWith(`${locale}/`))
    .sort((a, b) => a.data.order - b.data.order);
}

/** `zh/overview` → `overview` */
export const slugOf = (id: string): string => id.split('/').slice(1).join('/');

export const docHref = (locale: Locale, slug: string): string =>
  locale === 'zh' ? `/docs/${slug}` : `/en/docs/${slug}`;

export const homeHref = (locale: Locale): string => (locale === 'zh' ? '/' : '/en/');

/** 同 slug 的另一语言地址，用于语言切换 */
export const alternateHref = (locale: Locale, slug?: string): string => {
  const target = locale === 'zh' ? 'en' : 'zh';
  return slug ? docHref(target, slug) : homeHref(target);
};
