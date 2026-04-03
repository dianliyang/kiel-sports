import type { LocalizedLabelMap } from "./workoutI18nUtils";
import type { WorkoutLocale } from "./workoutLocales";
import {
  getAllCategoryLabelMappings,
  titlePhraseMaps,
} from "./workoutSidebarI18n";

type TitlePhraseMapping = {
  pattern: string;
  flags: string;
  replacement: string;
};

export type WorkoutI18nMapping = {
  categories: LocalizedLabelMap<WorkoutLocale>;
  titlePhrases: Record<WorkoutLocale, TitlePhraseMapping[]>;
};

export const serializedWorkoutI18nMapping: WorkoutI18nMapping = {
  categories: getAllCategoryLabelMappings(),
  titlePhrases: Object.fromEntries(
    (
      Object.entries(titlePhraseMaps) as [
        WorkoutLocale,
        {
          pattern: RegExp;
          replacement: string | ((...args: any[]) => string);
        }[],
      ][]
    ).map(([locale, rules]) => [
      locale,
      rules.map((rule) => ({
        pattern: rule.pattern.source,
        flags: rule.pattern.flags,
        replacement: String(rule.replacement),
      })),
    ]),
  ) as Record<WorkoutLocale, TitlePhraseMapping[]>,
};

export const workoutI18nMapping = serializedWorkoutI18nMapping;
