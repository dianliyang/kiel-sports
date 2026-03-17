import { getWorkoutCategoryMap, getWorkoutTitleMap } from "./workoutLocaleMaps";
import {
  getLocalizedLabel,
  getLocalizedValue,
  normalizeTranslationKey,
  trimLocalizedLabel,
} from "./workoutI18nUtils";

export type SidebarLocale = "de" | "en" | "zh-CN" | "ja" | "ko";

export function getAllCategoryLabelMappings(): Record<
  string,
  Partial<Record<SidebarLocale, string>>
> {
  return { ...getWorkoutCategoryMap() };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getCategoryLabel(
  locale: SidebarLocale,
  category: string,
): string {
  return getLocalizedLabel(getWorkoutCategoryMap(), locale, category);
}

const sidebarGroupLabelMap: Record<
  string,
  Partial<Record<SidebarLocale, string>>
> = {
  "Ball Sports": {
    en: "Ball Sports",
    de: "Ballsport",
    ja: "球技",
    ko: "구기 종목",
    "zh-CN": "球类运动",
  },
  "Board Sports": {
    en: "Board Sports",
    de: "Boardsport",
    ja: "ボードスポーツ",
    ko: "보드 스포츠",
    "zh-CN": "板类运动",
  },
  "Combat Sports": {
    en: "Combat Sports",
    de: "Kampfsport",
    ja: "格闘技",
    ko: "격투 스포츠",
    "zh-CN": "武术搏击",
  },
  Dance: {
    en: "Dance",
    de: "Tanz",
    ja: "ダンス",
    ko: "댄스",
    "zh-CN": "舞蹈",
  },
  Fitness: {
    en: "Fitness",
    de: "Fitness",
    ja: "フィットネス",
    ko: "피트니스",
    "zh-CN": "健身",
  },
  Jollensegeln: {
    en: "Dinghy Sailing",
    de: "Jollensegeln",
    ja: "ディンギーセーリング",
    ko: "딩기 세일링",
    "zh-CN": "小艇帆船",
  },
  "Kanu Sports": {
    en: "Canoe Sports",
    de: "Kanusport",
    ja: "カヌースポーツ",
    ko: "카누 스포츠",
    "zh-CN": "皮划艇运动",
  },
  Klettern: {
    en: "Climbing",
    de: "Klettern",
    ja: "クライミング",
    ko: "클라이밍",
    "zh-CN": "攀岩",
  },
  "Mind & Body": {
    en: "Mind & Body",
    de: "Körper & Geist",
    ja: "心身",
    ko: "마음과 몸",
    "zh-CN": "身心平衡",
  },
  Schwimmen: {
    en: "Swimming",
    de: "Schwimmen",
    ja: "水泳",
    ko: "수영",
    "zh-CN": "游泳",
  },
  Services: {
    en: "Services",
    de: "Service",
    ja: "サービス",
    ko: "서비스",
    "zh-CN": "服务",
  },
  "Weitere Sportarten": {
    en: "Other Sports",
    de: "Weitere Sportarten",
    ja: "その他のスポーツ",
    ko: "기타 스포츠",
    "zh-CN": "其他运动",
  },
  Windsurfen: {
    en: "Windsurfing",
    de: "Windsurfen",
    ja: "ウィンドサーフィン",
    ko: "윈드서핑",
    "zh-CN": "帆板",
  },
  Yacht: {
    en: "Yacht",
    de: "Yacht",
    ja: "ヨット",
    ko: "요트",
    "zh-CN": "游艇",
  },
  Yoga: {
    en: "Yoga",
    de: "Yoga",
    ja: "ヨガ",
    ko: "요가",
    "zh-CN": "瑜伽",
  },
};

function getSidebarGroupLabel(locale: SidebarLocale, family: string): string {
  return getLocalizedLabel(sidebarGroupLabelMap, locale, family);
}

export function localizeKnownCategoryFragments(
  locale: SidebarLocale,
  value: string,
): string {
  const workoutCategoryMap = getWorkoutCategoryMap();
  const activeKeys = Object.keys(workoutCategoryMap)
    .filter((key) => {
      const localized = workoutCategoryMap[key]?.[locale];
      return localized && localized !== key;
    })
    .sort((left, right) => right.length - left.length);

  if (activeKeys.length === 0) return value;

  const pattern = new RegExp(
    `(^|[\\s,(+/:-])(${activeKeys.map(escapeRegex).join("|")})(?=$|[\\s),+/:-])`,
    "gu",
  );

  return value.replace(pattern, (match, prefix, key) => {
    const localized = workoutCategoryMap[key]?.[locale];
    return `${prefix}${localized ?? key}`;
  });
}

type SidebarLinkItem = {
  text: string;
  link: string;
};

type SidebarGroupItem = {
  collapsed: boolean;
  text: string;
  items: SidebarLinkItem[];
};

const standaloneCategories = new Set<string>([]);

const familyPrefixes: Array<{ prefix: string; family: string }> = [
  { prefix: "Yoga", family: "Yoga" },
  { prefix: "Yacht", family: "Yacht" },
  { prefix: "Jollensegeln", family: "Jollensegeln" },
  { prefix: "Ballett", family: "Dance" },
  { prefix: "Windsurfen", family: "Windsurfen" },
  { prefix: "Klettern", family: "Klettern" },
  { prefix: "Kinderklettern", family: "Klettern" },
  { prefix: "Schwimmkurse", family: "Schwimmen" },
  { prefix: "Schwimmen", family: "Schwimmen" },
];

const familyCategoryAliases: Array<{
  category: string;
  family: string;
  label?: string;
}> = [
  { category: "Afro Dance", family: "Dance" },
  { category: "Aikido", family: "Combat Sports" },
  { category: "Ballett", family: "Dance" },
  { category: "Aerial Hoop", family: "Weitere Sportarten" },
  { category: "Akrobatik", family: "Weitere Sportarten" },
  { category: "Aqua-Jogging", family: "Schwimmen" },
  { category: "Australian Football", family: "Weitere Sportarten" },
  { category: "Bachata / Kizomba", family: "Dance" },
  { category: "Badminton", family: "Ball Sports" },
  {
    category: "Ballett, American Technique",
    family: "Dance",
    label: "Ballett, American Technique",
  },
  {
    category: "Ballett, klassisches Ballett",
    family: "Dance",
    label: "Ballett, klassisches Ballett",
  },
  { category: "Basketball", family: "Ball Sports" },
  { category: "CAU Alumni Cup", family: "Weitere Sportarten" },
  { category: "Beachvolleyball", family: "Ball Sports" },
  { category: "Bouldering", family: "Klettern" },
  { category: "Calisthenics", family: "Fitness" },
  { category: "Boxen", family: "Combat Sports" },
  { category: "Breaking", family: "Dance" },
  { category: "Contemporary Dance (Lyrical)", family: "Dance" },
  { category: "CAU Team beim Business Run Kiel", family: "Weitere Sportarten" },
  { category: "Eltern-Kind-Turnen", family: "Weitere Sportarten" },
  { category: "Entspannung und Achtsamkeit", family: "Mind & Body" },
  { category: "Erste Hilfe Kurs", family: "Services" },
  { category: "Fechten", family: "Weitere Sportarten" },
  { category: "Fitnessgymnastik für Ältere", family: "Fitness" },
  { category: "Floorball", family: "Ball Sports" },
  { category: "Forró", family: "Dance" },
  { category: "Fußball", family: "Ball Sports" },
  { category: "Futsal", family: "Ball Sports" },
  { category: "Functional Training", family: "Fitness" },
  { category: "Gerätturnen", family: "Weitere Sportarten" },
  { category: "Gesellschaftstanz", family: "Dance" },
  { category: "Handball", family: "Ball Sports" },
  { category: "HIIT", family: "Fitness" },
  { category: "Hip-Hop", family: "Dance" },
  { category: "Iaido", family: "Combat Sports" },
  { category: "Indoor Cycling", family: "Fitness" },
  { category: "Inline-Hockey", family: "Ball Sports" },
  { category: "Inlineskaten", family: "Weitere Sportarten" },
  { category: "Jazz Dance", family: "Dance" },
  { category: "Jiu-Jitsu", family: "Combat Sports" },
  { category: "Jonglieren / Flow Arts", family: "Weitere Sportarten" },
  { category: "Judo", family: "Combat Sports" },
  { category: "Kajakrolle", family: "Kanu Sports" },
  { category: "Kanu", family: "Kanu Sports" },
  { category: "Kanupolo", family: "Kanu Sports" },
  {
    category: "Jollen Einstufungssegeln",
    family: "Jollensegeln",
    label: "Einstufungssegeln",
  },
  {
    category: "Jollen Regattatraining",
    family: "Jollensegeln",
    label: "Regattatraining",
  },
  {
    category: "Jollen Regatta CAU",
    family: "Jollensegeln",
    label: "Jollen Regatta CAU",
  },
  { category: "K-Pop Dance", family: "Dance" },
  { category: "Karate-Do", family: "Combat Sports" },
  { category: "Kendo", family: "Combat Sports" },
  { category: "Kieler Woche Regattakurse", family: "Jollensegeln" },
  { category: "Kitesurfen am Wochenende", family: "Board Sports" },
  { category: "Kinderklettern", family: "Klettern" },
  { category: "Klettern", family: "Klettern" },
  { category: "Klettersport", family: "Klettern" },
  { category: "Kung Fu", family: "Combat Sports" },
  { category: "Lacrosse", family: "Ball Sports" },
  { category: "Langhanteltraining", family: "Fitness" },
  { category: "Lauftreff", family: "Weitere Sportarten" },
  { category: "Lindy Hop", family: "Dance" },
  { category: "Orientalischer Tanz", family: "Dance" },
  { category: "Orientierungslauf", family: "Weitere Sportarten" },
  { category: "Parkour", family: "Weitere Sportarten" },
  { category: "Pilates", family: "Mind & Body" },
  { category: "Pilates (Präventionssport)", family: "Mind & Body" },
  { category: "Reiten", family: "Weitere Sportarten" },
  { category: "Rhönrad/Cyr", family: "Weitere Sportarten" },
  { category: "freies Jollensegeln", family: "Jollensegeln" },
  { category: "Pole Dance", family: "Dance" },
  { category: "Rock`n`Roll", family: "Dance" },
  { category: "Rope Skipping", family: "Fitness" },
  { category: "Rückenfit", family: "Fitness" },
  { category: "Rudern", family: "Weitere Sportarten" },
  { category: "Salsa", family: "Dance" },
  { category: "Schach", family: "Weitere Sportarten" },
  {
    category: "Segeln für Jugendliche in den Sommerferien",
    family: "Jollensegeln",
  },
  { category: "Semestergebühr", family: "Services" },
  { category: "Skat", family: "Weitere Sportarten" },
  { category: "Sportbootführerschein See", family: "Services" },
  { category: "Step Aerobic", family: "Fitness" },
  { category: "Taekwondo", family: "Combat Sports" },
  { category: "Tai Chi", family: "Mind & Body" },
  { category: "Tango Argentino", family: "Dance" },
  { category: "Tanzsport, Standard und Latein", family: "Dance" },
  { category: "Tennis Gebühren", family: "Services" },
  { category: "Tenniskurse kompakt Semesterferien", family: "Ball Sports" },
  { category: "Tenniskurse Semester", family: "Ball Sports" },
  { category: "Roundnet", family: "Ball Sports" },
  { category: "Tischfußball", family: "Ball Sports" },
  { category: "Tischtennis", family: "Ball Sports" },
  { category: "Trampolin Großgerät", family: "Weitere Sportarten" },
  { category: "Ultimate Frisbee", family: "Weitere Sportarten" },
  { category: "Vertikaltuch", family: "Weitere Sportarten" },
  { category: "Völkerball", family: "Ball Sports" },
  { category: "Volleyball", family: "Ball Sports" },
  { category: "Volleyball Uniliga", family: "Ball Sports" },
  { category: "UniFIT", family: "Fitness" },
  { category: "Versicherungspaket für Übungsleiter:innen", family: "Services" },
  { category: "Wellenreiten in Rantum/Sylt", family: "Board Sports" },
  { category: "Workout", family: "Fitness" },
  { category: "Yachtsegeln für Frauen", family: "Yacht", label: "für Frauen" },
  { category: "Yachtsegeln Inklusion", family: "Yacht", label: "Inklusion" },
  { category: "Yachtsegeln Zweihand", family: "Yacht", label: "Zweihand" },
  { category: "Zumba", family: "Dance" },
];

function getSidebarFamily(
  category: string,
): { family: string; label: string } | null {
  const normalizedCategory = normalizeTranslationKey(category);

  if (standaloneCategories.has(normalizedCategory)) {
    return null;
  }

  const aliasMatch = familyCategoryAliases.find(
    (entry) => entry.category === normalizedCategory,
  );
  if (aliasMatch) {
    return {
      family: aliasMatch.family,
      label: normalizedCategory,
    };
  }

  const parts = normalizedCategory
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length > 1) {
    return {
      family: parts[0],
      label: normalizedCategory,
    };
  }

  for (const { prefix, family } of familyPrefixes) {
    if (normalizedCategory === prefix) {
      return {
        family,
        label: normalizedCategory,
      };
    }

    if (normalizedCategory.startsWith(`${prefix} `)) {
      return {
        family,
        label: normalizedCategory,
      };
    }
  }

  return null;
}

