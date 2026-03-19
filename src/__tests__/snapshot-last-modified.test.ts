import { describe, expect, test } from "vitest";
import {
  resolveLastUpdatedConfig,
  resolveSnapshotLastModified,
} from "../../docs/.vitepress/theme/snapshotLastModified";

describe("resolveSnapshotLastModified", () => {
  test("returns localized snapshot metadata for generated pages", () => {
    const date = new Date("2026-03-17T10:00:00Z");
    expect(
      resolveSnapshotLastModified("en-US", {
        snapshotUpdatedAt: "2026-03-17T10:00:00Z",
      }, {
        text: "Last updated",
      }),
    ).toEqual({
      label: "Last updated",
      datetime: "2026-03-17T10:00:00Z",
      text: new Intl.DateTimeFormat("en-US", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(date),
    });
  });

  test("formats snapshot timestamps using the active page locale", () => {
    const date = new Date("2026-03-17T10:00:00Z");

    expect(
      resolveSnapshotLastModified("de-DE", {
        snapshotUpdatedAt: "2026-03-17T10:00:00Z",
      }, {
        text: "Zuletzt aktualisiert",
        formatOptions: { dateStyle: "short", timeStyle: "short", forceLocale: true },
      }),
    ).toEqual({
      label: "Zuletzt aktualisiert",
      datetime: "2026-03-17T10:00:00Z",
      text: new Intl.DateTimeFormat("de-DE", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(date),
    });
  });

  test("accepts worker-style timestamps with dash-separated time parts", () => {
    const result = resolveSnapshotLastModified("de-DE", {
      snapshotUpdatedAt: "2026-03-19T09-48-47-332Z",
    }, {
      text: "Zuletzt aktualisiert",
      formatOptions: { dateStyle: "short", timeStyle: "short", forceLocale: true },
    });

    expect(result).not.toBeNull();
    expect(result?.datetime).toBe("2026-03-19T09-48-47-332Z");
  });

  test("returns null when the generated page has no snapshot timestamp", () => {
    expect(resolveSnapshotLastModified("en-US", {}, { text: "Last updated" })).toBeNull();
  });

  test("falls back to a locale-aware label when theme lastUpdated config is missing", () => {
    expect(resolveLastUpdatedConfig("de-DE", undefined)).toEqual({
      text: "Zuletzt aktualisiert",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "short",
        forceLocale: true,
      },
    });

    expect(resolveLastUpdatedConfig("ja-JP", true)).toEqual({
      text: "最終更新",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "short",
        forceLocale: true,
      },
    });
  });
});
