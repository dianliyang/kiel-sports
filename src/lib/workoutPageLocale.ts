import type { WorkoutLocale } from "./workoutLocales";
import { normalizeTranslationKey } from "./workoutI18nUtils";

type NormalizedWeekdayToken =
  | "daily"
  | "Mon"
  | "Tue"
  | "Wed"
  | "Thu"
  | "Fri"
  | "Sat"
  | "Sun";
export type PageLocaleCopy = {
  categoryTitle: string;
  variantSingular: string;
  variantPlural: string;
  providerLabel: string;
  locationLabel: string;
  instructorLabel: string;
  durationLabel: string;
  sessionSingular: string;
  sessionPlural: string;
  openBookingLabel: string;
  opensLabel: string;
  scheduleTbd: string;
  priceTbd: string;
  statusTbd: string;
  unavailableCourseNotice: string;
  detailLabels: {
    general: string;
    price: string;
  };
  priceLabels: {
    student: string;
    staff: string;
    external: string;
    externalReduced: string;
    adults: string;
    children: string;
    discount: string;
  };
  statusLabels: Record<string, string>;
  dateLocale: string;
};

export const workoutPageCopyByLocale: Record<WorkoutLocale, PageLocaleCopy> = {
  de: {
    categoryTitle: "Workout",
    variantSingular: "Variante",
    variantPlural: "Varianten",
    providerLabel: "Anbieter",
    locationLabel: "Ort",
    instructorLabel: "Leitung",
    durationLabel: "Zeitraum",
    sessionSingular: "Termin",
    sessionPlural: "Termine",
    openBookingLabel: "Buchung öffnen",
    opensLabel: "Öffnet",
    scheduleTbd: "Zeitplan offen",
    priceTbd: "Preis offen",
    statusTbd: "Status offen",
    unavailableCourseNotice:
      "Aktuell ist kein Kurs verfugbar, aber bitte prufe die Website fur die neuesten Daten.",
    detailLabels: {
      general: "Allgemeine Hinweise",
      price: "Preishinweise",
    },
    priceLabels: {
      student: "Studierende",
      staff: "Mitarbeitende",
      external: "Extern",
      externalReduced: "Extern ermäßigt",
      adults: "Erwachsene",
      children: "Kinder",
      discount: "Ermäßigt",
    },
    statusLabels: {
      available: "Verfügbar",
      scheduled: "Geplant",
      waitlist: "Warteliste",
      restricted: "Voraussetzungen erforderlich",
      restricted_waitlist: "Warteliste (Voraussetzungen erforderlich)",
      closed: "Geschlossen",
      canceled: "Abgesagt",
      see_text: "Siehe Text",
      fully_booked: "Ausgebucht",
      expired: "Abgelaufen",
    },
    dateLocale: "de-DE",
  },
  en: {
    categoryTitle: "Workout",
    variantSingular: "variant",
    variantPlural: "variants",
    providerLabel: "Provider",
    locationLabel: "Location",
    instructorLabel: "Instructor",
    durationLabel: "Duration",
    sessionSingular: "session",
    sessionPlural: "sessions",
    openBookingLabel: "Open booking",
    opensLabel: "Opens",
    scheduleTbd: "Schedule TBD",
    priceTbd: "Price TBD",
    statusTbd: "Status TBD",
    unavailableCourseNotice:
      "Currently no course available, but please check the website for the latest data.",
    detailLabels: {
      general: "General Note",
      price: "Price Note",
    },
    priceLabels: {
      student: "Student",
      staff: "Staff",
      external: "External",
      externalReduced: "Ext. Reduced",
      adults: "Adults",
      children: "Children",
      discount: "Discount",
    },
    statusLabels: {
      available: "Available",
      scheduled: "Scheduled",
      waitlist: "Waitlist",
      restricted: "Eligibility required",
      restricted_waitlist: "Waitlist (eligibility required)",
      closed: "Closed",
      fully_booked: "Fully Booked",
      canceled: "Canceled",
      see_text: "See text",
      expired: "Expired",
    },
    dateLocale: "en-US",
  },
  ja: {
    categoryTitle: "ワークアウト",
    variantSingular: "件のコース",
    variantPlural: "件のコース",
    providerLabel: "提供元",
    locationLabel: "場所",
    instructorLabel: "担当",
    durationLabel: "期間",
    sessionSingular: "回",
    sessionPlural: "回",
    openBookingLabel: "予約ページを開く",
    opensLabel: "受付開始",
    scheduleTbd: "日程未定",
    priceTbd: "料金未定",
    statusTbd: "状態未定",
    unavailableCourseNotice:
      "現在利用できる講座はありませんが、最新情報は公式サイトで確認してください。",
    detailLabels: {
      general: "一般メモ",
      price: "料金メモ",
    },
    priceLabels: {
      student: "学生",
      staff: "スタッフ",
      external: "学外",
      externalReduced: "学外割引",
      adults: "大人",
      children: "子ども",
      discount: "割引",
    },
    statusLabels: {
      available: "受付中",
      scheduled: "予定",
      waitlist: "キャンセル待ち",
      restricted: "参加条件あり",
      restricted_waitlist: "キャンセル待ち（参加条件あり）",
      closed: "受付終了",
      canceled: "中止",
      fully_booked: "満席",
      see_text: "本文参照",
      expired: "期限切れ",
    },
    dateLocale: "ja-JP",
  },
  ko: {
    categoryTitle: "운동",
    variantSingular: "개 강좌",
    variantPlural: "개 강좌",
    providerLabel: "제공처",
    locationLabel: "장소",
    instructorLabel: "강사",
    durationLabel: "기간",
    sessionSingular: "회",
    sessionPlural: "회",
    openBookingLabel: "예약 열기",
    opensLabel: "오픈",
    scheduleTbd: "일정 미정",
    priceTbd: "요금 미정",
    statusTbd: "상태 미정",
    unavailableCourseNotice:
      "현재 이용 가능한 강좌가 없지만, 최신 정보는 웹사이트에서 확인해 주세요.",
    detailLabels: {
      general: "일반 안내",
      price: "요금 안내",
    },
    priceLabels: {
      student: "학생",
      staff: "직원",
      external: "외부",
      externalReduced: "외부 할인",
      adults: "성인",
      children: "어린이",
      discount: "할인",
    },
    statusLabels: {
      available: "예약 가능",
      scheduled: "예정",
      waitlist: "대기자 명단",
      restricted: "참가 조건 있음",
      restricted_waitlist: "대기자 명단 (참가 조건 있음)",
      closed: "마감",
      canceled: "취소",
      see_text: "본문 참조",
      fully_booked: "예약 마감",
      expired: "만료됨",
    },
    dateLocale: "ko-KR",
  },
  "zh-CN": {
    categoryTitle: "运动",
    variantSingular: " 个项目",
    variantPlural: " 个项目",
    providerLabel: "提供方",
    locationLabel: "地点",
    instructorLabel: "教练",
    durationLabel: "时长",
    sessionSingular: "次课",
    sessionPlural: "次课",
    openBookingLabel: "打开报名",
    opensLabel: "开放时间",
    scheduleTbd: "时间待定",
    priceTbd: "价格待定",
    statusTbd: "状态待定",
    unavailableCourseNotice:
      "当前暂无可报名课程，但请查看网站以获取最新信息。",
    detailLabels: {
      general: "一般说明",
      price: "价格说明",
    },
    priceLabels: {
      student: "学生",
      staff: "员工",
      external: "校外",
      externalReduced: "校外优惠",
      adults: "成人",
      children: "儿童",
      discount: "优惠",
    },
    statusLabels: {
      available: "可报名",
      scheduled: "即将开放",
      waitlist: "候补",
      restricted: "需满足条件",
      restricted_waitlist: "候补（需满足条件）",
      fully_booked: "已满员",
      closed: "已关闭",
      canceled: "已取消",
      see_text: "见说明",
      expired: "已过期",
    },
    dateLocale: "zh-CN",
  },
};