export function localizeSidebarItems(
  locale: SidebarLocale,
  items: SidebarLinkItem[],
): Array<SidebarLinkItem | SidebarGroupItem> {
  const grouped = new Map<string, SidebarLinkItem[]>();
  const standalone: SidebarLinkItem[] = [];

  for (const item of items) {
    const familyEntry = getSidebarFamily(item.text);
    if (familyEntry) {
      const family = familyEntry.family;
      const variant = familyEntry.label;
      const familyItems = grouped.get(family) ?? [];
      familyItems.push({
        text: trimLocalizedLabel(getCategoryLabel(locale, variant)),
        link: item.link,
      });
      grouped.set(family, familyItems);
      continue;
    }

    standalone.push({
      text: trimLocalizedLabel(getCategoryLabel(locale, item.text)),
      link: item.link,
    });
  }

  const groupedItems = Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([family, familyItems]) => ({
      collapsed: false,
      text: trimLocalizedLabel(getSidebarGroupLabel(locale, family)),
      items: familyItems.sort((left, right) =>
        left.text.localeCompare(right.text),
      ),
    }));

  const standaloneItems = standalone.sort((left, right) =>
    left.text.localeCompare(right.text),
  );

  return [...standaloneItems, ...groupedItems];
}

export const titlePhraseMaps: Record<
  SidebarLocale,
  Array<{
    pattern: RegExp;
    replacement: string | ((match: string, p1: string) => string);
  }>
