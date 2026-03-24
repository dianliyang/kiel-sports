import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");

describe("home page CTA links", () => {
  test("points the English workouts button to the English workouts index", () => {
    const homePage = readFileSync(path.join(repoRoot, "docs", "index.md"), "utf8");

    expect(homePage).toContain("text: Browse English Workouts");
    expect(homePage).toContain("link: /en/workouts/");
  });
});
