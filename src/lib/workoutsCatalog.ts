import type { WorkoutDetailResponse as WorkoutDetailRecord } from "./workoutsApi";

export type WorkoutDetailItem = WorkoutDetailRecord & {
  category: string;
};

export type WorkoutTitleGroup = {
  title: string;
  items: WorkoutDetailItem[];
};

export type WorkoutCategoryGroup = {
  category: string;
  items: WorkoutDetailItem[];
  titleGroups: WorkoutTitleGroup[];
};

export type WorkoutDetailCatalog = {
  categories: string[];
  groups: Record<string, WorkoutCategoryGroup>;
};

export type WorkoutCategoryPage = {
  category: string;
  slug: string;
  route: string;
  path: string;
  group: WorkoutCategoryGroup;
};

export const UNCATEGORIZED_LABEL = "Uncategorized";
export const CATEGORY_INDEX_PATH = "docs/workouts";

const categoryAliases: Record<string, string> = {
  "Gesellschaftstanz Semestergebühr": "Semestergebühr",
  "Kanu-/Rudersport Semestergebühr": "Semestergebühr",
};

function normalizeCategory(category: string | null): string {
  const normalized = category?.trim() || UNCATEGORIZED_LABEL;
  return categoryAliases[normalized] ?? normalized;
}

function slugifyCategory(category: string): string {
  return (
    category
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "category"
  );
}

function normalizeTitleGroupKey(title: string): string {
  return title.trim();
}

