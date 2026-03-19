import { beforeAll, describe, expect, test } from "vitest";
import {
  renderCategoryPage,
  renderRow,
} from "../../docs/.vitepress/workouts/workoutPageRenderer";
import { setWorkoutCategoryWikipediaMap } from "../lib/workoutCategoryWikipediaMap";
import type { WorkoutDetailItem } from "../lib/workoutsCatalog";
import { setWorkoutLocaleMaps } from "../lib/workoutLocaleMaps";
import {
  workoutCategoryFixtureMap,
  workoutTitleFixtureMap,
} from "./fixtures/workoutLocaleFixtures";

beforeAll(() => {
  setWorkoutLocaleMaps({
    titleMap: workoutTitleFixtureMap,
    categoryMap: workoutCategoryFixtureMap,
  });
  setWorkoutCategoryWikipediaMap({
    Beachvolleyball: {
      en: "https://en.wikipedia.org/wiki/Beach_volleyball",
      ja: "https://ja.wikipedia.org/wiki/%E3%83%93%E3%83%BC%E3%83%81%E3%83%90%E3%83%AC%E3%83%BC%E3%83%9C%E3%83%BC%E3%83%AB",
    },
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
    Bouldering: {
      en: "https://en.wikipedia.org/wiki/Bouldering",
    },
  });
});

const baseItem: WorkoutDetailItem = {
  id: "spin-1",
  slug: "spin-1",
  title: "Spin Intervals",
  provider: "UniSport",
  category: "Cycling",
  description: null,
  schedule: [
    { day: "Mon", time: "18:00-19:00", location: "Studio A" },
    { day: "Wed", time: "18:00-19:00", location: "Studio A" },
  ],
  location: ["Studio A, Main Campus Hall"],
  url: "https://example.com/workouts/spin",
};

