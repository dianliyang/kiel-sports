import { describe, expect, test, vi } from "vitest";
import { getWorkoutCategoryMap, getWorkoutTitleMap, resetWorkoutLocaleMaps } from "../lib/workoutLocaleMaps";
import { loadWorkoutDetailCatalogFromSnapshot } from "../lib/workoutsApi";

describe("loadWorkoutDetailCatalogFromSnapshot", () => {
  test("loads the detail catalog through the published manifest", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url.endsWith("/workouts/manifest.json")) {
        return new Response(
          JSON.stringify({
            detailKey: "workouts/detail/2026-03-17T10-00-00Z.json",
            titleLocaleKey: "workouts/locales/title/2026-03-17T10-00-00Z.json",
            categoryLocaleKey: "workouts/locales/category/2026-03-17T10-00-00Z.json",
          }),
        );
      }

      if (url.endsWith("/workouts/detail/2026-03-17T10-00-00Z.json")) {
        return new Response(
          JSON.stringify({
            "yoga-flow": { slug: "yoga-flow", title: "Yoga Flow" },
            "boxing-basics": { slug: "boxing-basics", title: "Boxing Basics" },
          }),
        );
      }

      if (url.endsWith("/workouts/locales/title/2026-03-17T10-00-00Z.json")) {
        return new Response(JSON.stringify({
          "Yoga Flow": { en: "Yoga Flow", de: "Yoga Flow", ja: "ヨガフロー", ko: "요가 플로우", "zh-CN": "瑜伽流动" },
        }));
      }

      if (url.endsWith("/workouts/locales/category/2026-03-17T10-00-00Z.json")) {
        return new Response(JSON.stringify({
          Yoga: { en: "Yoga", de: "Yoga", ja: "ヨガ", ko: "요가", "zh-CN": "瑜伽" },
        }));
      }

      return new Response("not found", { status: 404 });
    });

    resetWorkoutLocaleMaps();
    const catalog = await loadWorkoutDetailCatalogFromSnapshot("https://example.com", fetchMock as typeof fetch);

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(catalog).toEqual({
      "yoga-flow": { slug: "yoga-flow", title: "Yoga Flow" },
      "boxing-basics": { slug: "boxing-basics", title: "Boxing Basics" },
    });
    expect(getWorkoutTitleMap()["Yoga Flow"]?.ja).toBe("ヨガフロー");
    expect(getWorkoutCategoryMap().Yoga?.ko).toBe("요가");
  });

  test("throws when a locale map fetch fails", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url.endsWith("/workouts/manifest.json")) {
        return new Response(JSON.stringify({
          detailKey: "workouts/detail/2026-03-17T10-00-00Z.json",
          titleLocaleKey: "workouts/locales/title/2026-03-17T10-00-00Z.json",
          categoryLocaleKey: "workouts/locales/category/2026-03-17T10-00-00Z.json",
        }));
      }

      if (url.endsWith("/workouts/detail/2026-03-17T10-00-00Z.json")) {
        return new Response(JSON.stringify({}));
      }

      if (url.endsWith("/workouts/locales/title/2026-03-17T10-00-00Z.json")) {
        return new Response("not found", { status: 404 });
      }

      return new Response(JSON.stringify({}));
    });

    resetWorkoutLocaleMaps();
    await expect(
      loadWorkoutDetailCatalogFromSnapshot("https://example.com", fetchMock as typeof fetch),
    ).rejects.toThrow("Snapshot request failed: 404");
  });

  test("throws when the manifest fetch fails", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url.endsWith("/workouts/manifest.json")) {
        return new Response("not found", { status: 404 });
      }

      return new Response("not found", { status: 404 });
    });

    await expect(
      loadWorkoutDetailCatalogFromSnapshot("https://example.com", fetchMock as typeof fetch),
    ).rejects.toThrow("Snapshot request failed: 404");
  });
});
