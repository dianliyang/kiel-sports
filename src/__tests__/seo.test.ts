import { describe, expect, test } from "vitest";
import {
  buildAlternateLocaleLinks,
  buildSeoDescription,
  buildSeoHead,
  buildJsonLd,
  buildWorkoutIndexDescription,
  buildWorkoutPageDescription,
  canonicalUrlForPath,
} from "../../docs/.vitepress/seo";

describe("seo helpers", () => {
  test("builds canonical URLs without markdown suffixes", () => {
    expect(canonicalUrlForPath("de/workouts/tischtennis.md")).toBe(
      "https://sport.oili.dev/de/workouts/tischtennis",
    );
    expect(canonicalUrlForPath("en/workouts/index.md")).toBe(
      "https://sport.oili.dev/en/workouts/",
    );
  });

  test("builds alternate locale links for localized routes", () => {
    const links = buildAlternateLocaleLinks("de/workouts/tischtennis.md");

    expect(links).toContainEqual([
      "link",
      {
        rel: "alternate",
        hreflang: "en",
        href: "https://sport.oili.dev/en/workouts/tischtennis",
      },
    ]);
    expect(links).toContainEqual([
      "link",
      {
        rel: "alternate",
        hreflang: "zh-CN",
        href: "https://sport.oili.dev/zh-cn/workouts/tischtennis",
      },
    ]);
    expect(links).toContainEqual([
      "link",
      {
        rel: "alternate",
        hreflang: "x-default",
        href: "https://sport.oili.dev/en/workouts/tischtennis",
      },
    ]);
  });

  test("prefers frontmatter descriptions when present", () => {
    expect(
      buildSeoDescription({
        title: "Tischtennis",
        description: "",
        relativePath: "de/workouts/tischtennis.md",
        frontmatter: {
          description: "Localized table tennis details in Kiel.",
        },
      }),
    ).toBe("Localized table tennis details in Kiel.");
  });

  test("builds page-specific SEO head tags", () => {
    const head = buildSeoHead({
      title: "Tischtennis",
      description: "",
      relativePath: "de/workouts/tischtennis.md",
      frontmatter: {
        description: "Table tennis in Kiel with schedules and prices.",
        seoPageKind: "workout-category",
        seoVariantCount: 2,
      },
    });

    expect(head).toContainEqual([
      "meta",
      { property: "og:type", content: "article" },
    ]);
    expect(head).toContainEqual([
      "meta",
      { property: "og:url", content: "https://sport.oili.dev/de/workouts/tischtennis" },
    ]);
    expect(head).toContainEqual([
      "meta",
      { name: "twitter:description", content: "Table tennis in Kiel with schedules and prices." },
    ]);
    expect(
      head.some((entry) =>
        entry[0] === "script" &&
        entry[1].type === "application/ld+json" &&
        entry[2].includes('"@type":"CollectionPage"') &&
        entry[2].includes('"numberOfItems":2'),
      ),
    ).toBe(true);
  });

  test("builds localized generated descriptions", () => {
    expect(buildWorkoutPageDescription("en", "Table Tennis", 2)).toContain("2 variants");
    expect(buildWorkoutPageDescription("de", "Tischtennis", 1)).toContain("1 Variante");
    expect(buildWorkoutIndexDescription("ja")).toContain("キール");
  });

  test("builds json-ld for workout pages and index pages", () => {
    const workoutNodes = buildJsonLd({
      title: "Tischtennis",
      description: "",
      relativePath: "de/workouts/tischtennis.md",
      frontmatter: {
        description: "Table tennis in Kiel with schedules and prices.",
        seoPageKind: "workout-category",
        seoVariantCount: 2,
      },
    });

    expect(workoutNodes).toHaveLength(2);
    expect(workoutNodes[0]["@type"]).toBe("BreadcrumbList");
    expect(workoutNodes[1]["@type"]).toBe("CollectionPage");
    expect((workoutNodes[1].mainEntity as Record<string, unknown>).numberOfItems).toBe(2);

    const indexNodes = buildJsonLd({
      title: "Workout",
      description: "",
      relativePath: "en/workouts/index.md",
      frontmatter: {
        description: "Kiel sports catalog with classes, schedules, pricing, and links to local providers.",
        seoPageKind: "workout-index",
      },
    });

    expect(indexNodes).toHaveLength(2);
    expect(indexNodes[1]["@type"]).toBe("CollectionPage");
    expect(indexNodes[1]).not.toHaveProperty("mainEntity");
  });
});