> = {
  de: [],
  en: [
    {
      pattern: /fortg\.\s*Anfänger|Fortg\.\s*Anf\./gu,
      replacement: "Advanced Beginners",
    },
    { pattern: /fortg\./giu, replacement: "Advanced" },
    { pattern: /Anfänger|Anf\./gu, replacement: "Beginners" },
    { pattern: /\bund\b/gu, replacement: "and" },
    { pattern: /\bauch\b/gu, replacement: "also" },
    { pattern: /\bneue\b/gu, replacement: "new" },
    { pattern: /tägl\./gu, replacement: "Daily" },
    { pattern: /\bMon\b|\bMo\b/gu, replacement: "Mon" },
    { pattern: /\bTue\b|\bDi\b/gu, replacement: "Tue" },
    { pattern: /\bWed\b|\bMi\b/gu, replacement: "Wed" },
    { pattern: /\bThu\b|\bDo\b/gu, replacement: "Thu" },
    { pattern: /\bFri\b|\bFr\b/gu, replacement: "Fri" },
    { pattern: /\bSat\b|\bSa\b/gu, replacement: "Sat" },
    { pattern: /\bSun\b|\bSo\b/gu, replacement: "Sun" },
    { pattern: /\bnur am\s+(\d+[:.]\d+)\b/giu, replacement: "only at $1" },
    { pattern: /\bbis\s+(\d+)\s+Uhr\b/giu, replacement: "until $1" },
    { pattern: /\bbis\s+(\d+[:.]\d+)\b/giu, replacement: "until $1" },
    { pattern: /\bab\s+(\d+[:.]\d+-\d+[:.]\d+)\b/giu, replacement: "from $1" },
    { pattern: /\bab\s+(\d+)\s+Uhr\b/giu, replacement: "from $1" },
    { pattern: /\bab\s+(\d+[:.]\d+)\b/giu, replacement: "from $1" },
    { pattern: /\bab\b/giu, replacement: "from" },
    { pattern: /\bUhr\b/giu, replacement: "" },
  ],
  ja: [
    { pattern: /fortg\.\s*Anfänger|Fortg\.\s*Anf\./gu, replacement: "初中級" },
    { pattern: /fortg\./giu, replacement: "上級" },
    { pattern: /Anfänger|Anf\./gu, replacement: "初心者" },
    { pattern: /\bund\b/gu, replacement: "と" },
    { pattern: /\bauch\b/gu, replacement: "も" },
    { pattern: /\bneue\b/gu, replacement: "新しい" },
    { pattern: /tägl\./gu, replacement: "毎日" },
    { pattern: /\bMon\b|\bMo\b/gu, replacement: "月" },
    { pattern: /\bTue\b|\bDi\b/gu, replacement: "火" },
    { pattern: /\bWed\b|\bMi\b/gu, replacement: "水" },
    { pattern: /\bThu\b|\bDo\b/gu, replacement: "木" },
    { pattern: /\bFri\b|\bFr\b/gu, replacement: "金" },
    { pattern: /\bSat\b|\bSa\b/gu, replacement: "土" },
    { pattern: /\bSun\b|\bSo\b/gu, replacement: "日" },
    { pattern: /\bnur am\s+(\d+[:.]\d+)\b/giu, replacement: "$1のみ" },
    { pattern: /\bbis\s+(\d+)\s+Uhr\b/giu, replacement: "$1時まで" },
    { pattern: /\bbis\s+(\d+[:.]\d+)\b/giu, replacement: "$1まで" },
    { pattern: /\bab\s+(\d+[:.]\d+-\d+[:.]\d+)\b/giu, replacement: "$1から" },
    { pattern: /\bab\s+(\d+)\s+Uhr\b/giu, replacement: "$1時から" },
    { pattern: /\bab\s+(\d+[:.]\d+)\b/giu, replacement: "$1から" },
    { pattern: /\bab\b/giu, replacement: "から" },
    { pattern: /\bUhr\b/giu, replacement: "時" },
  ],
  ko: [
    { pattern: /fortg\.\s*Anfänger|Fortg\.\s*Anf\./gu, replacement: "초중급" },
    { pattern: /fortg\./giu, replacement: "고급" },
    { pattern: /Anfänger|Anf\./gu, replacement: "초보자" },
    { pattern: /\bund\b/gu, replacement: "및" },
    { pattern: /\bauch\b/gu, replacement: "포함" },
    { pattern: /\bneue\b/gu, replacement: "새로운" },
    { pattern: /tägl\./gu, replacement: "매일" },
    { pattern: /\bMon\b|\bMo\b/gu, replacement: "월" },
    { pattern: /\bTue\b|\bDi\b/gu, replacement: "화" },
    { pattern: /\bWed\b|\bMi\b/gu, replacement: "수" },
    { pattern: /\bThu\b|\bDo\b/gu, replacement: "목" },
    { pattern: /\bFri\b|\bFr\b/gu, replacement: "금" },
    { pattern: /\bSat\b|\bSa\b/gu, replacement: "토" },
    { pattern: /\bSun\b|\bSo\b/gu, replacement: "일" },
    { pattern: /\bnur am\s+(\d+[:.]\d+)\b/giu, replacement: "$1에만" },
    { pattern: /\bbis\s+(\d+)\s+Uhr\b/giu, replacement: "$1시까지" },
    { pattern: /\bbis\s+(\d+[:.]\d+)\b/giu, replacement: "$1까지" },
    { pattern: /\bab\s+(\d+[:.]\d+-\d+[:.]\d+)\b/giu, replacement: "$1부터" },
    { pattern: /\bab\s+(\d+)\s+Uhr\b/giu, replacement: "$1시부터" },
    { pattern: /\bab\s+(\d+[:.]\d+)\b/giu, replacement: "$1부터" },
    { pattern: /\bab\b/giu, replacement: "부터" },
    { pattern: /\bUhr\b/giu, replacement: "시" },
  ],
  "zh-CN": [
    { pattern: /fortg\.\s*Anfänger|Fortg\.\s*Anf\./gu, replacement: "初中级" },
    { pattern: /fortg\./giu, replacement: "进阶" },
    { pattern: /Anfänger|Anf\./gu, replacement: "初学者" },
    { pattern: /\bund\b/gu, replacement: "及" },
    { pattern: /\bauch\b/gu, replacement: "也包括" },
    { pattern: /\bneue\b/gu, replacement: "新" },
    { pattern: /tägl\./gu, replacement: "每日" },
    { pattern: /\bMon\b|\bMo\b/gu, replacement: "周一" },
    { pattern: /\bTue\b|\bDi\b/gu, replacement: "周二" },
    { pattern: /\bWed\b|\bMi\b/gu, replacement: "周三" },
    { pattern: /\bThu\b|\bDo\b/gu, replacement: "周四" },
    { pattern: /\bFri\b|\bFr\b/gu, replacement: "周五" },
    { pattern: /\bSat\b|\bSa\b/gu, replacement: "周六" },
    { pattern: /\bSun\b|\bSo\b/gu, replacement: "周日" },
    { pattern: /\bnur am\s+(\d+[:.]\d+)\b/giu, replacement: "仅限 $1" },
    { pattern: /\bbis\s+(\d+)\s+Uhr\b/giu, replacement: "截至 $1点" },
    { pattern: /\bbis\s+(\d+[:.]\d+)\b/giu, replacement: "截至 $1" },
    { pattern: /\bab\s+(\d+[:.]\d+-\d+[:.]\d+)\b/giu, replacement: "$1起" },
    { pattern: /\bab\s+(\d+)\s+Uhr\b/giu, replacement: "$1点起" },
    { pattern: /\bab\s+(\d+[:.]\d+)\b/giu, replacement: "$1起" },
    { pattern: /\bab\b/giu, replacement: "起" },
    { pattern: /\bUhr\b/giu, replacement: "点" },
  ],
};

