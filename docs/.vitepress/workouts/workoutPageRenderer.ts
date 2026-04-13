import type {
  WorkoutDetailItem,
  WorkoutTitleGroup,
} from "../../../src/lib/workoutsCatalog";
import { formatWorkoutDurationLocalized } from "../../../src/lib/workoutDate";
import {
  getCategoryLabel,
  localizeKnownCategoryFragments,
  localizeWorkoutTitle,
  type SidebarLocale,
} from "../../../src/lib/workoutSidebarI18n";
import {
  getWorkoutPageCopy,
  getWeekdayRangeSeparator,
  localizeEmbeddedWeekdayTokens,
  localizeWeekday,
} from "../../../src/lib/workoutPageLocale";
import { getCategoryWikipediaLinks } from "../../../src/lib/workoutCategoryWikipediaMap";
import {
  buildWorkoutIndexDescription,
  buildWorkoutPageDescription,
} from "../seo";

// ── Utilities ─────────────────────────────────────────────────────────────────

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatStatus(
  value: string | undefined,
  locale: SidebarLocale,
): string {
  const copy = getWorkoutPageCopy(locale);
  const normalized = normalizeBookingStatus(value);
  const normalizedUnderscore = normalized.replace(/\s+/g, "_");
  if (
    !normalized ||
    normalized === "tbd" ||
    normalized === "status_tbd" ||
    normalized === "unknown"
  ) {
    return copy.statusTbd;
  }
  return (
    copy.statusLabels[normalized] ??
    copy.statusLabels[normalizedUnderscore] ??
    value!.replace(/_/g, " ")
  );
}

