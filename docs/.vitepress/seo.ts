type SeoLocale = "de" | "en" | "ja" | "ko" | "zh-cn";

type PageDataLike = {
  title?: string;
  description?: string;
  relativePath: string;
  frontmatter?: Record<string, unknown>;
};

type HeadTag =
  | ["link", Record<string, string>]
  | ["meta", Record<string, string>]
  | ["script", Record<string, string>, string];

type JsonLdNode = Record<string, unknown>;

const siteUrl = "https://sport.oili.dev";

const localePrefixes: SeoLocale[] = ["de", "en", "ja", "ko", "zh-cn"];

const localeDescriptions: Record<SeoLocale, string> = {
  de: "Informations-Aggregator für Sportangebote in Kiel, Deutschland.",
  en: "Information aggregator for sports activities in Kiel, Germany.",
  ja: "ドイツ・キール市で提供されているスポーツ情報の集約サイト。",
  ko: "독일 킬에서 제공되는 스포츠 정보 애그리게이터입니다.",
  "zh-cn": "德国基尔市体育信息聚合平台。",
};

const workoutPageDescriptionTemplates: Record<
  Exclude<SeoLocale, "zh-cn"> | "zh-CN",
  (title: string, variantCount: number) => string
> = {
  de: (title, variantCount) =>
    `${title} in Kiel mit ${variantCount} ${variantCount === 1 ? "Variante" : "Varianten"}, Zeiten, Preisen, Orten und Buchungslinks.`,
  en: (title, variantCount) =>
    `${title} in Kiel with ${variantCount} ${variantCount === 1 ? "variant" : "variants"}, schedules, prices, locations, and booking links.`,
  ja: (title, variantCount) =>
    `キールの${title}。${variantCount}件のコース、日程、料金、場所、予約リンクを掲載。`,
  ko: (title, variantCount) =>
    `킬의 ${title}. ${variantCount}개 강좌의 일정, 요금, 장소, 예약 링크를 확인할 수 있습니다.`,
  "zh-CN": (title, variantCount) =>
    `基尔的${title}，包含${variantCount}个项目的时间、价格、地点和报名链接。`,
};

const workoutIndexDescriptions: Record<SeoLocale, string> = {
  de: "Sportkatalog für Kiel mit Kursen, Zeiten, Preisen und Links zu lokalen Anbietern.",
  en: "Kiel sports catalog with classes, schedules, pricing, and links to local providers.",
  ja: "キールのスポーツ講座一覧。日程、料金、場所、予約リンクをまとめて確認できます。",
  ko: "킬 스포츠 카탈로그로 강좌 일정, 요금, 장소, 예약 링크를 한곳에서 볼 수 있습니다.",
  "zh-cn": "基尔运动课程目录，汇集时间、价格、地点和报名链接。",
};

function getLocaleFromRelativePath(relativePath: string): SeoLocale | null {
  const normalized = relativePath.replace(/^\/+/, "");
  const [prefix] = normalized.split("/", 1);
  return localePrefixes.find((locale) => locale === prefix) ?? null;
}

function stripMarkdownSuffix(relativePath: string): string {
  return relativePath.replace(/index\.md$/, "").replace(/\.md$/, "");
}

function localeToLanguageTag(locale: SeoLocale | null): string {
  if (locale === "zh-cn") return "zh-CN";
  if (locale === "de") return "de-DE";
  if (locale === "ja") return "ja-JP";
  if (locale === "ko") return "ko-KR";
  return "en-US";
}

function localeLabel(locale: SeoLocale | null): string {
  if (locale === "de") return "Deutsch";
  if (locale === "ja") return "日本語";
  if (locale === "ko") return "한국어";
  if (locale === "zh-cn") return "简体中文";
  return "English";
}

export function canonicalUrlForPath(relativePath: string): string {
  return `${siteUrl}/${stripMarkdownSuffix(relativePath)}`;
}

export function buildAlternateLocaleLinks(relativePath: string): HeadTag[] {
  const locale = getLocaleFromRelativePath(relativePath);
  if (!locale) return [];

  const suffix = relativePath.replace(new RegExp(`^${locale}/`), "");

  const alternates = localePrefixes.map((prefix) => {
    const hrefLang = prefix === "zh-cn" ? "zh-CN" : prefix;
    return [
      "link",
      {
        rel: "alternate",
        hreflang: hrefLang,
        href: canonicalUrlForPath(`${prefix}/${suffix}`),
      },
    ] as HeadTag;
  });

  alternates.push([
    "link",
    {
      rel: "alternate",
      hreflang: "x-default",
      href: canonicalUrlForPath(`en/${suffix}`),
    },
  ]);

  return alternates;
}

