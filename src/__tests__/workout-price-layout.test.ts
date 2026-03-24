import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const stylesheetPath = path.join(
  repoRoot,
  "docs",
  ".vitepress",
  "theme",
  "workouts.css",
);

describe("workout price layout styles", () => {
  test("uses a wrapping flex layout for content-sized price items", () => {
    const stylesheet = readFileSync(stylesheetPath, "utf8");

    expect(stylesheet).toMatch(
      /\.workout-price-panel,\s*\.workout-schedule-entry-price \{[\s\S]*?display: flex;[\s\S]*?flex-wrap: wrap;[\s\S]*?gap: 0\.75rem;[\s\S]*?\}/,
    );
    expect(stylesheet).toMatch(
      /\.workout-price-item \{[\s\S]*?flex: 1 1 10rem;[\s\S]*?min-width: fit-content;[\s\S]*?\}/,
    );
  });
});
