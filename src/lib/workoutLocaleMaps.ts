import type { LocalizedLabelMap } from "./workoutI18nUtils";

export type WorkoutLocale = "de" | "en" | "zh-CN" | "ja" | "ko";

type LocaleMaps = {
  titleMap: LocalizedLabelMap<WorkoutLocale>;
  categoryMap: LocalizedLabelMap<WorkoutLocale>;
};

let workoutLocaleMaps: LocaleMaps = {
  titleMap: {},
  categoryMap: {},
};

export type ApiFetch = typeof fetch;

export function buildWorkoutLocaleMapUrl(baseUrl: string, key: string): string {
  return new URL(`/${key.replace(/^\/+/, "")}`, baseUrl).toString();
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(
      `Snapshot request failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as T;
}

export async function loadWorkoutLocaleMaps(
  baseUrl: string,
  input: {
    titleLocaleKey: string;
    categoryLocaleKey: string;
  },
  fetchImpl: ApiFetch = fetch,
): Promise<LocaleMaps> {
  const [titleMap, categoryMap] = await Promise.all([
    readJson<LocalizedLabelMap<WorkoutLocale>>(
      await fetchImpl(buildWorkoutLocaleMapUrl(baseUrl, input.titleLocaleKey)),
    ),
    readJson<LocalizedLabelMap<WorkoutLocale>>(
      await fetchImpl(buildWorkoutLocaleMapUrl(baseUrl, input.categoryLocaleKey)),
    ),
  ]);

  workoutLocaleMaps = { titleMap, categoryMap };
  return workoutLocaleMaps;
}

export function setWorkoutLocaleMaps(next: LocaleMaps): void {
  workoutLocaleMaps = {
    titleMap: next.titleMap,
    categoryMap: next.categoryMap,
  };
}

export function resetWorkoutLocaleMaps(): void {
  workoutLocaleMaps = {
    titleMap: {},
    categoryMap: {},
  };
}

export function getWorkoutTitleMap(): LocalizedLabelMap<WorkoutLocale> {
  return workoutLocaleMaps.titleMap;
}

export function getWorkoutCategoryMap(): LocalizedLabelMap<WorkoutLocale> {
  return workoutLocaleMaps.categoryMap;
}
