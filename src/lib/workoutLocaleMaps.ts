import type { LocalizedLabelMap } from "./workoutI18nUtils";
import type { WorkoutLocale } from "./workoutLocales";
import {
  buildWorkoutSnapshotAssetUrl,
  readWorkoutSnapshotJson,
} from "./workoutSnapshotUtils";

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
  return buildWorkoutSnapshotAssetUrl(baseUrl, key);
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
      await fetchImpl(
        buildWorkoutLocaleMapUrl(baseUrl, input.categoryLocaleKey),
      ),
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

const readJson = readWorkoutSnapshotJson;

export type { WorkoutLocale } from "./workoutLocales";
