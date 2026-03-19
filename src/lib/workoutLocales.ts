export const WORKOUT_LOCALES = ["de", "en", "zh-CN", "ja", "ko"] as const;

export type WorkoutLocale = (typeof WORKOUT_LOCALES)[number];
