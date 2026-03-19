import { defineConfig } from "vitepress";
import { ensureWorkoutPages, repoRoot } from "./workouts/workoutPageBuilder";
import { normalizeSnapshotDatetime } from "./theme/snapshotLastModified";

const sidebar = await ensureWorkoutPages();
const localizedLastUpdated = (text: string) => ({
  text,
  formatOptions: {
    dateStyle: "short",
    timeStyle: "short",
    forceLocale: true,
  } as const,
});

export default defineConfig({
  title: "Sports in Kiel",
  lang: "en-US",
  description: "Information aggregator for sports activities in Kiel, Germany.",
  lastUpdated: true,
  cleanUrls: true,
  sitemap: {
    hostname: "https://sport.oili.dev",
  },
  head: [
    [
      "link",
      { rel: "icon", type: "image/svg+xml", href: "/sportkiel-mark.svg" },
    ],
    ["link", { rel: "shortcut icon", href: "/sportkiel-mark.svg" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: "Sports in Kiel" }],
    [
      "meta",
      {
        property: "og:image",
        content: "https://sport.oili.dev/sportkiel-mark.svg",
      },
    ],
    ["meta", { name: "twitter:card", content: "summary" }],
    [
      "meta",
      {
        name: "twitter:image",
        content: "https://sport.oili.dev/sportkiel-mark.svg",
      },
    ],
  ],

  transformHead({ pageData }) {
    const canonicalUrl = `https://sport.oili.dev/${pageData.relativePath}`
      .replace(/index\.md$/, "")
      .replace(/\.md$/, "");
    return [["link", { rel: "canonical", href: canonicalUrl }]];
  },

  transformPageData(pageData) {
    const snapshotUpdatedAt =
      typeof pageData.frontmatter?.snapshotUpdatedAt === "string"
        ? pageData.frontmatter.snapshotUpdatedAt
        : null;

    if (!snapshotUpdatedAt) return;

    const parsed = new Date(normalizeSnapshotDatetime(snapshotUpdatedAt));
    if (Number.isNaN(parsed.getTime())) return;

    pageData.lastUpdated = parsed.getTime();
  },

  locales: {
    de: {
      label: "Deutsch",
      lang: "de-DE",
      link: "/de/",
      title: "Sport in Kiel",
      description:
        "Informations-Aggregator für Sportangebote in Kiel, Deutschland.",
      themeConfig: {
        siteTitle: false,
        search: { provider: "local" },
        docFooter: { prev: "Vorherige Seite", next: "Nächste Seite" },
        lastUpdated: localizedLastUpdated("Zuletzt aktualisiert"),
        outline: { label: "Auf dieser Seite" },
        socialLinks: [
          {
            icon: "github",
            link: "https://github.com/dianliyang/athena-workouts-public",
          },
        ],
        nav: [
          { text: "Workout", link: "/de/workouts" },
          { text: "About", link: "/de/about" },
        ],
        sidebar: { "/de/workouts/": sidebar.de },
      },
    },

    en: {
      label: "English",
      lang: "en-US",
      link: "/en/",
      title: "Sports in Kiel",
      description:
        "Information aggregator for sports activities in Kiel, Germany.",
      themeConfig: {
        siteTitle: false,
        search: { provider: "local" },
        docFooter: { prev: "Previous page", next: "Next page" },
        lastUpdated: localizedLastUpdated("Last updated"),
        outline: { label: "On this page" },
        socialLinks: [
          {
            icon: "github",
            link: "https://github.com/dianliyang/athena-workouts-public",
          },
        ],
        nav: [
          { text: "Workout", link: "/en/workouts" },
          { text: "About", link: "/en/about" },
        ],
        sidebar: { "/en/workouts/": sidebar.en },
      },
    },

    ja: {
      label: "日本語",
      lang: "ja-JP",
      link: "/ja/",
      title: "Sports in Kiel",
      description: "ドイツ・キール市で提供されているスポーツ情報の集約サイト。",
      themeConfig: {
        siteTitle: false,
        search: { provider: "local" },
        docFooter: { prev: "前のページ", next: "次のページ" },
        lastUpdated: localizedLastUpdated("最終更新"),
        outline: { label: "このページ" },
        socialLinks: [
          {
            icon: "github",
            link: "https://github.com/dianliyang/athena-workouts-public",
          },
        ],
        nav: [
          { text: "ワークアウト", link: "/ja/workouts" },
          { text: "このサイトについて", link: "/ja/about" },
        ],
        sidebar: { "/ja/workouts/": sidebar.ja },
      },
    },

    ko: {
      label: "한국어",
      lang: "ko-KR",
      link: "/ko/",
      title: "Sports in Kiel",
      description: "독일 킬에서 제공되는 스포츠 정보 애그리게이터입니다.",
      themeConfig: {
        siteTitle: false,
        search: { provider: "local" },
        docFooter: { prev: "이전 페이지", next: "다음 페이지" },
        lastUpdated: localizedLastUpdated("마지막 업데이트"),
        outline: { label: "이 페이지" },
        socialLinks: [
          {
            icon: "github",
            link: "https://github.com/dianliyang/athena-workouts-public",
          },
        ],
        nav: [
          { text: "운동", link: "/ko/workouts" },
          { text: "소개", link: "/ko/about" },
        ],
        sidebar: { "/ko/workouts/": sidebar.ko },
      },
    },

    "zh-cn": {
      label: "简体中文",
      lang: "zh-CN",
      link: "/zh-cn/",
      title: "Sports in Kiel",
      description: "德国基尔市体育信息聚合平台。",
      themeConfig: {
        siteTitle: false,
        search: { provider: "local" },
        docFooter: { prev: "上一页", next: "下一页" },
        lastUpdated: localizedLastUpdated("最后更新"),
        outline: { label: "本页内容" },
        socialLinks: [
          {
            icon: "github",
            link: "https://github.com/dianliyang/athena-workouts-public",
          },
        ],
        nav: [
          { text: "运动", link: "/zh-cn/workouts" },
          { text: "关于", link: "/zh-cn/about" },
        ],
        sidebar: { "/zh-cn/workouts/": sidebar["zh-CN"] },
      },
    },
  },

  // The root locale theme config is repeated here as VitePress requires it
  // on the top-level themeConfig as well.
  themeConfig: {
    siteTitle: false,
    search: { provider: "local" },
    docFooter: { prev: "Previous page", next: "Next page" },
    lastUpdated: localizedLastUpdated("Last updated"),
    outline: { label: "On this page" },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/dianliyang/athena-workouts-public",
      },
    ],
    nav: [
      { text: "Workout", link: "/en/workouts" },
      { text: "About", link: "/en/about" },
    ],
    sidebar: { "/en/workouts/": sidebar.en },
  },

  vite: {
    server: {
      fs: { allow: [repoRoot] },
    },
  },
});
