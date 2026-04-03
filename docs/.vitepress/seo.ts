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

const siteUrl = "https://sport-kiel.oili.dev";

const localePrefixes: SeoLocale[] = ["de", "en", "ja", "ko", "zh-cn"];

const localeDescriptions: Record<SeoLocale, string> = {
  de: "Sport in Kiel: Dein Informations-Aggregator für Sportangebote, Kurse und Freizeitaktivitäten in Kiel, Deutschland. Finde aktuelle Zeiten, Preise und Orte auf einen Blick.",
  en: "Sports in Kiel: Your information aggregator for sports activities, classes, and recreation in Kiel, Germany. Find up-to-date schedules, pricing, and locations.",
  ja: "キールのスポーツ情報サイト。ドイツ・キール市で提供されているスポーツ講座、フィットネス、レクリエーション情報を集約。日程、料金、場所を簡単に検索できます。",
  ko: "독일 킬 스포츠 정보 안내: 킬에서 제공되는 다양한 스포츠 강좌, 피트니스 및 레크리에이션 활동 정보를 한곳에서 확인하세요. 일정, 요금, 장소를 제공합니다.",
  "zh-cn":
    "基尔体育信息聚合平台：为您提供德国基尔市的各项运动课程、健身活动和休闲项目信息。轻松查询最新的时间表、价格以及活动地点。",
};

const workoutPageDescriptionTemplates: Record<
  Exclude<SeoLocale, "zh-cn"> | "zh-CN",
  (title: string, variantCount: number) => string
> = {
  de: (title, variantCount) =>
    `Entdecke ${title} in Kiel: ${variantCount} ${variantCount === 1 ? "Variante" : "Varianten"} mit detaillierten Zeiten, Preisen, Standorten und direkten Buchungslinks für dein Training.`,
  en: (title, variantCount) =>
    `Explore ${title} in Kiel: ${variantCount} ${variantCount === 1 ? "variant" : "variants"} with detailed schedules, pricing, locations, and direct booking links for your sports activities.`,
  ja: (title, variantCount) =>
    `キールの${title}情報をチェック。${variantCount}件のコースの詳細（日程、料金、場所、予約リンク）を掲載しています。あなたにぴったりのワークアウトを見つけましょう。`,
  ko: (title, variantCount) =>
    `킬의 ${title} 안내: ${variantCount}개 강좌의 상세 일정, 요금, 장소 및 예약 링크를 확인하세요. 킬에서 즐길 수 있는 최적의 운동 프로그램을 찾아보세요.`,
  "zh-CN": (title, variantCount) =>
    `基尔${title}课程指南：包含${variantCount}个项目的详细时间表、价格、活动地点和直接报名链接。助您轻松参与基尔市的体育活动。`,
};

const workoutIndexDescriptions: Record<SeoLocale, string> = {
  de: "Der umfassende Sportkatalog für Kiel: Durchsuche alle verfügbaren Kurse, Zeiten und Preise. Finde Sportangebote lokaler Anbieter übersichtlich an einem Ort.",
  en: "The comprehensive Kiel sports catalog: Browse all available classes, schedules, and pricing. Find sports offerings from local providers in one convenient place.",
  ja: "キールの包括的なスポーツカタログ。提供されているすべての講座、日程、料金を網羅。地域のスポーツ施設やクラブの情報をまとめて確認できます。",
  ko: "킬 종합 스포츠 카탈로그: 제공되는 모든 강좌, 일정 및 요금을 확인하세요. 지역 스포츠 제공처의 다양한 프로그램을 한곳에서 편리하게 찾아볼 수 있습니다.",
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

function workoutLabel(locale: SeoLocale | null): string {
  if (locale === "de") return "Workout";
  if (locale === "ja") return "ワークアウト";
  if (locale === "ko") return "운동";
  if (locale === "zh-cn") return "运动";
  return "Workout";
}

const localeKeywords: Record<SeoLocale, string> = {
  de: "Sport, Kiel, Fitness, Kurse, Training, Freizeit, Aktivitäten",
  en: "Sports, Kiel, Fitness, Classes, Workout, Recreation, Activities",
  ja: "スポーツ, キール, フィットネス, 講座, ワークアウト, レクリエーション, アクティビティ",
  ko: "스포츠, 킬, 피트니스, 강좌, 운동, 레크리에이션, 활동",
  "zh-cn": "运动, 基尔, 健身, 课程, 训练, 休闲, 活动",
};

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
  const keywords = locale ? localeKeywords[locale] : localeKeywords.en;
  const imageAlt =
    locale === "de" ? "Sport in Kiel Logo" : "Sports in Kiel Logo";
  const ogLocale =
    locale === "zh-cn"
      ? "zh_CN"
      : locale === "de"
        ? "de_DE"
        : locale === "ja"
          ? "ja_JP"
          : locale === "ko"
            ? "ko_KR"
            : "en_US";
  const isWorkoutDetail =
    /\/workouts\/[^/]+\.md$/.test(pageData.relativePath) &&
    !pageData.relativePath.endsWith("/workouts/index.md");

  return [
    ["link", { rel: "canonical", href: canonical }],
    ...buildAlternateLocaleLinks(pageData.relativePath),
    ["meta", { name: "description", content: description }],
    ["meta", { name: "keywords", content: keywords }],
    ["meta", { name: "robots", content: "index, follow" }],
    ["meta", { property: "og:title", content: title }],
    ["meta", { property: "og:description", content: description }],
    ["meta", { property: "og:url", content: canonical }],
    [
      "meta",
      { property: "og:type", content: isWorkoutDetail ? "article" : "website" },
    ],
    ["meta", { property: "og:locale", content: ogLocale }],
    ["meta", { property: "og:image:alt", content: imageAlt }],
    ["meta", { name: "twitter:title", content: title }],
    ["meta", { name: "twitter:description", content: description }],
    ["meta", { name: "twitter:image:alt", content: imageAlt }],
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
      name: workoutLabel(locale),
      item: canonicalUrlForPath(`${locale}/workouts/index.md`),
    },
    ...(pageKind === "workout-category"
      ? [
          {
            "@type": "ListItem",
            position: 3,
            name: title,
            item: canonical,
          },
        ]
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