const weekdayTokenMaps: Record<SidebarLocale, Record<string, string>> = {
  de: {
    Mon: "Mon",
    Mo: "Mo",
    Tue: "Tue",
    Di: "Di",
    Wed: "Wed",
    Mi: "Mi",
    Thu: "Thu",
    Do: "Do",
    Fri: "Fri",
    Fr: "Fr",
    Sat: "Sat",
    Sa: "Sa",
    Sun: "Sun",
    So: "So",
  },
  en: {
    Mon: "Mon",
    Mo: "Mon",
    Tue: "Tue",
    Di: "Tue",
    Wed: "Wed",
    Mi: "Wed",
    Thu: "Thu",
    Do: "Thu",
    Fri: "Fri",
    Fr: "Fri",
    Sat: "Sat",
    Sa: "Sat",
    Sun: "Sun",
    So: "Sun",
  },
  ja: {
    Mon: "月",
    Mo: "月",
    Tue: "火",
    Di: "火",
    Wed: "水",
    Mi: "水",
    Thu: "木",
    Do: "木",
    Fri: "金",
    Fr: "金",
    Sat: "土",
    Sa: "土",
    Sun: "日",
    So: "日",
  },
  ko: {
    Mon: "월",
    Mo: "월",
    Tue: "화",
    Di: "화",
    Wed: "수",
    Mi: "수",
    Thu: "목",
    Do: "목",
    Fri: "금",
    Fr: "금",
    Sat: "토",
    Sa: "토",
    Sun: "일",
    So: "일",
  },
  "zh-CN": {
    Mon: "周一",
    Mo: "周一",
    Tue: "周二",
    Di: "周二",
    Wed: "周三",
    Mi: "周三",
    Thu: "周四",
    Do: "周四",
    Fri: "周五",
    Fr: "周五",
    Sat: "周六",
    Sa: "周六",
    Sun: "周日",
    So: "周日",
  },
};