function normalizeLocations(
  location: string[] | string | null | undefined,
): string[] {
  const rawValues = Array.isArray(location) ? location : [location];
  return rawValues
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function normalizeText(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeDescriptionFields(
  description: WorkoutDetailRecord["description"],
): WorkoutDetailRecord["description"] | undefined {
  const general = normalizeText(description?.general);
  const price = normalizeText(description?.price);

  if (!general && !price) {
    return undefined;
  }

  return { general, price };
}

const WEEKDAY_ALIASES: Record<string, string> = {
  Montag: "Mon",
  Monday: "Mon",
  Mon: "Mon",
  Mo: "Mon",
  Dienstag: "Tue",
  Tuesday: "Tue",
  Tue: "Tue",
  Di: "Tue",
  Mittwoch: "Wed",
  Wednesday: "Wed",
  Wed: "Wed",
  Mi: "Wed",
  Donnerstag: "Thu",
  Thursday: "Thu",
  Thu: "Thu",
  Do: "Thu",
  Freitag: "Fri",
  Friday: "Fri",
  Fri: "Fri",
  Fr: "Fri",
  Samstag: "Sat",
  Saturday: "Sat",
  Sat: "Sat",
  Sa: "Sat",
  Sonntag: "Sun",
  Sunday: "Sun",
  Sun: "Sun",
  So: "Sun",
};

function normalizeSchedule(
  schedule: WorkoutDetailRecord["schedule"] | null | undefined,
): WorkoutDetailRecord["schedule"] {
  if (!Array.isArray(schedule)) return [];

  return schedule.flatMap((entry) => {
    const normalizedTime = entry.time?.trim() ?? "";
    const normalizedLocation = entry.location?.trim() ?? "";
    const rawDay = entry.day?.trim() ?? "";
    if (!rawDay) {
      return [
        {
          day: rawDay,
          time: normalizedTime,
          location: normalizedLocation,
        },
      ];
    }

    const dayParts = rawDay
      .split(/\s*[、,/;]\s*/g)
      .map((part) => part.trim())
      .filter(Boolean);

    return dayParts.map((day) => ({
      day: WEEKDAY_ALIASES[day] ?? day,
      time: normalizedTime,
      location: normalizedLocation,
    }));
  });
}

function normalizePrice(
  price: WorkoutDetailRecord["price"] | null | undefined,
): WorkoutDetailRecord["price"] | undefined {
  if (!price) return undefined;

  const normalized = Object.fromEntries(
    Object.entries(price).filter(([, value]) => value != null),
  ) as WorkoutDetailRecord["price"];

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function normalizeWorkoutDetailItem(
  record: WorkoutDetailRecord,
): WorkoutDetailItem {
  const {
    bookingUrl: _legacyBookingUrl,
    location,
    ...rest
  } = record as WorkoutDetailRecord & {
    bookingUrl?: string | null;
    location?: string[] | string | null;
    description?: WorkoutDetailRecord["description"] | string | null;
  };

  const legacyDescription =
    typeof record.description === "string"
      ? { general: record.description }
      : record.description;

  return {
    ...rest,
    category: normalizeCategory(record.category),
    description: normalizeDescriptionFields(legacyDescription),
    schedule: normalizeSchedule(record.schedule),
    location: normalizeLocations(location),
    price: normalizePrice(record.price),
  };
}

const WEEKDAY_ORDER: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

const naturalTitleCollator = new Intl.Collator("de", {
  numeric: true,
  sensitivity: "base",
});

const TITLE_WEEKDAY_ORDER: Array<[RegExp, number]> = [
  [/\b(?:Mon|Mo)\b|周一|月曜日|月曜|月/, 1],
  [/\b(?:Tue|Di)\b|周二|火曜日|火曜|火/, 2],
  [/\b(?:Wed|Mi)\b|周三|水曜日|水曜|水/, 3],
  [/\b(?:Thu|Do)\b|周四|木曜日|木曜|木/, 4],
  [/\b(?:Fri|Fr)\b|周五|金曜日|金曜|金/, 5],
  [/\b(?:Sat|Sa)\b|周六|土曜日|土曜|土/, 6],
  [/\b(?:Sun|So)\b|周日|日曜日|日曜|日/, 7],
];

function getTitleWeekdayOrder(title: string): number | null {
  for (const [pattern, order] of TITLE_WEEKDAY_ORDER) {
    if (pattern.test(title)) return order;
  }
  return null;
}

function compareTitleGroups(left: string, right: string): number {
  const leftWeekday = getTitleWeekdayOrder(left);
  const rightWeekday = getTitleWeekdayOrder(right);

  if (
    leftWeekday != null &&
    rightWeekday != null &&
    leftWeekday !== rightWeekday
  ) {
    return leftWeekday - rightWeekday;
  }

  if (leftWeekday != null && rightWeekday == null) return -1;
  if (leftWeekday == null && rightWeekday != null) return 1;

  return naturalTitleCollator.compare(left, right);
}

function buildTitleGroups(items: WorkoutDetailItem[]): WorkoutTitleGroup[] {
  const grouped = Object.groupBy(items, (item) =>
    normalizeTitleGroupKey(item.title),
  ) as Record<string, WorkoutDetailItem[]>;

  return Object.keys(grouped)
    .sort(compareTitleGroups)
    .map((title) => {
      const groupItems = grouped[title] ?? [];

      // Sort items by schedule (first day, then time)
      groupItems.sort((a, b) => {
        const schedA = a.schedule[0];
        const schedB = b.schedule[0];

        if (!schedA && !schedB) return 0;
        if (!schedA) return 1;
        if (!schedB) return -1;

        const dayA = WEEKDAY_ORDER[schedA.day] ?? 99;
        const dayB = WEEKDAY_ORDER[schedB.day] ?? 99;

        if (dayA !== dayB) return dayA - dayB;
        return schedA.time.localeCompare(schedB.time);
      });

      return {
        title,
        items: groupItems,
      };
    });
}

export function buildWorkoutDetailCatalog(
  records: Record<string, WorkoutDetailRecord>,
): WorkoutDetailCatalog {
  const items = Object.values(records).map(normalizeWorkoutDetailItem);
  const grouped = Object.groupBy(items, (item) => item.category) as Record<
    string,
    WorkoutDetailItem[]
  >;
  const categories = Object.keys(grouped).sort((left, right) =>
    left.localeCompare(right),
  );

  const groups = Object.fromEntries(
    categories.map((category) => [
      category,
      {
        category,
        items: grouped[category] ?? [],
        titleGroups: buildTitleGroups(grouped[category] ?? []),
      },
    ]),
  ) as Record<string, WorkoutCategoryGroup>;

  return { categories, groups };
}

export function buildWorkoutCategoryPages(catalog: WorkoutDetailCatalog): {
  sidebar: Array<{ text: string; link: string }>;
  pages: WorkoutCategoryPage[];
};
export function buildWorkoutCategoryPages(
  catalog: WorkoutDetailCatalog,
  options?: { docsBasePath?: string; routeBasePath?: string },
): {
  sidebar: Array<{ text: string; link: string }>;
  pages: WorkoutCategoryPage[];
} {
  const docsBasePath = options?.docsBasePath ?? CATEGORY_INDEX_PATH;
  const routeBasePath = options?.routeBasePath ?? "/workouts";
  const pages = catalog.categories.map((category) => {
    const slug = slugifyCategory(category);
    return {
      category,
      slug,
      route: `${routeBasePath}/${slug}`,
      path: `${docsBasePath}/${slug}.md`,
      group: catalog.groups[category],
    };
  });

  return {
    sidebar: pages.map((page) => ({ text: page.category, link: page.route })),
    pages,
  };
}