function normalizeBookingStatus(value: string | undefined): string {
  const normalized = (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  const aliases: Record<string, string> = {
    cancelled: "canceled",
    waitinglist: "waitlist",
    "waiting list": "waitlist",
    "fully booked": "fully_booked",
  };

  return aliases[normalized] ?? normalized;
}

function statusBadgeType(
  value: string | undefined,
): "info" | "tip" | "warning" | "danger" {
  const normalized = normalizeBookingStatus(value);
  if (
    normalized.includes("cancel") ||
    normalized.includes("closed") ||
    normalized.includes("expired") ||
    normalized.includes("fully")
  ) {
    return "danger";
  }
  if (normalized.includes("wait") || normalized.includes("restricted")) {
    return "warning";
  }
  if (normalized.includes("available") || normalized.includes("scheduled")) {
    return "tip";
  }
  return "info";
}

function localizeScheduleTime(value: string, locale: SidebarLocale): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const replacements: Record<SidebarLocale, Array<[RegExp, string]>> = {
    de: [],
    en: [
      [/\bnur am\s+(\d+[:.]\d+\.?)/giu, "only at $1"],
      [/\bbis\s+(\d+)\s+Uhr\b/giu, "until $1"],
      [/\bbis\s+(\d+[:.]\d+\.?)/giu, "until $1"],
      [/\bab\s+(\d+)\s+Uhr\b/giu, "from $1"],
      [/\bab\s+(\d+[:.]\d+\.?)/giu, "from $1"],
    ],
    ja: [
      [/\bnur am\s+(\d+[:.]\d+\.?)/giu, "$1のみ"],
      [/\bbis\s+(\d+)\s+Uhr\b/giu, "$1時まで"],
      [/\bbis\s+(\d+[:.]\d+\.?)/giu, "$1まで"],
      [/\bab\s+(\d+)\s+Uhr\b/giu, "$1時から"],
      [/\bab\s+(\d+[:.]\d+\.?)/giu, "$1から"],
    ],
    ko: [
      [/\bnur am\s+(\d+[:.]\d+\.?)/giu, "$1에만"],
      [/\bbis\s+(\d+)\s+Uhr\b/giu, "$1시까지"],
      [/\bbis\s+(\d+[:.]\d+\.?)/giu, "$1까지"],
      [/\bab\s+(\d+)\s+Uhr\b/giu, "$1시부터"],
      [/\bab\s+(\d+[:.]\d+\.?)/giu, "$1부터"],
    ],
    "zh-CN": [
      [/\bnur am\s+(\d+[:.]\d+\.?)/giu, "仅限 $1"],
      [/\bbis\s+(\d+)\s+Uhr\b/giu, "截至 $1点"],
      [/\bbis\s+(\d+[:.]\d+\.?)/giu, "截至 $1"],
      [/\bab\s+(\d+)\s+Uhr\b/giu, "$1点起"],
      [/\bab\s+(\d+[:.]\d+\.?)/giu, "$1起"],
    ],
  };

  let result = localizeEmbeddedWeekdayTokens(trimmed, locale);

  for (const [pattern, replacement] of replacements[locale]) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function localizeGroupHeaderTitle(
  value: string,
  locale: SidebarLocale,
): string {
  return localizeWorkoutTitle(value, locale);
}

function renderScheduleCards(
  item: WorkoutDetailItem,
  locale: SidebarLocale,
): string {
  const copy = getWorkoutPageCopy(locale);
  const { scheduleLocations } = resolveScheduleLocations(item);
  const status = formatStatus(item.bookingStatus, locale);
  const badgeType = statusBadgeType(item.bookingStatus);
  const showStatusBadge = shouldRenderTimelineStatusBadge(item.bookingStatus);
  const opensAt = formatOpeningDateTime(item, locale);
  const duration = formatDuration(item, locale);

  const groups =
    item.schedule.length === 0
      ? []
      : groupScheduleEntries(item, scheduleLocations, locale);

  if (groups.length === 0) {
    return renderScheduleViews(
      copy.scheduleTbd,
      [
        {
          dayLabel: "",
          time: "",
          localizedTime: copy.scheduleTbd,
          location: "",
        },
      ],
      item,
      {
        status,
        badgeType,
        showStatusBadge,
        opensAt,
        duration,
      },
      locale,
      true,
    );
  }

  return renderScheduleViews(
    null,
    groups.map((group) => ({
      ...group,
      localizedTime: localizeScheduleTime(group.time, locale),
    })),
    item,
    {
      status,
      badgeType,
      showStatusBadge,
      opensAt,
      duration,
    },
    locale,
    false,
  );
}

function renderScheduleViews(
  emptyLabel: string | null,
  groups: Array<{
    dayLabel: string;
    time: string;
    localizedTime: string;
    location: string;
  }>,
  item: WorkoutDetailItem,
  shared: {
    status: string;
    badgeType: "info" | "tip" | "warning" | "danger";
    showStatusBadge: boolean;
    opensAt: string;
    duration: string;
  },
  locale: SidebarLocale,
  isEmpty: boolean,
): string {
  const groupedByTime = groupScheduleEntriesByTime(groups);

  const timeline = groupedByTime
    .map((timeGroup, index) => {
      const uniqueDayLabels = [
        ...new Set(
          timeGroup.entries.map((group) => group.dayLabel).filter(Boolean),
        ),
      ];

      return (
        `<section class="workout-schedule-timeline-item${index === 0 ? " is-first" : ""}${index === groupedByTime.length - 1 ? " is-last" : ""}">` +
        `<div class="workout-schedule-timeline-left">` +
        `<div class="workout-schedule-timeline-time">${escapeHtml(timeGroup.localizedTime)}</div>` +
        (uniqueDayLabels.length > 0
          ? uniqueDayLabels
              .map(
                (dayLabel) =>
                  `<div class="workout-schedule-timeline-day">${escapeHtml(dayLabel)}</div>`,
              )
              .join("")
          : `<div class="workout-schedule-timeline-day is-empty"></div>`) +
        `</div>` +
        `<div class="workout-schedule-timeline-rail"><div class="workout-schedule-entry-node"></div></div>` +
        `<div class="workout-schedule-timeline-details">` +
        (index === 0
          ? renderScheduleHeader(
              shared.status,
              shared.badgeType,
              shared.showStatusBadge,
              shared.opensAt,
              locale,
            )
          : "") +
        `<div class="workout-schedule-timeline-locations">` +
        timeGroup.entries
          .map((group) => renderScheduleLocation(group.location, locale))
          .join("") +
        `</div>` +
        (index === groupedByTime.length - 1
          ? renderScheduleMeta(
              item,
              {
                location: "",
                duration: shared.duration,
              },
              locale,
            )
          : "") +
        `</div>` +
        `</section>`
      );
    })
    .join("");

  return [
    `<div class="workout-schedule-shell${isEmpty ? " is-empty" : ""}">`,
    `<div class="workout-schedule-timeline">${timeline}</div>`,
    `</div>`,
  ].join("");
}

function renderScheduleHeader(
  status: string,
  badgeType: "info" | "tip" | "warning" | "danger",
  showStatusBadge: boolean,
  opensAt: string,
  locale: SidebarLocale,
): string {
  const copy = getWorkoutPageCopy(locale);
  const statusHtml = showStatusBadge
    ? `<div class="workout-schedule-entry-status">${renderScheduleStatus(status, badgeType)}</div>`
    : "";

  return [
    `<div class="workout-schedule-entry-header">`,
    statusHtml,
    opensAt
      ? `  <div class="workout-schedule-entry-opens">${escapeHtml(copy.opensLabel)} ${escapeHtml(opensAt)}</div>`
      : "",
    `</div>`,
  ]
    .filter(Boolean)
    .join("");
}

function renderScheduleMeta(
  item: WorkoutDetailItem,
  options: {
    location: string;
    duration: string;
  },
  locale: SidebarLocale,
): string {
  const copy = getWorkoutPageCopy(locale);
  const instructor = item.instructor?.trim();

  return [
    `<div class="workout-schedule-entry-meta">`,
    options.location
      ? `<div class="workout-schedule-entry-detail is-location"><span class="workout-schedule-entry-label">${escapeHtml(copy.locationLabel)}</span><strong>${escapeHtml(options.location)}</strong></div>`
      : "",
    options.duration
      ? `<div class="workout-schedule-entry-detail is-duration"><span class="workout-schedule-entry-label">${escapeHtml(formatSessionCount(item, locale) || copy.durationLabel)}</span><strong>${escapeHtml(options.duration)}</strong></div>`
      : "",
    instructor
      ? `<div class="workout-schedule-entry-detail is-instructor"><span class="workout-schedule-entry-label">${escapeHtml(copy.instructorLabel)}</span><strong>${escapeHtml(instructor)}</strong></div>`
      : "",
    `<div class="workout-schedule-entry-price">${formatPriceRange(item, locale)}</div>`,
    `</div>`,
  ]
    .filter(Boolean)
    .join("");
}

function renderScheduleLocation(
  location: string,
  locale: SidebarLocale,
  className = "workout-schedule-entry-location",
): string {
  if (!location) return "";
  const copy = getWorkoutPageCopy(locale);
  return `<div class="${className}"><span class="workout-schedule-entry-label">${escapeHtml(copy.locationLabel)}</span><strong>${escapeHtml(location)}</strong></div>`;
}

function renderScheduleStatus(
  status: string,
  badgeType: "info" | "tip" | "warning" | "danger",
): string {
  return `<Badge type="${badgeType}" text="${escapeHtml(status)}" />`;
}

function formatGroupStatusSummary(
  items: WorkoutDetailItem[],
  locale: SidebarLocale,
): string {
  const counts = new Map<string, number>();
  for (const item of items) {
    const normalized = normalizeBookingStatus(item.bookingStatus).replace(
      /\s+/g,
      "_",
    );
    if (!GROUP_SUMMARY_STATUSES.includes(normalized as GroupSummaryStatus)) {
      continue;
    }
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  if (counts.size === 0) return "";

  const copy = getWorkoutPageCopy(locale);
  const parts = GROUP_SUMMARY_STATUSES
    .map((status) => {
      const count = counts.get(status);
      if (!count) return "";
      const label = copy.statusLabels[status] ?? formatStatus(status, locale);
      const badgeType = statusBadgeType(status);
      return `<Badge type="${badgeType}" text="${escapeHtml(`${count} ${label}`)}" />`;
    })
    .filter(Boolean);

  if (parts.length === 0) return "";

  return `<div class="workout-group-status-summary">${parts.join("")}</div>`;
}

const GROUP_SUMMARY_STATUSES = [
  "expired",
  "waitlist",
  "canceled",
  "fully_booked",
] as const;

type GroupSummaryStatus = (typeof GROUP_SUMMARY_STATUSES)[number];

function shouldRenderTimelineStatusBadge(value: string | undefined): boolean {
  const normalized = normalizeBookingStatus(value).replace(/\s+/g, "_");
  return !GROUP_SUMMARY_STATUSES.includes(normalized as GroupSummaryStatus);
}

function groupScheduleEntriesByTime(
  groups: Array<{
    dayLabel: string;
    time: string;
    localizedTime: string;
    location: string;
  }>,
): Array<{
  time: string;
  localizedTime: string;
  entries: Array<{
    dayLabel: string;
    time: string;
    localizedTime: string;
    location: string;
  }>;
}> {
  const groupedByTime = new Map<
    string,
    {
      time: string;
      localizedTime: string;
      entries: Array<{
        dayLabel: string;
        time: string;
        localizedTime: string;
        location: string;
      }>;
    }
  >();
  const order: string[] = [];

  groups.forEach((group) => {
    const existing = groupedByTime.get(group.time);
    if (existing) {
      existing.entries.push(group);
      return;
    }

    groupedByTime.set(group.time, {
      time: group.time,
      localizedTime: group.localizedTime,
      entries: [group],
    });
    order.push(group.time);
  });

  return order.map((time) => groupedByTime.get(time)!);
}

const WEEKDAY_ORDER: Record<string, number> = {
  Mo: 1,
  Mon: 1,
  Di: 2,
  Tue: 2,
  Mi: 3,
  Wed: 3,
  Do: 4,
  Thu: 4,
  Fr: 5,
  Fri: 5,
  Sa: 6,
  Sat: 6,
  So: 7,
  Sun: 7,
};

function formatGroupedDays(days: string[], locale: SidebarLocale): string {
  const localizedDays = days.map((day) => localizeWeekday(day, locale));
  if (days.length === 0) return "";
  if (days.length === 1) return localizedDays[0];

  const dayNumbers = days.map((day) => WEEKDAY_ORDER[day] ?? -1);
  const uniqueDayNumbers = new Set(dayNumbers.filter((day) => day > 0));

  if (uniqueDayNumbers.size === 7) {
    const separator = getWeekdayRangeSeparator(locale);
    return `${localizedDays[0]}${separator}${localizedDays[localizedDays.length - 1]}`;
  }

  const isContinuous = dayNumbers.every((day, index) =>
    index === 0 ? true : day === dayNumbers[index - 1] + 1,
  );

  if (isContinuous) {
    const separator = getWeekdayRangeSeparator(locale);
    return `${localizedDays[0]}${separator}${localizedDays[localizedDays.length - 1]}`;
  }

  return localizedDays.join(
    locale === "zh-CN" || locale === "ja" ? "、" : ", ",
  );
}

function groupScheduleEntries(
  item: WorkoutDetailItem,
  scheduleLocations: string[],
  locale: SidebarLocale,
): Array<{ dayLabel: string; time: string; location: string }> {
  const groups = new Map<
    string,
    { days: string[]; time: string; location: string }
  >();
  const order: string[] = [];

  item.schedule.forEach((entry, index) => {
    const location = scheduleLocations[index] ?? "";
    const key = `${entry.time}__${location}`;
    const existing = groups.get(key);
    if (existing) {
      if (!existing.days.includes(entry.day)) {
        existing.days.push(entry.day);
      }
      return;
    }

    groups.set(key, {
      days: [entry.day],
      time: entry.time,
      location,
    });
    order.push(key);
  });

  return order.map((key) => {
    const group = groups.get(key)!;
    return {
      dayLabel: formatGroupedDays(group.days, locale),
      time: group.time,
      location: group.location,
    };
  });
}

function normalizeLocationValue(value: string): string {
  return cleanLocationText(value).toLowerCase();
}

function cleanLocationText(value: string): string {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

function expandTopLevelLocations(values: string[]): string[] {
  return values
    .flatMap((value) => value.split(/\s*;\s*/g))
    .map((value) => cleanLocationText(value))
    .filter(Boolean);
}

function resolveScheduleLocations(item: WorkoutDetailItem): {
  scheduleLocations: string[];
  unmatchedTopLevelLocations: string[];
} {
  const topLevelLocations = expandTopLevelLocations(
    item.location?.map((value) => value?.trim()).filter(Boolean) as string[],
  );

  if (topLevelLocations.length === 1) {
    return {
      scheduleLocations: item.schedule.map(() => topLevelLocations[0]),
      unmatchedTopLevelLocations: [],
    };
  }

  if (item.schedule.length === 1) {
    return {
      scheduleLocations: [
        topLevelLocations.join("; ") ||
          cleanLocationText(item.schedule[0]?.location ?? "") ||
          "",
      ],
      unmatchedTopLevelLocations: [],
    };
  }

  const matchedTopLevelIndexes = new Set<number>();

  const scheduleLocations = item.schedule.map((entry) => {
    const shortLocation = cleanLocationText(entry.location ?? "");
    if (!shortLocation) return "";

    const normalizedShortLocation = normalizeLocationValue(shortLocation);
    const matches = topLevelLocations
      .map((value, index) => ({ value, index }))
      .filter(({ value }) =>
        normalizeLocationValue(value).startsWith(normalizedShortLocation),
      );

    if (matches.length === 1) {
      matchedTopLevelIndexes.add(matches[0].index);
      return matches[0].value;
    }

    return shortLocation;
  });

  return {
    scheduleLocations,
    unmatchedTopLevelLocations: topLevelLocations.filter(
      (_, index) => !matchedTopLevelIndexes.has(index),
    ),
  };
}

function formatDuration(
  item: WorkoutDetailItem,
  locale: SidebarLocale,
): string {
  const copy = getWorkoutPageCopy(locale);
  return formatWorkoutDurationLocalized(
    item.startDate,
    item.endDate,
    item.semester,
    copy.dateLocale,
  );
}

function formatSessionCount(
  item: WorkoutDetailItem,
  locale: SidebarLocale,
): string {
  const copy = getWorkoutPageCopy(locale);
  const count = item.sessionCount ?? 0;
  if (count <= 0) return "";
  if (locale === "ja" || locale === "ko" || locale === "zh-CN") {
    return `${count}${copy.sessionPlural}`;
  }
  return `${count} ${count === 1 ? copy.sessionSingular : copy.sessionPlural}`;
}

function formatOpeningDateTime(
  item: WorkoutDetailItem,
  locale: SidebarLocale,
): string {
  if (item.bookingStatus !== "scheduled" || !item.bookingOpensAt) return "";

  const copy = getWorkoutPageCopy(locale);
  const date = new Date(item.bookingOpensAt);
  if (Number.isNaN(date.getTime())) return item.bookingLabel ?? "";

  const dateText = date.toLocaleDateString(copy.dateLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = date.toLocaleTimeString(
    locale === "en" ? "en-GB" : copy.dateLocale,
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  );

  if (locale === "ja" || locale === "ko" || locale === "zh-CN")
    return `${dateText} ${time}`;
  if (locale === "de") return `${dateText}, ${time}`;
  return `${dateText} at ${time}`;
}

function splitLocation(item: WorkoutDetailItem): {
  title: string;
  detail: string;
} {
  const topLevelLocations = (Array.isArray(item.location) ? item.location : [])
    .map((value) => value?.trim())
    .filter(Boolean) as string[];
  const uniqueLocations = [
    ...new Set(item.schedule.map((s) => s.location?.trim()).filter(Boolean)),
  ];
  const title =
    uniqueLocations.length > 0 ? uniqueLocations.join("; ") : "Location";
  const location = topLevelLocations.join("; ");

  if (!location) return { title, detail: "" };

  const normalizedTitle = title.toLowerCase();
  const normalizedLocation = location.toLowerCase();

  if (normalizedLocation.startsWith(normalizedTitle)) {
    const remainder = location.slice(title.length).replace(/^[,\s]+/, "");
    return { title, detail: remainder };
  }

  return { title, detail: location };
}

function formatPriceRange(
  item: WorkoutDetailItem,
  locale: SidebarLocale,
): string {
  const copy = getWorkoutPageCopy(locale);
  const entries = [
    { label: copy.priceLabels.student, value: item.price?.student },
    { label: copy.priceLabels.staff, value: item.price?.staff },
    { label: copy.priceLabels.external, value: item.price?.external },
    {
      label: copy.priceLabels.externalReduced,
      value: item.price?.externalReduced,
    },
    { label: copy.priceLabels.adults, value: item.price?.adults },
    { label: copy.priceLabels.children, value: item.price?.children },
    { label: copy.priceLabels.discount, value: item.price?.discount },
  ].filter((entry) => entry.value != null);

  if (entries.length === 0) {
    return `<div class="workout-price-value">${escapeHtml(copy.priceTbd)}</div>`;
  }

  return entries
    .map(
      (entry) =>
        `<div class="workout-price-item">` +
        `<span class="workout-price-label">${escapeHtml(entry.label)}</span>` +
        `<span class="workout-price-value">€${escapeHtml(String(entry.value))}</span>` +
        `</div>`,
    )
    .join("");
}

function normalizeMarkdownBlock(value: string | null | undefined): string {
  return value?.replace(/\\n/g, "\n").trim().replace(/\r\n/g, "\n") ?? "";
}

function isMarkdownListLine(value: string): boolean {
  return /^([-*+]|\d+\.)\s/.test(value);
}

function shouldJoinDescriptionLines(previous: string, next: string): boolean {
  if (!previous || !next) return false;
  if (isMarkdownListLine(previous) || isMarkdownListLine(next)) return false;
  if (/[.!?:)]$/.test(previous)) return false;
  return /^[a-z(]/.test(next);
}

function formatBulletedDescriptionBlock(
  value: string | null | undefined,
  options: { joinSoftWraps: boolean },
): string {
  const normalized = normalizeMarkdownBlock(value);
  if (!normalized) return "";

  let previousWasBlank = false;
  const mergedLines = normalized
    .split("\n")
    .reduce<string[]>((lines, rawLine) => {
      const line = rawLine.trim();

      if (!line) {
        previousWasBlank = true;
        return lines;
      }

      const previous = lines.at(-1);
      if (
        options.joinSoftWraps &&
        !previousWasBlank &&
        previous &&
        shouldJoinDescriptionLines(previous, line)
      ) {
        lines[lines.length - 1] = `${previous} ${line}`;
        previousWasBlank = false;
        return lines;
      }

      lines.push(line);
      previousWasBlank = false;
      return lines;
    }, []);

  return mergedLines
    .map((line) => {
      if (!line) return "";
      if (isMarkdownListLine(line)) return line;
      return `- ${line}`;
    })
    .join("\n");
}

function renderDetailsContainers(
  item: WorkoutDetailItem,
  locale: SidebarLocale,
): string[] {
  const copy = getWorkoutPageCopy(locale);
  const general = formatBulletedDescriptionBlock(item.description?.general, {
    joinSoftWraps: true,
  });
  const price = formatBulletedDescriptionBlock(item.description?.price, {
    joinSoftWraps: false,
  });
  const blocks: string[] = [];

  if (general) {
    blocks.push(`::: info ${copy.detailLabels.general}`, general, ":::", "");
  }

  if (price) {
    blocks.push(`::: tip ${copy.detailLabels.price}`, price, ":::", "");
  }

  return blocks;
}

// ── Row renderer ──────────────────────────────────────────────────────────────

export function renderRow(
  item: WorkoutDetailItem,
  locale: SidebarLocale,
): string {
  const { unmatchedTopLevelLocations } = resolveScheduleLocations(item);
  const locationParts = splitLocation({
    ...item,
    location: unmatchedTopLevelLocations,
  });
  const hasParentLocationDetails = unmatchedTopLevelLocations.length > 0;
  const localizedLocationTitle = localizeKnownCategoryFragments(
    locale,
    locationParts.title,
  );
  const hideTimeline = !shouldRenderTimelineStatusBadge(item.bookingStatus);
  const scheduleCards = hideTimeline ? "" : renderScheduleCards(item, locale);
  const wrapperTag = item.url ? "a" : "div";
  const wrapperAttributes = item.url
    ? ` class="workout-row" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer"`
    : ` class="workout-row"`;

  return [
    ` <${wrapperTag}${wrapperAttributes}>`.trimStart(),
    '  <div class="workout-row-main">',
    scheduleCards
      ? `    <div class="workout-row-schedule">${scheduleCards}</div>`
      : "",
    hasParentLocationDetails
      ? `    <div class="workout-row-note">${escapeHtml(localizedLocationTitle)}${locationParts.detail ? `: ${escapeHtml(locationParts.detail)}` : ""}</div>`
      : "",
    "  </div>",
    `</${wrapperTag}>`,
  ]
    .filter(Boolean)
    .join("\n");
}

// ── Group renderer ────────────────────────────────────────────────────────────

export function renderGroup(
  category: string,
  titleGroup: WorkoutTitleGroup,
  locale: SidebarLocale,
): string[] {
  const copy = getWorkoutPageCopy(locale);
  const firstItem = titleGroup.items[0];
  const provider = firstItem?.provider ?? "";
  const url = firstItem?.url;
  const localizedCategory = getCategoryLabel(locale, category);
  const localizedTitle = localizeGroupHeaderTitle(titleGroup.title, locale);
  const hasCategoryPrefix =
    localizedTitle === localizedCategory ||
    localizedTitle.startsWith(`${localizedCategory} – `) ||
    localizedTitle.startsWith(`${localizedCategory}, `) ||
    localizedTitle.startsWith(`${localizedCategory}: `);
  const groupHeading = hasCategoryPrefix
    ? localizedTitle
    : `${localizedCategory} – ${localizedTitle}`;

  const providerHtml = url
    ? `<p class="workout-group-provider">${escapeHtml(copy.providerLabel)}: <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(provider)}</a></p>`
    : `<p class="workout-group-provider">${escapeHtml(copy.providerLabel)}: ${escapeHtml(provider)}</p>`;
  const statusSummaryHtml = formatGroupStatusSummary(titleGroup.items, locale);
  const unavailableNoticeHtml = titleGroup.items.some(
    (item) => !shouldRenderTimelineStatusBadge(item.bookingStatus),
  )
    ? `<p class="workout-group-unavailable-note">${escapeHtml(copy.unavailableCourseNotice)}</p>`
    : "";

  const lines = [
    `## ${groupHeading}`,
    "",
    providerHtml,
    statusSummaryHtml,
    "",
    `<div class="workout-table-card">`,
    unavailableNoticeHtml,
  ];

  for (const item of titleGroup.items) {
    lines.push('<div class="workout-table">');
    lines.push(renderRow(item, locale));
    lines.push("</div>");
    lines.push("");
    lines.push(...renderDetailsContainers(item, locale));
  }
  lines.push(`</div>`, "");
  return lines;
}

// ── Page renderers ────────────────────────────────────────────────────────────

export function renderCategoryPage(
  locale: SidebarLocale,
  category: string,
  titleGroups: WorkoutTitleGroup[],
  snapshotUpdatedAt?: string,
  providerNote: Record<string, string> = {},
): string {
  const copy = getWorkoutPageCopy(locale);
  const pageTitle = getCategoryLabel(locale, category);
  const wikipediaLinks = getCategoryWikipediaLinks(locale, category);
  const variantCount = titleGroups.length;
  const variantText =
    locale === "ja" || locale === "ko" || locale === "zh-CN"
      ? `${variantCount}${copy.variantPlural}`
      : `${variantCount} ${variantCount === 1 ? copy.variantSingular : copy.variantPlural}.`;

  const lines = [
    "---",
    `title: ${JSON.stringify(pageTitle)}`,
    `description: ${JSON.stringify(buildWorkoutPageDescription(locale, pageTitle, variantCount))}`,
    'seoPageKind: "workout-category"',
    `seoVariantCount: ${variantCount}`,
    "layout: doc",
    ...(snapshotUpdatedAt
      ? [`snapshotUpdatedAt: ${JSON.stringify(snapshotUpdatedAt)}`]
      : []),
    "---",
    "",
    `<div class="workout-page-header">`,
    `<div class="workout-page-heading">`,
    `<h1 class="workout-page-title">${escapeHtml(pageTitle)}</h1>`,
    `</div>`,
    ...(wikipediaLinks
      ? [
          `<div class="workout-page-actions">`,
          ...wikipediaLinks.map(
            (link) =>
              `<a class="workout-page-wikipedia" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" aria-label="Wikipedia: ${escapeHtml(link.label)}">` +
              `<img class="workout-page-wikipedia-icon" src="/wikipedia.svg" alt="" aria-hidden="true">` +
              `<img class="workout-page-wikipedia-wordmark" src="/wikipiedia-text.svg" alt="Wikipedia">` +
              `</a>`,
          ),
          `</div>`,
        ]
      : []),
    `</div>`,
    "",
    variantText,
    "",
  ];

  const renderedProviderNotes = Array.from(
    new Set(
      titleGroups
        .flatMap((group) => group.items.map((item) => item.provider))
        .filter(Boolean),
    ),
  )
    .map((provider) => {
      const notes = formatBulletedDescriptionBlock(providerNote[provider], {
        joinSoftWraps: false,
      });
      if (!notes) return "";
      return `::: details ${escapeHtml(provider)} Note\n${notes}\n:::\n`;
    })
    .filter(Boolean);

  if (renderedProviderNotes.length > 0) {
    lines.push(...renderedProviderNotes, "");
  }

  for (const group of titleGroups) {
    lines.push(...renderGroup(category, group, locale));
  }

  return lines.join("\n");
}

export function renderIndexPage(
  locale: SidebarLocale,
  sidebar: Array<{ text: string; link: string }>,
  snapshotUpdatedAt?: string,
): string {
  const contentByLocale: Record<
    SidebarLocale,
    {
      title: string;
      intro: string;
      howToTitle: string;
      howTo: string[];
      includesTitle: string;
      includes: string[];
      noteTitle: string;
      note: string;
    }
  > = {
    de: {
      title: "Workout",
      intro:
        "Hier findest du den Sportkatalog fur Kiel mit Kursen, Aktivitaten und Angeboten aus verschiedenen lokalen Quellen.",
      howToTitle: "So nutzt du den Katalog",
      howTo: [
        "Nutze die Seitenleiste, um nach Sportart oder Themenbereich zu stobern.",
        "Offne eine Kategorieseite, um Zeiten, Preise, Orte und Buchungslinks zu sehen.",
        "Prufe wichtige Angaben immer zusatzlich beim ursprunglichen Anbieter.",
      ],
      includesTitle: "Was du hier findest",
      includes: [
        "Hochschulsport- und lokale Sportangebote",
        "Klettern, Tanz, Fitness, Schwimmen, Segeln und mehr",
        "mehrsprachig aufbereitete Kursinformationen",
      ],
      noteTitle: "Hinweis",
      note: "Die Inhalte stammen aus externen Quellen und werden gesammelt und ubersetzt. Zeiten, Verfugbarkeit und Preise konnen sich kurzfristig andern.",
    },
    en: {
      title: "Workout",
      intro:
        "This section contains the Kiel sports catalog with classes, activities, and local provider offerings collected into one place.",
      howToTitle: "How to use this catalog",
      howTo: [
        "Use the sidebar to browse by sport or activity family.",
        "Open a category page to see schedules, prices, locations, and booking links.",
        "Double-check important details with the original provider before relying on them.",
      ],
      includesTitle: "What you can find here",
      includes: [
        "university and local sports offerings",
        "climbing, dance, fitness, swimming, sailing, and more",
        "translated course information across multiple languages",
      ],
      noteTitle: "Note",
      note: "This catalog is assembled from external source pages. Schedules, availability, and pricing may change on short notice.",
    },
    ja: {
      title: "ワークアウト",
      intro:
        "このセクションでは、キールのスポーツ講座やアクティビティ、地域の提供元情報をまとめて閲覧できます。",
      howToTitle: "使い方",
      howTo: [
        "サイドバーから競技やカテゴリ別に探せます。",
        "各カテゴリページで日程、料金、場所、予約リンクを確認できます。",
        "重要な情報は必ず元の提供元ページでも確認してください。",
      ],
      includesTitle: "掲載内容",
      includes: [
        "大学スポーツや地域スポーツの講座",
        "クライミング、ダンス、フィットネス、水泳、セーリングなど",
        "複数言語に翻訳された講座情報",
      ],
      noteTitle: "注意",
      note: "このカタログは外部ソースをもとに構成されています。日程、空き状況、料金は短期間で変更される場合があります。",
    },
    ko: {
      title: "운동",
      intro:
        "이 섹션에서는 킬 지역의 스포츠 강좌, 활동, 로컬 제공처 정보를 한곳에서 찾아볼 수 있습니다.",
      howToTitle: "이용 방법",
      howTo: [
        "사이드바에서 종목이나 활동 분류별로 찾아보세요.",
        "각 카테고리 페이지에서 일정, 가격, 장소, 예약 링크를 확인할 수 있습니다.",
        "중요한 정보는 반드시 원래 제공처 페이지에서도 다시 확인하세요.",
      ],
      includesTitle: "여기에서 볼 수 있는 내용",
      includes: [
        "대학 스포츠와 지역 스포츠 프로그램",
        "클라이밍, 댄스, 피트니스, 수영, 세일링 등",
        "여러 언어로 정리된 강좌 정보",
      ],
      noteTitle: "안내",
      note: "이 카탈로그는 외부 소스 페이지를 바탕으로 구성됩니다. 일정, 잔여 인원, 가격은 짧은 시간 안에도 바뀔 수 있습니다.",
    },
    "zh-CN": {
      title: "运动",
      intro:
        "本栏目汇集了基尔的运动课程、活动项目以及本地提供方的信息，方便你集中浏览。",
      howToTitle: "使用方式",
      howTo: [
        "使用侧边栏按运动项目或分类浏览。",
        "打开分类页面即可查看时间、价格、地点和预约链接。",
        "重要信息仍应以原始提供方页面为准。",
      ],
      includesTitle: "你可以在这里找到",
      includes: [
        "大学体育和本地体育项目",
        "攀岩、舞蹈、健身、游泳、帆船等课程",
        "多语言整理后的课程信息",
      ],
      noteTitle: "说明",
      note: "本目录基于外部来源页面整理而成。时间、名额和价格都可能在短时间内发生变化。",
    },
  };
  const content = contentByLocale[locale];
  const seoLocale = locale === "zh-CN" ? "zh-cn" : locale;
  const lines = [
    "---",
    `title: ${JSON.stringify(content.title)}`,
    `description: ${JSON.stringify(buildWorkoutIndexDescription(seoLocale))}`,
    'seoPageKind: "workout-index"',
    "layout: doc",
    ...(snapshotUpdatedAt
      ? [`snapshotUpdatedAt: ${JSON.stringify(snapshotUpdatedAt)}`]
      : []),
    "---",
    "",
    `# ${content.title}`,
    "",
    content.intro,
    "",
    `## ${content.howToTitle}`,
    "",
    ...content.howTo.map((item) => `- ${item}`),
    "",
    `## ${content.includesTitle}`,
    "",
    ...content.includes.map((item) => `- ${item}`),
    "",
    `## ${content.noteTitle}`,
    "",
    content.note,
  ];

  return lines.join("\n");
}