const weekdayRangeSeparators: Record<SidebarLocale, string> = {
  de: "-",
  en: "-",
  ja: "〜",
  ko: "-",
  "zh-CN": "至",
};

function localizeWeekdayRanges(
  value: string,
  locale: SidebarLocale,
): string {
  if (locale === "de") return value;

  const weekdayTokenMap = weekdayTokenMaps[locale];
  const separator = weekdayRangeSeparators[locale];
  const weekdayTokens = Object.keys(weekdayTokenMap).join("|");
  const pattern = new RegExp(
    `\\b(${weekdayTokens})\\b\\s*(?:-|–|—|bis)\\s*\\b(${weekdayTokens})\\b`,
    "gu",
  );

  return value.replace(pattern, (_match, start: string, end: string) => {
    const localizedStart = weekdayTokenMap[start] ?? start;
    const localizedEnd = weekdayTokenMap[end] ?? end;
    return `${localizedStart}${separator}${localizedEnd}`;
  });
}

function normalizeLocalizedWeekdayRangeSeparators(
  value: string,
  locale: SidebarLocale,
): string {
  if (locale === "ja") {
    return value.replace(
      /([月火水木金土日])\s*-\s*([月火水木金土日])/gu,
      "$1〜$2",
    );
  }

  if (locale === "zh-CN") {
    return value.replace(
      /(周[一二三四五六日])\s*-\s*(周[一二三四五六日])/gu,
      "$1至$2",
    );
  }

  return value;
}

export function localizeWorkoutTitle(
  value: string,
  locale: SidebarLocale,
): string {
  const normalizedValue = normalizeTranslationKey(value);

  // 0. Direct title/category map
  const workoutTitleMap = getWorkoutTitleMap();
  const workoutCategoryMap = getWorkoutCategoryMap();
  const directMatch =
    getLocalizedValue(workoutTitleMap, locale, normalizedValue) ??
    getLocalizedValue(workoutCategoryMap, locale, normalizedValue);
  if (directMatch) return directMatch;

  // 1. Exact match via discovery/category mapping
  const directLabel = getCategoryLabel(locale, normalizedValue);
  if (directLabel !== normalizedValue) {
    return directLabel;
  }

  // 2. Fallback to fragment-based replacement
  let result = localizeKnownCategoryFragments(locale, normalizedValue);
  result = localizeWeekdayRanges(result, locale);

  // 3. Fallback to phrase maps (legacy rules)
  for (const rule of titlePhraseMaps[locale]) {
    result = result.replace(rule.pattern, rule.replacement as any);
  }

  result = normalizeLocalizedWeekdayRangeSeparators(result, locale);

  return result.replace(/\s+/g, " ").trim();
}
