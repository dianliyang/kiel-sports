import { describe, expect, test } from "vitest";
import {
  getCopy,
  getWorkoutPageCopy,
  localizeEmbeddedWeekdayTokens,
  localizeWeekday,
  normalizeWeekdayToken,
  pageLocaleCopy,
  workoutPageCopyByLocale,
} from "../lib/workoutPageLocale";

describe("workout page locale exports", () => {
  test("exposes clearer page copy names without changing values", () => {
    expect(workoutPageCopyByLocale.en).toBe(pageLocaleCopy.en);
    expect(getWorkoutPageCopy("ja")).toBe(workoutPageCopyByLocale.ja);
    expect(getWorkoutPageCopy("en")).toEqual(getCopy("en"));
    expect(getWorkoutPageCopy("en").scheduleTbd).toBe("Schedule TBD");
  });

  test("normalizes weekday aliases through a single token map", () => {
    expect(normalizeWeekdayToken(" Di ")).toBe("Tue");
    expect(normalizeWeekdayToken("Monday")).toBe("Mon");
    expect(normalizeWeekdayToken("Tuesday")).toBe("Tue");
    expect(normalizeWeekdayToken("So")).toBe("Sun");
    expect(localizeWeekday("Monday-Friday", "zh-CN")).toBe("周一至周五");
    expect(localizeWeekday("Di-Do", "zh-CN")).toBe("周二至周四");
    expect(localizeEmbeddedWeekdayTokens("Mi bis 12:00", "ja")).toBe(
      "水 bis 12:00",
    );
  });
});