describe("workout page renderer", () => {
  test("renders a locale-aware Wikipedia link in the category page header", () => {
    const markdown = renderCategoryPage("ja", "Beachvolleyball", [], "2026-03-17T10:00:00Z");

    expect(markdown).toContain('class="workout-page-header"');
    expect(markdown).toContain('<h1 class="workout-page-title">');
    expect(markdown).toContain('class="workout-page-wikipedia"');
    expect(markdown).toContain('class="workout-page-wikipedia-icon"');
    expect(markdown).toContain('src="/wikipedia.svg"');
    expect(markdown).toContain('class="workout-page-wikipedia-wordmark"');
    expect(markdown).toContain('src="/wikipiedia-text.svg"');
    expect(markdown).toContain("https://ja.wikipedia.org/wiki/%E3%83%93%E3%83%BC%E3%83%81%E3%83%90%E3%83%AC%E3%83%BC%E3%83%9C%E3%83%BC%E3%83%AB");
    expect(markdown).toContain('alt="Wikipedia"');
    expect(markdown).toContain('snapshotUpdatedAt: "2026-03-17T10:00:00Z"');
    expect(markdown).toContain('description: "');
    expect(markdown).toContain('seoPageKind: "workout-category"');
    expect(markdown).toContain("seoVariantCount: 0");
  });

  test("keeps snapshotUpdatedAt in frontmatter for footer last-updated rendering", () => {
    const markdown = renderCategoryPage("de", "Tischtennis", [], "2026-03-17T10:00:00Z");

    expect(markdown).toContain('class="workout-page-heading"');
    expect(markdown).toContain('snapshotUpdatedAt: "2026-03-17T10:00:00Z"');
    expect(markdown).not.toContain('class="snapshot-last-modified"');
    expect(markdown).toContain('description: "');
    expect(markdown).toContain('seoPageKind: "workout-category"');
  });

  test("falls back to the English wikipedia mapping when a locale-specific URL is missing", () => {
    const markdown = renderCategoryPage("zh-CN", "Bouldering", []);

    expect(markdown).toContain('class="workout-page-actions"');
    expect(markdown).toContain('class="workout-page-wikipedia"');
    expect(markdown).toContain("https://en.wikipedia.org/wiki/Bouldering");
  });

  test("renders multiple wikipedia links side by side for composite categories", () => {
    const markdown = renderCategoryPage("en", "Bachata / Kizomba", []);

    expect(markdown.match(/class="workout-page-wikipedia"/g)?.length).toBe(2);
    expect(markdown).toContain("https://en.wikipedia.org/wiki/Bachata_(dance)");
    expect(markdown).toContain("https://en.wikipedia.org/wiki/Kizomba");
    expect(markdown).toContain("Wikipedia: Bachata");
    expect(markdown).toContain("Wikipedia: Kizomba");
  });

  test("hides the wikipedia link when the category has no mapping", () => {
    const markdown = renderCategoryPage("en", "Dance Fit", []);

    expect(markdown).not.toContain('class="workout-page-wikipedia"');
  });

  test("uses the same trimmed category label in the page header as the sidebar", () => {
    const markdown = renderCategoryPage("en", "CAU Alumni Cup:", []);

    expect(markdown).toContain('title: "CAU Alumni Cup"');
    expect(markdown).toContain('<h1 class="workout-page-title">CAU Alumni Cup</h1>');
    expect(markdown).not.toContain('<h1 class="workout-page-title">CAU Alumni Cup:</h1>');
  });

  test("uses the category as H1 and title mapping as H2", () => {
    const markdown = renderCategoryPage("en", "Yoga", [
      {
        title: "Yoga, Hatha Yoga (Präventionssport)",
        items: [{ ...baseItem, category: "Yoga", title: "Yoga, Hatha Yoga (Präventionssport)" }],
      },
    ]);

    expect(markdown).toContain("# Yoga");
    expect(markdown).toContain(
      "## Yoga – Hatha Yoga (Certified Health Programme)",
    );
  });

  test("does not duplicate the category in H2 when the localized title already matches it", () => {
    const markdown = renderCategoryPage("en", "Basketball", [
      {
        title: "Basketball",
        items: [{ ...baseItem, category: "Basketball", title: "Basketball" }],
      },
    ]);

    expect(markdown).toContain("# Basketball");
    expect(markdown).toContain("## Basketball");
    expect(markdown).not.toContain("## Basketball – Basketball");
  });

  test("renders workout details as VitePress custom containers", () => {
    const markdown = renderCategoryPage("en", "Yoga", [
      {
        title: "Yoga Flow",
        items: [
          {
            ...baseItem,
            category: "Yoga",
            title: "Yoga Flow",
            description: {
              general:
                "No previous experience necessary\nPlease arrive 10 minutes early.",
              price:
                "All prices are in euros and include VAT.\nStudents receive a discount.",
            },
          },
        ],
      },
    ]);

    expect(markdown).toContain("::: info General Note");
    expect(markdown).toContain("No previous experience necessary");
    expect(markdown).toContain("Please arrive 10 minutes early.");
    expect(markdown).toContain("::: tip Price Note");
    expect(markdown).toContain("All prices are in euros and include VAT.");
    expect(markdown).toContain("Students receive a discount.");
  });

  test("localizes detail container titles for non-English pages", () => {
    const markdown = renderCategoryPage("de", "Yoga", [
      {
        title: "Yoga Flow",
        items: [
          {
            ...baseItem,
            category: "Yoga",
            title: "Yoga Flow",
            description: {
              general: "Bitte Matte mitbringen.",
              price: "Barzahlung ist nicht möglich.",
            },
          },
        ],
      },
    ]);

    expect(markdown).toContain("::: info Allgemeine Hinweise");
    expect(markdown).toContain("::: tip Preishinweise");
    expect(markdown).not.toContain("::: info general");
    expect(markdown).not.toContain("::: tip price");
  });

  test("falls back to the legacy description as the general details container", () => {
    const markdown = renderCategoryPage("en", "Yoga", [
      {
        title: "Yoga Flow",
        items: [
          {
            ...baseItem,
            category: "Yoga",
            title: "Yoga Flow",
            description: {
              general:
                "No previous experience necessary\nPlease bring your own mat.",
            },
          },
        ],
      },
    ]);

    expect(markdown).toContain("::: info General Note");
    expect(markdown).toContain("Please bring your own mat.");
    expect(markdown).not.toContain("::: tip Price Note");
  });

  test("converts escaped newline sequences into markdown newlines inside detail containers", () => {
    const markdown = renderCategoryPage("en", "Yoga", [
      {
        title: "Yoga Flow",
        items: [
          {
            ...baseItem,
            category: "Yoga",
            title: "Yoga Flow",
            description: {
              general: "Checklist\\n\\n- a\\n- b",
            },
          },
        ],
      },
    ]);

    expect(markdown).toContain("Checklist\n\n- a\n- b");
    expect(markdown).not.toContain("\\n");
  });

  test("renders general description line breaks as visible markdown breaks only for description", () => {
    const markdown = renderCategoryPage("en", "Yoga", [
      {
        title: "Yoga Flow",
        items: [
          {
            ...baseItem,
            category: "Yoga",
            title: "Yoga Flow",
            description: {
              general:
                "No previous experience necessary\nWe don't accept cash - card payment only!\nIf you come to us regularly, please sign up for a profile to speed up\nthe entry process.",
              price: "Line one\nLine two",
            },
          },
        ],
      },
    ]);

    expect(markdown).toContain(
      "- No previous experience necessary\n- We don't accept cash - card payment only!\n- If you come to us regularly, please sign up for a profile to speed up the entry process.",
    );
    expect(markdown).toContain("::: tip Price Note\n- Line one\n- Line two\n:::");
  });

  test("keeps existing markdown list lines in general description", () => {
    const markdown = renderCategoryPage("en", "Yoga", [
      {
        title: "Yoga Flow",
        items: [
          {
            ...baseItem,
            category: "Yoga",
            title: "Yoga Flow",
            description: {
              general: "- a\n- b",
            },
          },
        ],
      },
    ]);

    expect(markdown).toContain("::: info General Note\n- a\n- b\n:::");
  });

  test("keeps existing markdown list lines in price description", () => {
    const markdown = renderCategoryPage("en", "Yoga", [
      {
        title: "Yoga Flow",
        items: [
          {
            ...baseItem,
            category: "Yoga",
            title: "Yoga Flow",
            description: {
              price: "- a\n- b",
            },
          },
        ],
      },
    ]);

    expect(markdown).toContain("::: tip Price Note\n- a\n- b\n:::");
  });

  test("renders nested price fields from the price object", () => {
    const html = renderRow(
      {
        ...baseItem,
        price: {
          adults: 18,
          children: 9,
          discount: 12,
        },
      },
      "en",
    );

    expect(html).toContain("Adults");
    expect(html).toContain("Children");
    expect(html).toContain("Discount");
    expect(html).toContain("€18");
    expect(html).toContain("€9");
    expect(html).toContain("€12");
  });

  test("does not localize category fragments inside instructor text", () => {
    const html = renderRow(
      {
        ...baseItem,
        instructor: "Team Gesellschaftstanz",
      },
      "en",
    );

    expect(html).toContain("Team Gesellschaftstanz");
    expect(html).not.toContain("Team Social Dance");
  });

  test("renders the whole card as a link when the item has a url", () => {
    const html = renderRow(baseItem, "en");

    expect(html).toContain(
      '<a class="workout-row" href="https://example.com/workouts/spin" target="_blank" rel="noopener noreferrer">',
    );
    expect(html).not.toContain("<div class=\"workout-row\">");
  });

  test("matches detailed top-level locations onto schedule mini-cards", () => {
    const html = renderRow(baseItem, "en");

    expect(html).toContain("Studio A, Main Campus Hall");
    expect(html).not.toContain("Open booking");
    expect(html).not.toContain('workout-detail is-location');
  });

  test("uses the top-level detailed location directly for a single schedule", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [{ day: "Mon", time: "18:00-19:00", location: "Studio A" }],
        location: ["Main Campus Hall, Room 2"],
      },
      "en",
    );

    expect(html).toContain("Main Campus Hall, Room 2");
    expect(html).not.toContain("Studio A</div>");
    expect(html).not.toContain('workout-detail is-location');
  });

  test("falls back to the schedule location for a single schedule when top-level location is missing", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [{ day: "Mon", time: "18:00-19:00", location: "Studio A" }],
        location: [],
      },
      "en",
    );

    expect(html).toContain("Studio A");
    expect(html).not.toContain('workout-detail is-location');
  });

  test("uses the top-level location directly for a single schedule even when the schedule location is empty", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [{ day: "Mon", time: "18:00-19:00", location: "" }],
      },
      "en",
    );

    expect(html).toContain("Studio A, Main Campus Hall");
    expect(html).not.toContain('workout-detail is-location');
  });

  test("renders booking status with the VitePress Badge component", () => {
    const html = renderRow(
      {
        ...baseItem,
        bookingStatus: "waitlist",
      },
      "en",
    );

    expect(html).toContain('<Badge type="warning" text="Waitlist" />');
    expect(html).not.toContain("workout-status-dot");
  });

  test("localizes raw tbd booking statuses", () => {
    const html = renderRow(
      {
        ...baseItem,
        bookingStatus: "tbd",
      },
      "ja",
    );

    expect(html).toContain('<Badge type="info" text="状態未定" />');
    expect(html).not.toContain('text="tbd"');
  });

  test("uses prerequisite-oriented labels for restricted statuses", () => {
    const english = renderRow(
      {
        ...baseItem,
        bookingStatus: "restricted",
      },
      "en",
    );
    const japanese = renderRow(
      {
        ...baseItem,
        bookingStatus: "restricted waitlist",
      },
      "ja",
    );

    expect(english).toContain(
      '<Badge type="warning" text="Eligibility required" />',
    );
    expect(japanese).toContain(
      '<Badge type="warning" text="キャンセル待ち（参加条件あり）" />',
    );
  });

  test("normalizes underscored restricted waitlist statuses for Chinese", () => {
    const chinese = renderRow(
      {
        ...baseItem,
        bookingStatus: "restricted_waitlist",
      },
      "zh-CN",
    );

    expect(chinese).toContain('<Badge type="warning" text="候补（需满足条件）" />');
    expect(chinese).not.toContain('text="restricted waitlist"');
  });

  test("localizes see text booking statuses for Chinese", () => {
    const chinese = renderRow(
      {
        ...baseItem,
        bookingStatus: "See text",
      },
      "zh-CN",
    );

    expect(chinese).toContain('<Badge type="info" text="见说明" />');
    expect(chinese).not.toContain('text="See text"');
  });

  test("renders multiple schedules as mini-cards inside the same session group", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [
          { day: "Mon", time: "18:00-19:00", location: "Studio A" },
          { day: "Wed", time: "18:00-19:00", location: "Studio B" },
          { day: "Fri", time: "20:00-21:00", location: "Studio C" },
        ],
        location: [
          "Studio A, Main Campus Hall",
          "Studio B, West Wing",
          "Studio C, North Annex",
        ],
        instructor: "Alex",
      },
      "en",
    );

    expect(html).toContain("workout-schedule-cards");
    expect(html.match(/class="workout-schedule-card"/g)).toHaveLength(3);
    expect(html).toContain("Mon 18:00-19:00");
    expect(html).toContain("Wed 18:00-19:00");
    expect(html).toContain("Fri 20:00-21:00");
    expect(html).toContain("Studio A, Main Campus Hall");
    expect(html).toContain("Studio B, West Wing");
    expect(html).toContain("Studio C, North Annex");
    expect(html).toContain("Alex");
    expect(html).not.toContain('workout-detail is-location');
  });

  test("uses all top-level locations directly for a single schedule", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [{ day: "Mon", time: "18:00-19:00", location: "Studio A" }],
        location: ["Studio A, Main Campus Hall", "Overflow Building, Room 3"],
      },
      "en",
    );

    expect(html).toContain("Studio A, Main Campus Hall");
    expect(html).toContain("Overflow Building, Room 3");
    expect(html).not.toContain('workout-detail is-location');
  });

  test("matches similar detailed addresses to the correct mini-card", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [
          {
            day: "Mon",
            time: "18:00-19:00",
            location: "Beach-Volleyballplatz 1",
          },
          {
            day: "Wed",
            time: "18:00-19:00",
            location: "Beach-Volleyballplatz 2",
          },
        ],
        location: [
          "Beach-Volleyballplatz 1, Olshausenstr. 70, 24118 Kiel",
          "Beach-Volleyballplatz 2, Olshausenstr.70, 24118 Kiel",
        ],
      },
      "en",
    );

    expect(html).toContain(
      "Beach-Volleyballplatz 1, Olshausenstr. 70, 24118 Kiel",
    );
    expect(html).toContain(
      "Beach-Volleyballplatz 2, Olshausenstr.70, 24118 Kiel",
    );
    expect(html).not.toContain(
      "Beach-Volleyballplatz 1, Olshausenstr. 70, Beach-Volleyballplatz 2, Olshausenstr.70, 24118 Kiel",
    );
    expect(html).not.toContain('workout-detail is-location');
  });

  test("localizes schedule-time phrases like 'nur am 06:05.' inside schedule cards", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [{ day: "Wed", time: "nur am 06:05.", location: "Studio A" }],
      },
      "zh-CN",
    );

    expect(html).toContain("周三 仅限 06:05.");
    expect(html).not.toContain("周三 nur am 06:05.");
  });

  test("localizes weekday tokens embedded in schedule time strings", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [{ day: "tägl.", time: "Sa ab 14 Uhr", location: "Studio A" }],
        location: ["Studio A"],
      } as any,
      "zh-CN",
    );

    expect(html).toContain("每日 周六 14点起");
    expect(html).not.toContain("每日 Sa ab 14 Uhr");
  });

  test("localizes embedded weekday tokens with bis time phrases in schedule strings", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [{ day: "Sat", time: "Sa bis 12:00", location: "Studio A" }],
        location: ["Studio A"],
      },
      "zh-CN",
    );

    expect(html).toContain("周六 周六 截至 12:00");
    expect(html).not.toContain("周六 Sa bis 12:00");
  });

  test("groups continuous schedule entries with the same time and resolved location", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [
          { day: "Thu", time: "09:00-18:00", location: "SZ Schilks" },
          { day: "Fri", time: "09:00-18:00", location: "SZ Schilks" },
          { day: "Sat", time: "09:00-18:00", location: "SZ Schilks" },
          { day: "Sun", time: "09:00-18:00", location: "SZ Schilks" },
        ],
        location: ["SZ Schilks, Soling 34, 24159 Kiel"],
      },
      "zh-CN",
    );

    expect(html.match(/class="workout-schedule-card"/g)).toHaveLength(1);
    expect(html).toContain("周四至周日 09:00-18:00");
    expect(html).toContain("SZ Schilks, Soling 34, 24159 Kiel");
  });

  test("groups non-continuous schedule entries with the same time and resolved location", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [
          { day: "Mon", time: "09:00-18:00", location: "SZ Schilks" },
          { day: "Wed", time: "09:00-18:00", location: "SZ Schilks" },
          { day: "Fri", time: "09:00-18:00", location: "SZ Schilks" },
        ],
        location: ["SZ Schilks, Soling 34, 24159 Kiel"],
      },
      "zh-CN",
    );

    expect(html.match(/class="workout-schedule-card"/g)).toHaveLength(1);
    expect(html).toContain("周一、周三、周五 09:00-18:00");
    expect(html).toContain("SZ Schilks, Soling 34, 24159 Kiel");
  });

  test("renders normalized closed and opening-hour schedule entries from German source rows", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [
          { day: "Mon", time: "Closed", location: "Holtenauer Straße 279, Kiel, Germany" },
          { day: "Sun", time: "Closed", location: "Holtenauer Straße 279, Kiel, Germany" },
          { day: "Tue", time: "17:00 - 22:00", location: "Holtenauer Straße 279, Kiel, Germany" },
          { day: "Wed", time: "17:00 - 23:00", location: "Holtenauer Straße 279, Kiel, Germany" },
          { day: "Thu", time: "17:00 - 23:00", location: "Holtenauer Straße 279, Kiel, Germany" },
          { day: "Fri", time: "17:00 - 00:00", location: "Holtenauer Straße 279, Kiel, Germany" },
          { day: "Sat", time: "14:00 - 00:00", location: "Holtenauer Straße 279, Kiel, Germany" },
        ],
        location: ["Holtenauer Straße 279, Kiel, Germany"],
      },
      "en",
    );

    expect(html).toContain("Mon, Sun Closed");
    expect(html).toContain("Tue 17:00 - 22:00");
    expect(html).toContain("Wed-Thu 17:00 - 23:00");
    expect(html).toContain("Fri 17:00 - 00:00");
    expect(html).toContain("Sat 14:00 - 00:00");
  });

  test("uses the single top-level location for all mini-cards when only one exists", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [
          { day: "Mon", time: "18:00-19:00", location: "Studio A" },
          { day: "Wed", time: "20:00-21:00", location: "Studio B" },
        ],
        location: ["Main Campus Hall, Room 2"],
      },
      "en",
    );

    expect(html.match(/Main Campus Hall, Room 2/g)).toHaveLength(2);
    expect(html).not.toContain("Studio A</div>");
    expect(html).not.toContain("Studio B</div>");
  });

  test("does not collapse different locations when top-level details are packed into one semicolon-separated string", () => {
    const html = renderRow(
      {
        ...baseItem,
        schedule: [
          { day: "Tue", time: "16:00-18:00", location: "SH tief Bahn 1" },
          { day: "Tue", time: "16:00-18:00", location: "SH tief Bahn 2" },
          { day: "Tue", time: "16:00-18:00", location: "SH tief Bahn 3" },
        ],
        location: [
          "SH tief Bahn 1, ,; SH tief Bahn 2, ,; SH tief Bahn 3, ,",
        ],
      },
      "zh-CN",
    );

    expect(html.match(/class="workout-schedule-card"/g)).toHaveLength(3);
    expect(html).toContain("周二 16:00-18:00");
    expect(html).toContain("SH tief Bahn 1");
    expect(html).toContain("SH tief Bahn 2");
    expect(html).toContain("SH tief Bahn 3");
    expect(html).not.toContain("SH tief Bahn 1, ,");
    expect(html).not.toContain("SH tief Bahn 2, ,");
    expect(html).not.toContain("SH tief Bahn 3, ,");
    expect(html).not.toContain("周二、周二、周二 16:00-18:00");
  });
});
