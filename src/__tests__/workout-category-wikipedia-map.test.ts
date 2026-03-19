import { describe, expect, test } from "vitest";
import {
  getCategoryWikipediaLinks,
  resetWorkoutCategoryWikipediaMap,
  setWorkoutCategoryWikipediaMap,
} from "../lib/workoutCategoryWikipediaMap";

describe("workout category wikipedia map", () => {
  test("returns the locale-specific URL when present", () => {
    setWorkoutCategoryWikipediaMap({
      Beachvolleyball: {
        en: "https://en.wikipedia.org/wiki/Beach_volleyball",
        ja: "https://ja.wikipedia.org/wiki/%E3%83%93%E3%83%BC%E3%83%81%E3%83%90%E3%83%AC%E3%83%BC%E3%83%9C%E3%83%BC%E3%83%AB",
      },
    });

    expect(getCategoryWikipediaLinks("ja", "Beachvolleyball")).toEqual([
      {
        label: "Wikipedia",
        url: "https://ja.wikipedia.org/wiki/%E3%83%93%E3%83%BC%E3%83%81%E3%83%90%E3%83%AC%E3%83%BC%E3%83%9C%E3%83%BC%E3%83%AB",
      },
    ]);
  });

  test("falls back to English when the requested locale is missing", () => {
    setWorkoutCategoryWikipediaMap({
      Bouldering: {
        en: "https://en.wikipedia.org/wiki/Bouldering",
      },
    });

    expect(getCategoryWikipediaLinks("zh-CN", "Bouldering")).toEqual([
      {
        label: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Bouldering",
      },
    ]);
  });

  test("returns multiple labeled links for composite categories", () => {
    setWorkoutCategoryWikipediaMap({
      "Bachata / Kizomba": {
        en: [
          {
            label: "Bachata",
            url: "https://en.wikipedia.org/wiki/Bachata_(dance)",
          },
          {
            label: "Kizomba",
            url: "https://en.wikipedia.org/wiki/Kizomba",
          },
        ],
      },
    });

    expect(getCategoryWikipediaLinks("en", "Bachata / Kizomba")).toEqual([
      {
        label: "Bachata",
        url: "https://en.wikipedia.org/wiki/Bachata_(dance)",
      },
      {
        label: "Kizomba",
        url: "https://en.wikipedia.org/wiki/Kizomba",
      },
    ]);
  });

  test("returns null when the category has no wikipedia mapping", () => {
    resetWorkoutCategoryWikipediaMap();
    expect(getCategoryWikipediaLinks("en", "Dance Fit")).toBeNull();
  });
});