const weekdayTokenAliases: Record<string, NormalizedWeekdayToken> = {
  tägl: "daily",
  "tägl.": "daily",
  Monday: "Mon",
  Mon: "Mon",
  Mo: "Mon",
  Tuesday: "Tue",
  Tue: "Tue",
  Di: "Tue",
  Wednesday: "Wed",
  Wed: "Wed",
  Mi: "Wed",
  Thursday: "Thu",
  Thu: "Thu",
  Do: "Thu",
  Friday: "Fri",
  Fri: "Fri",
  Fr: "Fri",
  Saturday: "Sat",
  Sat: "Sat",
  Sa: "Sat",
  Sunday: "Sun",
  Sun: "Sun",
  So: "Sun",
};

const localizedWeekdayTokens: Record<
  WorkoutLocale,
  Record<NormalizedWeekdayToken, string>
> = {
  de: {
    daily: "tägl.",
    Mon: "Mo",
    Tue: "Di",
    Wed: "Mi",
    Thu: "Do",
    Fri: "Fr",
    Sat: "Sa",
    Sun: "So",
  },
  en: {
    daily: "Daily",
    Mon: "Mon",
    Tue: "Tue",
    Wed: "Wed",
    Thu: "Thu",
    Fri: "Fri",
    Sat: "Sat",
    Sun: "Sun",
  },
  ja: {
    daily: "毎日",
    Mon: "月",
    Tue: "火",
    Wed: "水",
    Thu: "木",
    Fri: "金",
    Sat: "土",
    Sun: "日",
  },
  ko: {
    daily: "매일",
    Mon: "월",
    Tue: "화",
    Wed: "수",
    Thu: "목",
    Fri: "금",
    Sat: "토",
    Sun: "일",
  },
  "zh-CN": {
    daily: "每日",
    Mon: "周一",
    Tue: "周二",
    Wed: "周三",
    Thu: "周四",
    Fri: "周五",
    Sat: "周六",
    Sun: "周日",
  },
};

