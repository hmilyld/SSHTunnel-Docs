export const locales = ['zh', 'en'] as const;
export type Locale = (typeof locales)[number];

export const otherLocale = (locale: Locale): Locale => (locale === 'zh' ? 'en' : 'zh');

export interface UIStrings {
  htmlLang: string;
  siteName: string;
  docsLabel: string;
  navDocs: string;
  navDownload: string;
  navGitHub: string;
  navSite: string;
  pagination: string;
  /** 语言切换按钮上显示的目标语言名 */
  switchTo: string;
  switchAria: string;
  themeToggleDark: string;
  themeToggleLight: string;
  themeTitle: string;
  skipToContent: string;
  sidebarLabel: string;
  tocLabel: string;
  navOpen: string;
  navClose: string;
  prev: string;
  next: string;
  versionLine: string;
  feedback: string;
  footerDocs: string;
  footerProject: string;
  footerSource: string;
  footerReleases: string;
  footerBuild: string;
  footerFaq: string;
  footerTagline: string;
  footerStack: string;
}

export const ui: Record<Locale, UIStrings> = {
  zh: {
    htmlLang: 'zh-CN',
    siteName: 'SSH 隧道管理器',
    docsLabel: '文档',
    navDocs: '文档',
    navDownload: '下载',
    navGitHub: 'GitHub',
    navSite: '站点',
    pagination: '上一篇 / 下一篇',
    switchTo: 'English',
    switchAria: '切换到英文',
    themeToggleDark: '切换深色主题',
    themeToggleLight: '切换浅色主题',
    themeTitle: '切换深色 / 浅色主题',
    skipToContent: '跳到正文',
    sidebarLabel: '文档目录',
    tocLabel: '本页',
    navOpen: '展开',
    navClose: '收起',
    prev: '上一篇',
    next: '下一篇',
    versionLine: '对应版本 v{version}',
    feedback: '发现错误？在 GitHub 反馈',
    footerDocs: '文档',
    footerProject: '项目',
    footerSource: '源代码',
    footerReleases: '发行版',
    footerBuild: '从源码构建',
    footerFaq: '常见问题',
    footerTagline:
      'Windows 10/11 与 macOS 12+ 上的 Tauri 2 桌面应用，转发由系统 ssh 执行。',
    footerStack: 'Astro + Tailwind CSS',
  },
  en: {
    htmlLang: 'en',
    siteName: 'SSH Tunnel Manager',
    docsLabel: 'Docs',
    navDocs: 'Docs',
    navDownload: 'Download',
    navGitHub: 'GitHub',
    navSite: 'Site',
    pagination: 'Previous / next',
    switchTo: '中文',
    switchAria: 'Switch to Chinese',
    themeToggleDark: 'Switch to dark theme',
    themeToggleLight: 'Switch to light theme',
    themeTitle: 'Toggle dark / light theme',
    skipToContent: 'Skip to content',
    sidebarLabel: 'Documentation',
    tocLabel: 'On this page',
    navOpen: 'Open',
    navClose: 'Close',
    prev: 'Previous',
    next: 'Next',
    versionLine: 'For version v{version}',
    feedback: 'Found a mistake? Open an issue',
    footerDocs: 'Documentation',
    footerProject: 'Project',
    footerSource: 'Source code',
    footerReleases: 'Releases',
    footerBuild: 'Build from source',
    footerFaq: 'FAQ',
    footerTagline:
      'A Tauri 2 desktop app for Windows 10/11 and macOS 12+; forwarding is done by the system ssh.',
    footerStack: 'Astro + Tailwind CSS',
  },
};

/** 把 {version} 这类占位符替换掉，避免在组件里手拼字符串 */
export function fmt(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? '');
}
