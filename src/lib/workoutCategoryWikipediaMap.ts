import { normalizeTranslationKey } from "./workoutI18nUtils";
import type { WorkoutLocale } from "./workoutLocales";

export type WorkoutCategoryWikipediaLink = {
  label: string;
  url: string;
};

export type WorkoutCategoryWikipediaValue =
  | string
  | WorkoutCategoryWikipediaLink[];

export type WorkoutCategoryWikipediaMap = Record<
  string,
  Partial<Record<WorkoutLocale, WorkoutCategoryWikipediaValue>>
>;

let workoutCategoryWikipediaMap: WorkoutCategoryWikipediaMap = {};

export function setWorkoutCategoryWikipediaMap(
  next: WorkoutCategoryWikipediaMap,
): void {
  workoutCategoryWikipediaMap = { ...next };
}

export function resetWorkoutCategoryWikipediaMap(): void {
  workoutCategoryWikipediaMap = {};
}

export function getCategoryWikipediaUrl(
  locale: WorkoutLocale,
  category: string,
): string | null {
  return getCategoryWikipediaLinks(locale, category)?.[0]?.url ?? null;
}

export function getCategoryWikipediaLinks(
  locale: WorkoutLocale,
  category: string,
): WorkoutCategoryWikipediaLink[] | null {
  const entry = workoutCategoryWikipediaMap[normalizeTranslationKey(category)];
  if (!entry) return null;

  const resolved = entry[locale] ?? entry.en;
  if (!resolved) return null;

  if (typeof resolved === "string") {
    return [{ label: "Wikipedia", url: resolved }];
  }

  return resolved.length > 0 ? resolved : null;
}
