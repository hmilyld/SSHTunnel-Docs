import type { Locale } from '../i18n/ui';

/** 侧边栏分组：稳定键，显示名按语言取 */
export const groupOrder = ['start', 'usage', 'internals', 'maintenance'] as const;
export type DocGroup = (typeof groupOrder)[number];

export const groupLabels: Record<Locale, Record<DocGroup, string>> = {
  zh: {
    start: '开始',
    usage: '使用',
    internals: '深入',
    maintenance: '维护',
  },
  en: {
    start: 'Start',
    usage: 'Usage',
    internals: 'Internals',
    maintenance: 'Maintenance',
  },
};
