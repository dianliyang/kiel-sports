import { describe, expect, test } from "vitest";
import {
  serializedWorkoutI18nMapping,
  workoutI18nMapping,
} from "../lib/workoutI18nMapping";
import { titlePhraseMaps } from "../lib/workoutSidebarI18n";

describe("workout i18n mapping exports", () => {
  test("keeps the legacy export as an alias of the clearer serialized mapping", () => {
    expect(workoutI18nMapping).toBe(serializedWorkoutI18nMapping);
    expect(serializedWorkoutI18nMapping).toHaveProperty("categories");
    expect(serializedWorkoutI18nMapping).toHaveProperty("titlePhrases");
  });

  test("keeps weekday localization out of title phrase maps", () => {
    const weekdayPatternSource = /\bMon\b|\bMo\b/.source;

    expect(
      titlePhraseMaps.en.some((rule) => rule.pattern.source === weekdayPatternSource),
    ).toBe(false);
    expect(
      titlePhraseMaps.ja.some((rule) => rule.pattern.source === weekdayPatternSource),
    ).toBe(false);
    expect(
      titlePhraseMaps.ko.some((rule) => rule.pattern.source === weekdayPatternSource),
    ).toBe(false);
    expect(
      titlePhraseMaps["zh-CN"].some((rule) => rule.pattern.source === weekdayPatternSource),
    ).toBe(false);
  });
});
