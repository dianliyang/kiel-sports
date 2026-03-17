import { beforeAll, describe, expect, test } from "vitest";
import {
  buildWorkoutCategoryPages,
  buildWorkoutDetailCatalog,
  CATEGORY_INDEX_PATH,
} from "../lib/workoutsCatalog";
import { getCategoryLabel, localizeSidebarItems } from "../lib/workoutSidebarI18n";
import { localizeWeekday } from "../lib/workoutPageLocale";
import { setWorkoutLocaleMaps } from "../lib/workoutLocaleMaps";
import { workoutTitleMap } from "../lib/workoutTitleMap";
import { workoutCategoryMap } from "../lib/workoutCategoryMap";
import type { WorkoutDetailResponse as WorkoutDetailRecord } from "../lib/workoutsApi";

beforeAll(() => {
  setWorkoutLocaleMaps({
    titleMap: workoutTitleMap,
    categoryMap: workoutCategoryMap,
  });
});

const detailRecords: Record<string, WorkoutDetailRecord> = {
  yogaA: {
    id: "yoga-a",
    slug: "sunrise-yoga-a",
    title: "Sunrise Yoga 08.00-09.00",
    provider: "Campus Active",
    category: "Yoga",
    description: null,
    schedule: [{ day: "Mon", time: "08:00-09:00", location: "Studio A" }],
    location: ["Studio A"],
    url: "https://example.com/course-a",
    instructor: "Alex",
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    price: {
      student: 10,
      staff: 20,
      external: 30,
    },
    bookingStatus: "available",
    semester: "Summer 2026",
  },
  yogaB: {
    id: "yoga-b",
    slug: "sunrise-yoga-b",
    title: "Sunrise Yoga 10:00-11:00",
    provider: "Campus Active",
    category: "Yoga",
    description: null,
    schedule: [{ day: "Wed", time: "08:00-09:00", location: "Studio B" }],
    location: ["Studio B"],
    url: "https://example.com/course-b",
    instructor: "Taylor",
    startDate: "2026-04-02",
    endDate: "2026-07-01",
    price: {
      student: 11,
      staff: 21,
      external: 31,
    },
    bookingStatus: "waitlist",
    semester: "Summer 2026",
  },
  dance: {
    id: "dance-1",
    slug: "dance-fit",
    title: "Dance Fit",
    provider: "UniSport",
    category: "Dance",
    description: null,
    schedule: [{ day: "Tue", time: "18:00-19:00", location: "Hall 1" }],
    location: ["Hall 1"],
    url: "https://example.com/dance",
    instructor: "Jordan",
    startDate: "2026-04-03",
    endDate: "2026-06-20",
    price: {
      student: 5,
      staff: 8,
      external: 12,
    },
    bookingStatus: "available",
    semester: "Summer 2026",
  },
};