export function buildSeoDescription(pageData: PageDataLike): string {
  const locale = getLocaleFromRelativePath(pageData.relativePath);
  if (!locale) return pageData.description || "";

  const frontmatterDescription =
    typeof pageData.frontmatter?.description === "string"
      ? pageData.frontmatter.description
      : null;

  if (frontmatterDescription) return frontmatterDescription;
  if (pageData.description) return pageData.description;

  if (pageData.relativePath.endsWith("/workouts/index.md")) {
    return workoutIndexDescriptions[locale];
  }

  return localeDescriptions[locale];
}

export function buildSeoHead(pageData: PageDataLike): HeadTag[] {
  const canonical = canonicalUrlForPath(pageData.relativePath);
  const description = buildSeoDescription(pageData);
  const title = pageData.title || "Sports in Kiel";
  const locale = getLocaleFromRelativePath(pageData.relativePath);
  const ogLocale = locale === "zh-cn" ? "zh_CN" : locale === "de" ? "de_DE" : locale === "ja" ? "ja_JP" : locale === "ko" ? "ko_KR" : "en_US";
  const isWorkoutDetail = /\/workouts\/[^/]+\.md$/.test(pageData.relativePath) &&
    !pageData.relativePath.endsWith("/workouts/index.md");

  return [
    ["link", { rel: "canonical", href: canonical }],
    ...buildAlternateLocaleLinks(pageData.relativePath),
    ["meta", { name: "description", content: description }],
    ["meta", { property: "og:title", content: title }],
    ["meta", { property: "og:description", content: description }],
    ["meta", { property: "og:url", content: canonical }],
    ["meta", { property: "og:type", content: isWorkoutDetail ? "article" : "website" }],
    ["meta", { property: "og:locale", content: ogLocale }],
    ["meta", { name: "twitter:title", content: title }],
    ["meta", { name: "twitter:description", content: description }],
    ...buildJsonLdHead(pageData),
  ];
}

export function buildJsonLd(pageData: PageDataLike): JsonLdNode[] {
  const locale = getLocaleFromRelativePath(pageData.relativePath);
  if (!locale) return [];

  const canonical = canonicalUrlForPath(pageData.relativePath);
  const description = buildSeoDescription(pageData);
  const title = pageData.title || "Sports in Kiel";
  const language = localeToLanguageTag(locale);
  const pageKind =
    typeof pageData.frontmatter?.seoPageKind === "string"
      ? pageData.frontmatter.seoPageKind
      : null;
  const variantCount =
    typeof pageData.frontmatter?.seoVariantCount === "number"
      ? pageData.frontmatter.seoVariantCount
      : null;

  const breadcrumbs = [
    {
      "@type": "ListItem",
      position: 1,
      name: localeLabel(locale),
      item: canonicalUrlForPath(`${locale}/`),
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Workout",
      item: canonicalUrlForPath(`${locale}/workouts/index.md`),
    },
    ...(pageKind === "workout-category"
      ? [{
        "@type": "ListItem",
        position: 3,
        name: title,
        item: canonical,
      }]
      : []),
  ];

  const nodes: JsonLdNode[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs,
    },
  ];

  if (pageKind === "workout-category" && variantCount != null) {
    nodes.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: canonical,
      inLanguage: language,
      isPartOf: {
        "@type": "WebSite",
        name: "Sports in Kiel",
        url: siteUrl,
      },
      about: {
        "@type": "Thing",
        name: title,
      },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: variantCount,
        itemListOrder: "https://schema.org/ItemListUnordered",
        name: title,
      },
    });
  }

  if (pageKind === "workout-index") {
    nodes.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: canonical,
      inLanguage: language,
      isPartOf: {
        "@type": "WebSite",
        name: "Sports in Kiel",
        url: siteUrl,
      },
      about: {
        "@type": "Thing",
        name: "Sports in Kiel Workout Catalog",
      },
    });
  }

  return nodes;
}

export function buildJsonLdHead(pageData: PageDataLike): HeadTag[] {
  return buildJsonLd(pageData).map((node) => [
    "script",
    { type: "application/ld+json" },
    JSON.stringify(node),
  ]);
}

export function buildWorkoutPageDescription(
  locale: Exclude<SeoLocale, "zh-cn"> | "zh-CN",
  title: string,
  variantCount: number,
): string {
  return workoutPageDescriptionTemplates[locale](title, variantCount);
}

export function buildWorkoutIndexDescription(locale: SeoLocale): string {
  return workoutIndexDescriptions[locale];
}
