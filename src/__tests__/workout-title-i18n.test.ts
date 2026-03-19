import { beforeAll, describe, expect, test } from "vitest";
import { localizeWorkoutTitle } from "../lib/workoutSidebarI18n";
import { setWorkoutLocaleMaps } from "../lib/workoutLocaleMaps";
import type { WorkoutLocale } from "../lib/workoutLocales";
import {
  workoutCategoryFixtureMap,
  workoutTitleFixtureMap,
} from "./fixtures/workoutLocaleFixtures";

beforeAll(() => {
  setWorkoutLocaleMaps({
    titleMap: workoutTitleFixtureMap,
    categoryMap: workoutCategoryFixtureMap,
  });
});

describe("Workout title localization (BDD)", () => {
  describe("Given a standalone ballet course title with detailed level information", () => {
    const source = "Anf. mit Grundk. und Mittelstufe";

    test("then the title is consistently localized across all supported locales", () => {
      const results: Record<WorkoutLocale, string> = {
        de: localizeWorkoutTitle(source, "de"),
        en: localizeWorkoutTitle(source, "en"),
        "zh-CN": localizeWorkoutTitle(source, "zh-CN"),
        ja: localizeWorkoutTitle(source, "ja"),
        ko: localizeWorkoutTitle(source, "ko"),
      };

      expect(results.de).toBe(source);
      expect(results.en).toBe("Adv. Beginners and Intermediate");
      expect(results.ja).toBe("初級経験者・中級");
      expect(results.ko).toBe("초급경험자·중급");
      expect(localizeWorkoutTitle(source, "zh-CN")).toBe("有基础初级与中级");
    });
  });

  describe("Given a title with time and day markers like 'tägl. Sa ab 14 Uhr'", () => {
    const source = "freies Jollensegeln tägl. Sa ab 14 Uhr";

    test("then it is correctly localized into English", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "Open Dinghy Sailing Daily Sat from 14",
      );
    });

    test("then it is correctly localized into Japanese", () => {
      const localized = localizeWorkoutTitle(source, "ja");
      expect(localized).toContain("毎日");
      expect(localized).toContain("土");
      expect(localized).toContain("から");
      expect(localized).toContain("14");
      expect(localized).toContain("時");
    });
  });

  describe("Given the bare phrase 'tägl. Sa ab 14 Uhr'", () => {
    const source = "tägl. Sa ab 14 Uhr";

    test("then it is localized through the generic i18n rules", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe("Daily Sat from 14");
      expect(localizeWorkoutTitle(source, "ja")).toBe("毎日 土 14時から");
      expect(localizeWorkoutTitle(source, "ko")).toBe("매일 토 14시부터");
      expect(localizeWorkoutTitle(source, "zh-CN")).toBe("每日 周六 14点起");
    });
  });

  describe("Given a title with 'ab' followed by a time range like 'Mo ab 14:30-18:30'", () => {
    const source = "freies Jollensegeln Mo ab 14:30-18:30";

    test("then it is correctly localized into English", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "Open Dinghy Sailing Mon from 14:30-18:30",
      );
    });

    test("then it is correctly localized into Japanese", () => {
      const localized = localizeWorkoutTitle(source, "ja");
      expect(localized).toContain("月");
      expect(localized).toContain("14:30-18:30");
      expect(localized).toContain("から");
    });
  });

  describe("Given a title with 'ab' followed by a single clock time like 'Fri ab 17:00'", () => {
    const source = "freies Jollensegeln Fri ab 17:00";

    test("then it is correctly localized into English", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "Open Dinghy Sailing Fri from 17:00",
      );
    });

    test("then it is correctly localized into Japanese", () => {
      const localized = localizeWorkoutTitle(source, "ja");
      expect(localized).toContain("金");
      expect(localized).toContain("17:00");
      expect(localized).toContain("から");
    });

    test("then it is correctly localized into Korean and Chinese", () => {
      expect(localizeWorkoutTitle(source, "ko")).toContain("금");
      expect(localizeWorkoutTitle(source, "zh-CN")).toContain("周五");
    });
  });

  describe("Given a title with 'nur am' followed by a time like 'Mi nur am 06:05'", () => {
    const source = "freies Jollensegeln Mi nur am 06:05";

    test("then it is correctly localized across locales", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "Open Dinghy Sailing Wed only at 06:05",
      );
      expect(localizeWorkoutTitle(source, "ja")).toContain("水 06:05のみ");
      expect(localizeWorkoutTitle(source, "ko")).toContain("수 06:05에만");
      expect(localizeWorkoutTitle(source, "zh-CN")).toContain("周三 仅限 06:05");
    });
  });

  describe("Given a title with a weekday range and start time like 'Mi-So ab 17 Uhr'", () => {
    const source = "freies Jollensegeln Mi-So ab 17 Uhr";

    test("then the weekday range and start time are localized together", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "Open Dinghy Sailing Wed-Sun from 17",
      );
      expect(localizeWorkoutTitle(source, "ja")).toContain("水〜日 17時から");
      expect(localizeWorkoutTitle(source, "ko")).toContain("수-일 17시부터");
      expect(localizeWorkoutTitle(source, "zh-CN")).toContain("周三至周日 17点起");
    });
  });

  describe("Given a title with a weekday and end time like 'Sa bis 12:00'", () => {
    const source = "freies Jollensegeln Sa bis 12:00";

    test("then the weekday and end time are localized together", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "Open Dinghy Sailing Sat until 12:00",
      );
      expect(localizeWorkoutTitle(source, "ja")).toContain("土 12:00まで");
      expect(localizeWorkoutTitle(source, "ko")).toContain("토 12:00까지");
      expect(localizeWorkoutTitle(source, "zh-CN")).toContain("周六 截至 12:00");
    });
  });

  describe("Given German titles that combine beginner/intermediate/advanced markers", () => {
    const cases: Array<{
      title: string;
      locale: Locale;
      expected: string;
    }> = [
        {
          title: "Mittelstufe bis Fortgeschrittene",
          locale: "en",
          expected: "Intermediate to Advanced",
        },
        {
          title: "Mittelstufe bis Fortgeschrittene",
          locale: "ja",
          expected: "中級から上級",
        },
        {
          title: "Mittelstufe bis Fortgeschrittene",
          locale: "ko",
          expected: "중급에서 고급",
        },
        {
          title: "Mittelstufe bis Fortgeschrittene",
          locale: "zh-CN",
          expected: "中级至高级",
        },
        {
          title: "Anf. und Fortg.",
          locale: "en",
          expected: "Beginners and Advanced",
        },
        {
          title: "Anf. und Fortg.",
          locale: "ja",
          expected: "初心者 と 上級",
        },
        {
          title: "Anf. und Fortg.",
          locale: "ko",
          expected: "초보자 및 고급",
        },
        {
          title: "Anf. und Fortg.",
          locale: "zh-CN",
          expected: "初学者 及 进阶",
        },
        {
          title: "Anf. + Fortg.",
          locale: "en",
          expected: "Beginners + Advanced",
        },
        {
          title: "Anf. + Fortg.",
          locale: "ja",
          expected: "初心者 + 上級",
        },
        {
          title: "Anf. + Fortg.",
          locale: "ko",
          expected: "초보자 + 고급",
        },
        {
          title: "Anf. + Fortg.",
          locale: "zh-CN",
          expected: "初学者 + 进阶",
        },
        {
          title: "Yoga für fortg. Anfänger",
          locale: "en",
          expected: "Yoga für Advanced Beginners",
        },
        {
          title: "Yoga für fortg. Anfänger",
          locale: "ja",
          expected: "Yoga für 初中級",
        },
        {
          title: "Yoga für fortg. Anfänger",
          locale: "ko",
          expected: "Yoga für 초중급",
        },
        {
          title: "Yoga für fortg. Anfänger",
          locale: "zh-CN",
          expected: "Yoga für 初中级",
        },
      ];

    test("then specific patterns are applied before generic beginner/advanced fragments", () => {
      for (const { title, locale, expected } of cases) {
        const localized = localizeWorkoutTitle(title, locale);
        expect(localized).toBe(expected);
      }
    });
  });

  describe("Given the senior fitness category title", () => {
    const source = "Fitnessgymnastik für Ältere";

    test("then localized titles describe older adults in each language", () => {
      expect(localizeWorkoutTitle(source, "de")).toBe(source);
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "Fitness Gymnastics for Older Adults",
      );
      expect(localizeWorkoutTitle(source, "ja")).toBe(
        "シニア向けフィットネス体操",
      );
      expect(localizeWorkoutTitle(source, "ko")).toBe(
        "고령자용 피트니스 체조",
      );
      expect(localizeWorkoutTitle(source, "zh-CN")).toBe(
        "老年健身体操",
      );
    });
  });

  describe("Given the plain Hatha Yoga preventive-sport title", () => {
    const source = "Yoga, Hatha Yoga (Präventionssport)";

    test("then it uses the polished direct-title translation instead of fragment fallback text", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "Yoga – Hatha Yoga (Certified Health Programme)",
      );
      expect(localizeWorkoutTitle(source, "ja")).toBe(
        "ヨガ - ハタヨガ（健康予防プログラム）",
      );
      expect(localizeWorkoutTitle(source, "ko")).toBe(
        "요가 - 하타 요가 (공인 건강 예방 프로그램)",
      );
      expect(localizeWorkoutTitle(source, "zh-CN")).toBe(
        "瑜伽 - 哈他瑜伽（认证健康课程）",
      );
    });
  });

  describe("Given the instructor insurance package title fragment with an annual date range", () => {
    const source = "jeweils 1.4. d.J. bis 31.3. des Folgejahres";

    test("then the annual coverage window is translated explicitly in each locale", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "(Apr 1 of the current year to Mar 31 of the following year)",
      );
      expect(localizeWorkoutTitle(source, "ja")).toBe(
        "（毎年4月1日から翌年3月31日まで）",
      );
      expect(localizeWorkoutTitle(source, "ko")).toBe(
        "(매년 4월 1일부터 다음 해 3월 31일까지)",
      );
      expect(localizeWorkoutTitle(source, "zh-CN")).toBe(
        "（每年4月1日至次年3月31日）",
      );
    });
  });

  describe("Given source titles with trailing punctuation or uneven spacing", () => {
    test("then normalized direct title matches still use the title map", () => {
      expect(
        localizeWorkoutTitle("  Aikido   Anf. : ", "en"),
      ).toBe("Aikido Beginners");
      expect(
        localizeWorkoutTitle("Aikido Anf.：", "ja"),
      ).toBe("合気道 初心者");
    });
  });

  describe("Given advanced dinghy sailing course titles after category/title separation", () => {
    test("then title-only overrides use consistent course wording and guidance-vacancy labels", () => {
      expect(
        localizeWorkoutTitle(
          "Kurs 0: Mi plus 2 Woe",
          "en",
        ),
      ).toBe("Course 0 (Wed + 2 weekends)");
      expect(
        localizeWorkoutTitle(
          "Kurs 1: Kompaktkurs Mo-Fr",
          "en",
        ),
      ).toBe("Course 1 (Intensive Course, Mon-Fri)");
      expect(
        localizeWorkoutTitle(
          "Kurs 2: Kompaktkurs Sa-So/unbesetzt",
          "en",
        ),
      ).toBe("Course 2 (Intensive Course, Sat-Sun; guidance vacancy)");
      expect(
        localizeWorkoutTitle(
          "Kurs 4: Kompaktkurs Mo-Fr/unbesetzt",
          "ja",
        ),
      ).toBe("コース4（集中コース 月〜金／指導枠空きあり）");
      expect(
        localizeWorkoutTitle(
          "Kurs 5: Kompaktkurs Sa-So/unbesetzt",
          "ko",
        ),
      ).toBe("코스 5 (집중 과정 토-일 / 지도 공석)");
      expect(
        localizeWorkoutTitle(
          "Kurs 3: Kompaktkurs Sa-So",
          "zh-CN",
        ),
      ).toBe("第3期（强化班 周六至周日）");
      expect(
        localizeWorkoutTitle(
          "Kurs 5: Kompaktkurs Sa-So/unbesetzt",
          "zh-CN",
        ),
      ).toBe("第5期（强化班 周六至周日／指导空缺）");
    });
  });

  describe("Given direct title-map entries for sailing labels", () => {
    test("then base labels use explicit mappings instead of generic grouping rules", () => {
      expect(localizeWorkoutTitle("kompakt", "en")).toBe("Intensive Course");
      expect(localizeWorkoutTitle("mit mehreren Yachten: adh", "en")).toBe(
        "with Several Yachts: adh",
      );
      expect(localizeWorkoutTitle("Inklusives Segeln", "en")).toBe(
        "Inclusive Sailing",
      );
      expect(localizeWorkoutTitle("Anfänger*innenkurs", "en")).toBe(
        "Beginners Course",
      );
      expect(localizeWorkoutTitle("dienstags", "en")).toBe("Tuesdays");
      expect(localizeWorkoutTitle("donnerstags", "en")).toBe("Thursdays");
      expect(localizeWorkoutTitle("mittwochs", "en")).toBe("Wednesdays");
      expect(localizeWorkoutTitle("montags", "en")).toBe("Mondays");
      expect(localizeWorkoutTitle("Kurs", "en")).toBe("Course");
      expect(localizeWorkoutTitle("Spi A Kurs", "en")).toBe("Spi A Course");
      expect(localizeWorkoutTitle("Spi F Kurs", "en")).toBe("Spi F Course");
    });
  });

  describe("Given an international sailing course title fragment marked as '/ unbesetzt'", () => {
    const source = "International Sailing Course/ unbesetzt";

    test("then it uses guidance-vacancy wording instead of a generic vacancy label", () => {
      expect(localizeWorkoutTitle(source, "en")).toBe(
        "International Sailing Course / guidance vacancy",
      );
      expect(localizeWorkoutTitle(source, "ja")).toBe(
        "国際セーリングコース／指導枠空きあり",
      );
      expect(localizeWorkoutTitle(source, "ko")).toBe(
        "국제 세일링 코스 / 지도 공석",
      );
      expect(localizeWorkoutTitle(source, "zh-CN")).toBe(
        "国际帆船课程／指导空缺",
      );
    });
  });
});