describe("workouts detail catalog transformations", () => {
  test("keeps detail records grouped by category and exact title", () => {
    const catalog = buildWorkoutDetailCatalog(detailRecords);

    expect(catalog.categories).toEqual(["Dance", "Yoga"]);
    expect(catalog.groups.Yoga.titleGroups).toEqual([
      {
        title: "Sunrise Yoga 08.00-09.00",
        items: [expect.objectContaining({ slug: "sunrise-yoga-a", instructor: "Alex" })],
      },
      {
        title: "Sunrise Yoga 10:00-11:00",
        items: [expect.objectContaining({ slug: "sunrise-yoga-b", instructor: "Taylor" })],
      },
    ]);
    expect(catalog.groups.Dance.titleGroups).toEqual([
      {
        title: "Dance Fit",
        items: [expect.objectContaining({ slug: "dance-fit" })],
      },
    ]);
  });

  test("normalizes top-level locations to trimmed arrays", () => {
    const catalog = buildWorkoutDetailCatalog({
      one: {
        ...detailRecords.yogaA,
        slug: "trimmed-locations",
        location: [" Studio A ", "", "  ", " Hall B"],
      },
      two: {
        ...detailRecords.dance,
        slug: "empty-locations",
        location: [],
      },
    });

    expect(catalog.groups.Yoga.items[0]?.location).toEqual(["Studio A", "Hall B"]);
    expect(catalog.groups.Dance.items[0]?.location).toEqual([]);
  });

  test("normalizes structured details and falls back to the legacy description", () => {
    const catalog = buildWorkoutDetailCatalog({
      one: {
        ...detailRecords.yogaA,
        slug: "structured-details",
        description: {
          general: "  Bring indoor shoes  ",
          price: "  Students: 10 EUR  ",
        },
      },
      two: {
        ...detailRecords.dance,
        slug: "legacy-details-fallback",
        description: {
          general: "  No experience necessary  ",
        },
      },
    });

    expect(catalog.groups.Yoga.items[0]?.description).toEqual({
      general: "Bring indoor shoes",
      price: "Students: 10 EUR",
    });
    expect(catalog.groups.Dance.items[0]?.description).toEqual({
      general: "No experience necessary",
      price: undefined,
    });
  });

  test("preserves titles that previously collapsed via generic grouping rules", () => {
    const records: Record<string, WorkoutDetailRecord> = {
      z1: {
        id: "z1",
        slug: "z1",
        title: "Zumba Di 19.10 - 20.10 Uhr",
        provider: "UniSport",
        category: "Dance",
        schedule: [],
      } as any,
      z2: {
        id: "z2",
        slug: "z2",
        title: "Yacht Anfänger*innen: Mi 12",
        provider: "UniSport",
        category: "Yacht",
        schedule: [],
      } as any,
      z3: {
        id: "z3",
        slug: "z3",
        title: "Indoor Cycling montags",
        provider: "UniSport",
        category: "Fitness",
        schedule: [],
      } as any,
    };

    const catalog = buildWorkoutDetailCatalog(records);
    expect(catalog.groups.Dance.titleGroups[0].title).toBe("Zumba Di 19.10 - 20.10 Uhr");
    expect(catalog.groups.Yacht.titleGroups[0].title).toBe("Yacht Anfänger*innen: Mi 12");
    expect(catalog.groups.Fitness.titleGroups[0].title).toBe("Indoor Cycling montags");
  });

  test("keeps separate exact-title groups when schedules differ by title", () => {
    const records: Record<string, WorkoutDetailRecord> = {
      s3: {
        id: "s3",
        slug: "s3",
        title: "Workout Thu 13:15-16:15",
        provider: "UniSport",
        category: "Fitness",
        schedule: [{ day: "Thu", time: "13:15-16:15", location: "L" }],
      } as any,
      s1: {
        id: "s1",
        slug: "s1",
        title: "Workout Tue 09:30-12:30",
        provider: "UniSport",
        category: "Fitness",
        schedule: [{ day: "Tue", time: "09:30-12:30", location: "L" }],
      } as any,
      s2: {
        id: "s2",
        slug: "s2",
        title: "Workout Thu 09:30-12:30",
        provider: "UniSport",
        category: "Fitness",
        schedule: [{ day: "Thu", time: "09:30-12:30", location: "L" }],
      } as any,
    };

    const catalog = buildWorkoutDetailCatalog(records);
    expect(catalog.groups.Fitness.titleGroups.map((group) => group.title)).toEqual([
      "Workout Tue 09:30-12:30",
      "Workout Thu 09:30-12:30",
      "Workout Thu 13:15-16:15",
    ]);
  });

  test("keeps group and course suffix titles as separate title groups", () => {
    const records: Record<string, WorkoutDetailRecord> = {
      b1: {
        id: "b1",
        slug: "b1",
        title: "Sportbootführerschein See Gruppe Di",
        provider: "UniSport",
        category: "Services",
        schedule: [],
      } as any,
      b2: {
        id: "b2",
        slug: "b2",
        title: "Sportbootführerschein See Gruppe Mi unbesetzt",
        provider: "UniSport",
        category: "Services",
        schedule: [],
      } as any,
      w1: {
        id: "w1",
        slug: "w1",
        title: "Windsurfing for Beginners 5x3h Course 1: Mo",
        provider: "UniSport",
        category: "Windsurf",
        schedule: [],
      } as any,
      w2: {
        id: "w2",
        slug: "w2",
        title: "Windsurfing for Beginners 5x3h Course 2: Mi",
        provider: "UniSport",
        category: "Windsurf",
        schedule: [],
      } as any,
    };

    const catalog = buildWorkoutDetailCatalog(records);
    expect(catalog.groups.Services.titleGroups.map((group) => group.title)).toEqual([
      "Sportbootführerschein See Gruppe Di",
      "Sportbootführerschein See Gruppe Mi unbesetzt",
    ]);
    expect(catalog.groups.Windsurf.titleGroups.map((group) => group.title)).toEqual([
      "Windsurfing for Beginners 5x3h Course 1: Mo",
      "Windsurfing for Beginners 5x3h Course 2: Mi",
    ]);
  });

  test("sorts numbered title groups in natural numeric order", () => {
    const records: Record<string, WorkoutDetailRecord> = {
      c10: {
        id: "c10",
        slug: "c10",
        title: "Anfänger*innenkurs 10",
        provider: "UniSport",
        category: "Sailing",
        schedule: [],
      } as any,
      c2: {
        id: "c2",
        slug: "c2",
        title: "Anfänger*innenkurs 2",
        provider: "UniSport",
        category: "Sailing",
        schedule: [],
      } as any,
      c1: {
        id: "c1",
        slug: "c1",
        title: "Anfänger*innenkurs 1",
        provider: "UniSport",
        category: "Sailing",
        schedule: [],
      } as any,
    };

    const catalog = buildWorkoutDetailCatalog(records);
    expect(catalog.groups.Sailing.titleGroups.map((group) => group.title)).toEqual([
      "Anfänger*innenkurs 1",
      "Anfänger*innenkurs 2",
      "Anfänger*innenkurs 10",
    ]);
  });

  test("sorts localized weekday titles by weekday before number", () => {
    const records: Record<string, WorkoutDetailRecord> = {
      tue1: {
        id: "tue1",
        slug: "tue1",
        title: "基尔周 周二 1",
        provider: "UniSport",
        category: "Sailing",
        schedule: [],
      } as any,
      tue2: {
        id: "tue2",
        slug: "tue2",
        title: "基尔周 周二 2",
        provider: "UniSport",
        category: "Sailing",
        schedule: [],
      } as any,
      thu1: {
        id: "thu1",
        slug: "thu1",
        title: "基尔周 周四 1",
        provider: "UniSport",
        category: "Sailing",
        schedule: [],
      } as any,
      thu2: {
        id: "thu2",
        slug: "thu2",
        title: "基尔周 周四 2",
        provider: "UniSport",
        category: "Sailing",
        schedule: [],
      } as any,
      fri1: {
        id: "fri1",
        slug: "fri1",
        title: "基尔周 周五 1",
        provider: "UniSport",
        category: "Sailing",
        schedule: [],
      } as any,
      fri2: {
        id: "fri2",
        slug: "fri2",
        title: "基尔周 周五 2",
        provider: "UniSport",
        category: "Sailing",
        schedule: [],
      } as any,
      wed1: {
        id: "wed1",
        slug: "wed1",
        title: "基尔周 周三 1",
        provider: "UniSport",
        category: "Sailing",
        schedule: [],
      } as any,
      wed2: {
        id: "wed2",
        slug: "wed2",
        title: "基尔周 周三 2",
        provider: "UniSport",
        category: "Sailing",
        schedule: [],
      } as any,
      mon1: {
        id: "mon1",
        slug: "mon1",
        title: "基尔周 周一 1",
        provider: "UniSport",
        category: "Sailing",
        schedule: [],
      } as any,
      mon2: {
        id: "mon2",
        slug: "mon2",
        title: "基尔周 周一 2",
        provider: "UniSport",
        category: "Sailing",
        schedule: [],
      } as any,
    };

    const catalog = buildWorkoutDetailCatalog(records);
    expect(catalog.groups.Sailing.titleGroups.map((group) => group.title)).toEqual([
      "基尔周 周一 1",
      "基尔周 周一 2",
      "基尔周 周二 1",
      "基尔周 周二 2",
      "基尔周 周三 1",
      "基尔周 周三 2",
      "基尔周 周四 1",
      "基尔周 周四 2",
      "基尔周 周五 1",
      "基尔周 周五 2",
    ]);
  });

  test("sorts localized English weekday titles by weekday before time", () => {
    const records: Record<string, WorkoutDetailRecord> = {
      thu1: {
        id: "thu1",
        slug: "thu1",
        title: "Thursdays 16:15–17:00",
        provider: "UniSport",
        category: "Fitness",
        schedule: [],
      } as any,
      thu2: {
        id: "thu2",
        slug: "thu2",
        title: "Thursdays 17:15–18:00",
        provider: "UniSport",
        category: "Fitness",
        schedule: [],
      } as any,
      mon1: {
        id: "mon1",
        slug: "mon1",
        title: "Mondays 16:15–17:00",
        provider: "UniSport",
        category: "Fitness",
        schedule: [],
      } as any,
      mon2: {
        id: "mon2",
        slug: "mon2",
        title: "Mondays 17:15–18:00",
        provider: "UniSport",
        category: "Fitness",
        schedule: [],
      } as any,
    };

    const catalog = buildWorkoutDetailCatalog(records);
    expect(catalog.groups.Fitness.titleGroups.map((group) => group.title)).toEqual([
      "Mondays 16:15–17:00",
      "Mondays 17:15–18:00",
      "Thursdays 16:15–17:00",
      "Thursdays 17:15–18:00",
    ]);
  });

  test("keeps different Ballett variants as separate categories", () => {
    const records: Record<string, WorkoutDetailRecord> = {
      b1: {
        id: "b1",
        slug: "b1",
        title: "Ballett, American Technique Anf. mit Grundk. und Mittelstufe",
        provider: "UniSport",
        category: "Ballett, American Technique",
        schedule: [],
      } as any,
      b2: {
        id: "b2",
        slug: "b2",
        title: "Ballett, klassisches Ballett Anfänger*innen",
        provider: "UniSport",
        category: "Ballett, klassisches Ballett",
        schedule: [],
      } as any,
    };

    const catalog = buildWorkoutDetailCatalog(records);
    expect(catalog.categories).toContain("Ballett, American Technique");
    expect(catalog.categories).toContain("Ballett, klassisches Ballett");
    expect(catalog.groups["Ballett, American Technique"].titleGroups).toHaveLength(1);
    expect(catalog.groups["Ballett, klassisches Ballett"].titleGroups).toHaveLength(1);
  });

  test("builds sidebar/page metadata from detail category groups", () => {
    const pages = buildWorkoutCategoryPages(buildWorkoutDetailCatalog(detailRecords));

    expect(pages.sidebar).toEqual([
      { text: "Dance", link: "/workouts/dance" },
      { text: "Yoga", link: "/workouts/yoga" },
    ]);
    expect(pages.pages).toEqual([
      expect.objectContaining({
        category: "Dance",
        path: "docs/workouts/dance.md",
        route: "/workouts/dance",
      }),
      expect.objectContaining({
        category: "Yoga",
        path: "docs/workouts/yoga.md",
        route: "/workouts/yoga",
      }),
    ]);
    expect(CATEGORY_INDEX_PATH).toBe("docs/workouts");
  });

  test("translates sidebar labels with fallback to the source category", () => {
    expect(getCategoryLabel("de", "Aqua-Jogging")).toBe("Aqua-Jogging");
    expect(getCategoryLabel("en", "Aqua-Jogging")).toBe("Aqua Jogging");
    expect(getCategoryLabel("zh-CN", "Aqua-Jogging")).toBe("水中慢跑");
    expect(getCategoryLabel("ja", "Aqua-Jogging")).toBe("アクアジョギング");
    expect(getCategoryLabel("ko", "Aqua-Jogging")).toBe("아쿠아 조깅");
    expect(getCategoryLabel("zh-CN", "Calisthenics")).toBe("街头健身");
    expect(getCategoryLabel("zh-CN", "Yachtsegeln Inklusion")).toBe("融合游艇帆船");
    expect(getCategoryLabel("zh-CN", "Ballett, American Technique")).toBe("芭蕾，美式技巧");
    expect(getCategoryLabel("en", "Schwimmen für SL")).toBe("Swimming for SL");
    expect(getCategoryLabel("en", "Erwachsene")).toBe("Erwachsene");
    expect(getCategoryLabel("ja", "öff. Schwimmbetrieb")).toBe("öff. Schwimmbetrieb");
    expect(getCategoryLabel("ko", "Uni Wettkampf Mannschaft")).toBe("대학 경기 팀");
    expect(getCategoryLabel("en", "für Anfänger*innen")).toBe("for Beginners");
    expect(getCategoryLabel("zh-CN", "Ballett")).toBe("芭蕾");
    expect(getCategoryLabel("ja", "Yacht Segeltörns mit \"Iuventa\"")).toBe(
      "\"Iuventa\" でのヨットセーリングツアー",
    );
    expect(getCategoryLabel("ko", "Warming up Mantra")).toBe(
      "Mantra 워밍업",
    );
    expect(getCategoryLabel("en", "Nonexistent Category")).toBe("Nonexistent Category");
    expect(getCategoryLabel("ja", "Nonexistent Category")).toBe("Nonexistent Category");
    expect(getCategoryLabel("ko", "Nonexistent Category")).toBe("Nonexistent Category");
    expect(getCategoryLabel("zh-CN", "Nonexistent Category")).toBe("Nonexistent Category");
  });

  test("normalizes sidebar labels before map lookup", () => {
    expect(getCategoryLabel("en", " Aqua-Jogging : ")).toBe("Aqua Jogging");
    expect(getCategoryLabel("ja", "Aqua-Jogging：")).toBe("アクアジョギング");
    expect(getCategoryLabel("zh-CN", "Ballett,   American Technique")).toBe(
      "芭蕾，美式技巧",
    );
  });

  test("localizes weekday aliases and ranges consistently", () => {
    expect(localizeWeekday(" Mo-Fr ", "en")).toBe("Mon-Fri");
    expect(localizeWeekday("Sat-Sun", "ja")).toBe("土〜日");
    expect(localizeWeekday("Di-Do", "zh-CN")).toBe("周二至周四");
  });

  test("builds VitePress sidebar groups for category families", () => {
    expect(
      localizeSidebarItems("en", [
        { text: "Yoga, Aerial Yoga", link: "/en/workouts/yoga-aerial-yoga" },
        { text: "Yoga, Hatha Yoga", link: "/en/workouts/yoga-hatha-yoga" },
        {
          text: "Yoga, Hatha Yoga (Präventionssport)",
          link: "/en/workouts/yoga-hatha-yoga-praventionssport",
        },
        { text: "Yoga, Vinyasa", link: "/en/workouts/yoga-vinyasa" },
        { text: "Yoga, Wake Up Yoga", link: "/en/workouts/yoga-wake-up-yoga" },
        { text: "Jollen Einstufungssegeln", link: "/en/workouts/jollen-einstufungssegeln" },
        { text: "freies Jollensegeln", link: "/en/workouts/freies-jollensegeln" },
        { text: "Yachtsegeln für Frauen:", link: "/en/workouts/yachtsegeln-fur-frauen" },
        { text: "Yachtsegeln Inklusion:", link: "/en/workouts/yachtsegeln-inklusion" },
        { text: "Yachtsegeln Zweihand:", link: "/en/workouts/yachtsegeln-zweihand" },
        { text: "Aqua-Jogging", link: "/en/workouts/aqua-jogging" },
        { text: "Badminton", link: "/en/workouts/badminton" },
        { text: "Schwimmkurse Kinder", link: "/en/workouts/schwimmkurse-kinder" },
        { text: "Schwimmen", link: "/en/workouts/schwimmen" },
        { text: "Indoor Cycling", link: "/en/workouts/indoor-cycling" },
        { text: "Basketball", link: "/en/workouts/basketball" },
        { text: "Inline-Hockey", link: "/en/workouts/inline-hockey" },
        { text: "Lacrosse", link: "/en/workouts/lacrosse" },
        { text: "Floorball", link: "/en/workouts/floorball" },
        { text: "Fitnessgymnastik für Ältere", link: "/en/workouts/fitnessgymnastik-fur-altere" },
        { text: "Tenniskurse kompakt Semesterferien", link: "/en/workouts/tenniskurse-kompakt-semesterferien" },
        { text: "Tenniskurse Semester", link: "/en/workouts/tenniskurse-semester" },
        { text: "Volleyball", link: "/en/workouts/volleyball" },
        { text: "Tischtennis", link: "/en/workouts/tischtennis" },
        { text: "Aikido", link: "/en/workouts/aikido" },
        { text: "Aerial Hoop", link: "/en/workouts/aerial-hoop" },
        { text: "Akrobatik", link: "/en/workouts/akrobatik" },
        { text: "Boxen", link: "/en/workouts/boxen" },
        { text: "CAU Alumni Cup", link: "/en/workouts/cau-alumni-cup" },
        { text: "Kajakrolle", link: "/en/workouts/kajakrolle" },
        { text: "Kanu", link: "/en/workouts/kanu" },
        { text: "Kanupolo", link: "/en/workouts/kanupolo" },
        { text: "Kinderklettern", link: "/en/workouts/kinderklettern" },
        { text: "Judo", link: "/en/workouts/judo" },
        { text: "Klettern", link: "/en/workouts/klettern" },
        { text: "Klettersport", link: "/en/workouts/klettersport" },
        { text: "Langhanteltraining", link: "/en/workouts/langhanteltraining" },
        { text: "Lauftreff", link: "/en/workouts/lauftreff" },
        { text: "Orientierungslauf", link: "/en/workouts/orientierungslauf" },
        { text: "Parkour", link: "/en/workouts/parkour" },
        { text: "Pilates", link: "/en/workouts/pilates" },
        { text: "Rückenfit", link: "/en/workouts/ruckenfit" },
        { text: "Tai Chi", link: "/en/workouts/tai-chi" },
        { text: "Erste Hilfe Kurs", link: "/en/workouts/erste-hilfe-kurs" },
        { text: "Semestergebühr", link: "/en/workouts/semestergebuhr" },
        { text: "Wellenreiten in Rantum/Sylt", link: "/en/workouts/wellenreiten-in-rantum-sylt" },
        { text: "Kitesurfen am Wochenende", link: "/en/workouts/kitesurfen-am-wochenende" },
        { text: "Vertikaltuch", link: "/en/workouts/vertikaltuch" },
        { text: "Afro Dance", link: "/en/workouts/afro-dance" },
        { text: "Ballett, American Technique", link: "/en/workouts/ballett-american-technique" },
        { text: "Ballett, klassisches Ballett", link: "/en/workouts/ballett-klassisches-ballett" },
        { text: "Forró", link: "/en/workouts/forro" },
        { text: "Gesellschaftstanz", link: "/en/workouts/gesellschaftstanz" },
        { text: "Pole Dance", link: "/en/workouts/pole-dance" },
        { text: "Rock`n`Roll", link: "/en/workouts/rock-n-roll" },
        { text: "Salsa", link: "/en/workouts/salsa" },
        { text: "Tanzsport, Standard und Latein", link: "/en/workouts/tanzsport-standard-und-latein" },
        { text: "Zumba", link: "/en/workouts/zumba" },
      ]),
    ).toEqual([
      {
        collapsed: false,
        text: "Ball Sports",
        items: [
          { text: "Badminton", link: "/en/workouts/badminton" },
          { text: "Basketball", link: "/en/workouts/basketball" },
          {
            text: "Compact Tennis Courses during Semester Break",
            link: "/en/workouts/tenniskurse-kompakt-semesterferien",
          },
          { text: "Floorball", link: "/en/workouts/floorball" },
          { text: "Inline Hockey", link: "/en/workouts/inline-hockey" },
          { text: "Lacrosse", link: "/en/workouts/lacrosse" },
          { text: "Semester Tennis Courses", link: "/en/workouts/tenniskurse-semester" },
          { text: "Table Tennis", link: "/en/workouts/tischtennis" },
          { text: "Volleyball", link: "/en/workouts/volleyball" },
        ],
      },
      {
        collapsed: false,
        text: "Board Sports",
        items: [
          { text: "Surfing in Rantum / Sylt", link: "/en/workouts/wellenreiten-in-rantum-sylt" },
          { text: "Weekend Kitesurfing", link: "/en/workouts/kitesurfen-am-wochenende" },
        ],
      },
      {
        collapsed: false,
        text: "Combat Sports",
        items: [
          { text: "Aikido", link: "/en/workouts/aikido" },
          { text: "Boxing", link: "/en/workouts/boxen" },
          { text: "Judo", link: "/en/workouts/judo" },
        ],
      },
      {
        collapsed: false,
        text: "Dance",
        items: [
          { text: "Afro Dance", link: "/en/workouts/afro-dance" },
          { text: "Ballet, American Technique", link: "/en/workouts/ballett-american-technique" },
          { text: "Ballet, Classical Ballet", link: "/en/workouts/ballett-klassisches-ballett" },
          { text: "Forro", link: "/en/workouts/forro" },
          { text: "Pole Dance", link: "/en/workouts/pole-dance" },
          { text: "Rock'n'Roll", link: "/en/workouts/rock-n-roll" },
          { text: "Salsa", link: "/en/workouts/salsa" },
          { text: "Social Dance", link: "/en/workouts/gesellschaftstanz" },
          {
            text: "Tanzsport, Standard und Latein",
            link: "/en/workouts/tanzsport-standard-und-latein",
          },
          { text: "Zumba", link: "/en/workouts/zumba" },
        ],
      },
      {
        collapsed: false,
        text: "Fitness",
        items: [
          { text: "Back Fitness", link: "/en/workouts/ruckenfit" },
          { text: "Barbell Training", link: "/en/workouts/langhanteltraining" },
          {
            text: "Fitness Gymnastics for Older Adults",
            link: "/en/workouts/fitnessgymnastik-fur-altere",
          },
          { text: "Indoor Cycling", link: "/en/workouts/indoor-cycling" },
        ],
      },
      {
        collapsed: false,
        text: "Dinghy Sailing",
        items: [
          { text: "Open Dinghy Sailing", link: "/en/workouts/freies-jollensegeln" },
          { text: "Dinghy Placement Sailing", link: "/en/workouts/jollen-einstufungssegeln" },
        ],
      },
      {
        collapsed: false,
        text: "Canoe Sports",
        items: [
          { text: "Canoe Polo", link: "/en/workouts/kanupolo" },
          { text: "Canoeing", link: "/en/workouts/kanu" },
          { text: "Kayak Roll", link: "/en/workouts/kajakrolle" },
        ],
      },
      {
        collapsed: false,
        text: "Climbing",
        items: [
          { text: "Children's Climbing", link: "/en/workouts/kinderklettern" },
          { text: "Climbing", link: "/en/workouts/klettern" },
          { text: "Sport Climbing", link: "/en/workouts/klettersport" },
        ],
      },
      {
        collapsed: false,
        text: "Mind & Body",
        items: [
          { text: "Pilates", link: "/en/workouts/pilates" },
          { text: "Tai Chi", link: "/en/workouts/tai-chi" },
        ],
      },
      {
        collapsed: false,
        text: "Swimming",
        items: [
          { text: "Aqua Jogging", link: "/en/workouts/aqua-jogging" },
          { text: "Children's Swimming Courses", link: "/en/workouts/schwimmkurse-kinder" },
          { text: "Schwimmen", link: "/en/workouts/schwimmen" },
        ],
      },
      {
        collapsed: false,
        text: "Services",
        items: [
          { text: "First Aid Course", link: "/en/workouts/erste-hilfe-kurs" },
          { text: "Semester Fee", link: "/en/workouts/semestergebuhr" },
        ],
      },
      {
        collapsed: false,
        text: "Other Sports",
        items: [
          { text: "Acrobatics", link: "/en/workouts/akrobatik" },
          { text: "Aerial Hoop", link: "/en/workouts/aerial-hoop" },
          { text: "Aerial Silks", link: "/en/workouts/vertikaltuch" },
          { text: "CAU Alumni Cup", link: "/en/workouts/cau-alumni-cup" },
          { text: "Orienteering", link: "/en/workouts/orientierungslauf" },
          { text: "Parkour", link: "/en/workouts/parkour" },
          { text: "Running Group", link: "/en/workouts/lauftreff" },
        ],
      },
      {
        collapsed: false,
        text: "Yacht",
        items: [
          { text: "Yacht Sailing for Women", link: "/en/workouts/yachtsegeln-fur-frauen" },
          { text: "Inclusive Yacht Sailing", link: "/en/workouts/yachtsegeln-inklusion" },
          { text: "Two-Handed Yacht Sailing", link: "/en/workouts/yachtsegeln-zweihand" },
        ],
      },
      {
        collapsed: false,
        text: "Yoga",
        items: [
          { text: "Yoga, Aerial Yoga", link: "/en/workouts/yoga-aerial-yoga" },
          { text: "Yoga, Hatha Yoga", link: "/en/workouts/yoga-hatha-yoga" },
          {
            text: "Yoga – Hatha Yoga (Certified Health Programme)",
            link: "/en/workouts/yoga-hatha-yoga-praventionssport",
          },
          { text: "Yoga, Vinyasa", link: "/en/workouts/yoga-vinyasa" },
          { text: "Yoga, Wake Up Yoga", link: "/en/workouts/yoga-wake-up-yoga" },
        ],
      },
    ]);
  });

  test("merges specific semester-fee categories into the Semestergebühr page", () => {
    const catalog = buildWorkoutDetailCatalog({
      danceFee: {
        id: "dance-fee",
        slug: "dance-fee",
        title: "Gesellschaftstanz Semestergebühr",
        provider: "UniSport",
        category: "Gesellschaftstanz Semestergebühr",
        description: null,
        schedule: [],
        location: null,
        url: null,
      },
      canoeFee: {
        id: "canoe-fee",
        slug: "canoe-fee",
        title: "Kanu-/Rudersport Semestergebühr",
        provider: "UniSport",
        category: "Kanu-/Rudersport Semestergebühr",
        description: null,
        schedule: [],
        location: null,
        url: null,
      },
      genericFee: {
        id: "generic-fee",
        slug: "generic-fee",
        title: "Semestergebühr",
        provider: "UniSport",
        category: "Semestergebühr",
        description: null,
        schedule: [],
        location: null,
        url: null,
      },
    });

    expect(catalog.categories).toEqual(["Semestergebühr"]);
    expect(catalog.groups.Semestergebühr.items).toHaveLength(3);
    expect(catalog.groups.Semestergebühr.items.map((item) => item.slug)).toEqual([
      "dance-fee",
      "canoe-fee",
      "generic-fee",
    ]);
  });

  test("keeps Jollen Regatta CAU as its own category page", () => {
    const catalog = buildWorkoutDetailCatalog({
      regattaCau: {
        id: "regatta-cau",
        slug: "regatta-cau",
        title: "Jollen Regatta CAU",
        provider: "UniSport",
        category: "Jollen Regatta CAU",
        description: null,
        schedule: [],
        location: null,
        url: null,
      },
      regattaTraining: {
        id: "regatta-training",
        slug: "regatta-training",
        title: "Jollen Regattatraining",
        provider: "UniSport",
        category: "Jollen Regattatraining",
        description: null,
        schedule: [],
        location: null,
        url: null,
      },
    });

    expect(catalog.categories).toEqual([
      "Jollen Regatta CAU",
      "Jollen Regattatraining",
    ]);
    expect(catalog.groups["Jollen Regatta CAU"].items.map((item) => item.slug)).toEqual([
      "regatta-cau",
    ]);
    expect(catalog.groups["Jollen Regattatraining"].items.map((item) => item.slug)).toEqual([
      "regatta-training",
    ]);
  });

  test("groups Jollen Regatta CAU into the Jollensegeln family", () => {
    expect(
      localizeSidebarItems("en", [
        { text: "Jollen Regatta CAU", link: "/en/workouts/jollen-regatta-cau" },
        {
          text: "Jollen Regattatraining",
          link: "/en/workouts/jollen-regattatraining",
        },
      ]),
    ).toEqual([
      {
        collapsed: false,
        text: "Dinghy Sailing",
        items: [
          { text: "CAU Dinghy Regatta", link: "/en/workouts/jollen-regatta-cau" },
          {
            text: "Dinghy Regatta Training",
            link: "/en/workouts/jollen-regattatraining",
          },
        ],
      },
    ]);
  });

  test("builds Chinese sidebar groups with localized family labels", () => {
    expect(
      localizeSidebarItems("zh-CN", [
        { text: "Basketball", link: "/zh-cn/workouts/basketball" },
        { text: "Volleyball", link: "/zh-cn/workouts/volleyball" },
        { text: "Aikido", link: "/zh-cn/workouts/aikido" },
        { text: "Kinderklettern", link: "/zh-cn/workouts/kinderklettern" },
        { text: "Klettern", link: "/zh-cn/workouts/klettern" },
        { text: "Yoga, Aerial Yoga", link: "/zh-cn/workouts/yoga-aerial-yoga" },
        { text: "Schwimmkurse Kinder", link: "/zh-cn/workouts/schwimmkurse-kinder" },
      ]),
    ).toEqual([
      {
        collapsed: false,
        text: "球类运动",
        items: [
          { text: "排球", link: "/zh-cn/workouts/volleyball" },
          { text: "篮球", link: "/zh-cn/workouts/basketball" },
        ],
      },
      {
        collapsed: false,
        text: "武术搏击",
        items: [{ text: "合气道", link: "/zh-cn/workouts/aikido" }],
      },
      {
        collapsed: false,
        text: "攀岩",
        items: [
          { text: "儿童攀岩", link: "/zh-cn/workouts/kinderklettern" },
          { text: "攀岩", link: "/zh-cn/workouts/klettern" },
        ],
      },
      {
        collapsed: false,
        text: "游泳",
        items: [{ text: "儿童游泳课程", link: "/zh-cn/workouts/schwimmkurse-kinder" }],
      },
      {
        collapsed: false,
        text: "瑜伽",
        items: [{ text: "瑜伽, 空中瑜伽", link: "/zh-cn/workouts/yoga-aerial-yoga" }],
      },
    ]);
  });

  test("builds Japanese and Korean sidebar groups with localized family labels", () => {
    expect(
      localizeSidebarItems("ja", [
        { text: "Basketball", link: "/ja/workouts/basketball" },
        { text: "Volleyball", link: "/ja/workouts/volleyball" },
        { text: "Aikido", link: "/ja/workouts/aikido" },
        { text: "Yoga, Aerial Yoga", link: "/ja/workouts/yoga-aerial-yoga" },
      ]),
    ).toEqual([
      {
        collapsed: false,
        text: "球技",
        items: [
          { text: "バスケットボール", link: "/ja/workouts/basketball" },
          { text: "バレーボール", link: "/ja/workouts/volleyball" },
        ],
      },
      {
        collapsed: false,
        text: "格闘技",
        items: [{ text: "合気道", link: "/ja/workouts/aikido" }],
      },
      {
        collapsed: false,
        text: "ヨガ",
        items: [{ text: "ヨガ, エアリアルヨガ", link: "/ja/workouts/yoga-aerial-yoga" }],
      },
    ]);

    expect(
      localizeSidebarItems("ko", [
        { text: "Basketball", link: "/ko/workouts/basketball" },
        { text: "Volleyball", link: "/ko/workouts/volleyball" },
        { text: "Aikido", link: "/ko/workouts/aikido" },
        { text: "Yoga, Aerial Yoga", link: "/ko/workouts/yoga-aerial-yoga" },
      ]),
    ).toEqual([
      {
        collapsed: false,
        text: "구기 종목",
        items: [
          { text: "농구", link: "/ko/workouts/basketball" },
          { text: "배구", link: "/ko/workouts/volleyball" },
        ],
      },
      {
        collapsed: false,
        text: "격투 스포츠",
        items: [{ text: "합기도", link: "/ko/workouts/aikido" }],
      },
      {
        collapsed: false,
        text: "요가",
        items: [{ text: "요가, 에어리얼 요가", link: "/ko/workouts/yoga-aerial-yoga" }],
      },
    ]);
  });

  test("groups Bouldering into the Klettern family", () => {
    expect(
      localizeSidebarItems("en", [
        { text: "Bouldering", link: "/en/workouts/bouldering" },
        { text: "Klettern", link: "/en/workouts/klettern" },
      ]),
    ).toEqual([
      {
        collapsed: false,
        text: "Climbing",
        items: [
          { text: "Bouldering", link: "/en/workouts/bouldering" },
          { text: "Climbing", link: "/en/workouts/klettern" },
        ],
      },
    ]);
  });
});