export const weekdayLabels = localizedWeekdayTokens;

const localizedWeekdayRangeSeparators: Record<
  "page" | "title",
  Record<WorkoutLocale, string>
> = {
  page: {
    de: "-",
    en: "-",
    ja: "〜",
    ko: "〜",
    "zh-CN": "至",
  },
  title: {
    de: "-",
    en: "-",
    ja: "〜",
    ko: "-",
    "zh-CN": "至",
  },
};

const escapedWeekdayAliases = Object.keys(weekdayTokenAliases)
  .sort((left, right) => right.length - left.length)
  .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

const weekdayAliasPattern = new RegExp(
  `(?<!\\w)(${escapedWeekdayAliases.join("|")})(?!\\w)`,
  "gu",
);
export function getCopy(locale: WorkoutLocale): PageLocaleCopy {
  return workoutPageCopyByLocale[locale];
}

export function getWorkoutPageCopy(locale: WorkoutLocale): PageLocaleCopy {
  return workoutPageCopyByLocale[locale];
}

export const pageLocaleCopy = workoutPageCopyByLocale;

export function normalizeWeekdayToken(
  value: string,
): NormalizedWeekdayToken | undefined {
  return weekdayTokenAliases[normalizeTranslationKey(value)];
}

export function localizeWeekdayToken(
  value: string,
  locale: WorkoutLocale,
): string | undefined {
  const token = normalizeWeekdayToken(value);
  return token ? localizedWeekdayTokens[locale][token] : undefined;
}

export function getWeekdayRangeSeparator(
  locale: WorkoutLocale,
  variant: "page" | "title" = "page",
): string {
  return localizedWeekdayRangeSeparators[variant][locale];
}

export function localizeEmbeddedWeekdayTokens(
  value: string,
  locale: WorkoutLocale,
): string {
  return value.replace(
    weekdayAliasPattern,
    (match) => localizeWeekdayToken(match, locale) ?? match,
  );
}

export function localizeWeekday(value: string, locale: WorkoutLocale): string {
  const trimmed = normalizeTranslationKey(value);
  const direct = localizeWeekdayToken(trimmed, locale);
  if (direct) return direct;

  if (/[–—-]/u.test(trimmed)) {
    const parts = trimmed.split(/\s*[–—-]\s*/u);
    return parts
      .map((p) => localizeWeekday(p, locale))
      .join(getWeekdayRangeSeparator(locale));
  }

  return trimmed;
}
