# Wikipedia API Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Load category Wikipedia URLs from the existing workout snapshot API instead of hardcoded source data.

**Architecture:** Extend the workouts manifest with a `wikipediaLocaleKey`, load that asset through the existing snapshot loader path, and store it in a resettable in-memory Wikipedia map that preserves current locale fallback behavior.

**Tech Stack:** TypeScript, Vitest, VitePress

---

### Task 1: Add failing tests for snapshot-loaded Wikipedia maps

**Files:**
- Modify: `src/__tests__/workouts-api-build.test.ts`
- Modify: `src/__tests__/workout-category-wikipedia-map.test.ts`
- Modify: `src/__tests__/workout-page-renderer.test.ts`
- Test: `src/__tests__/workouts-api-build.test.ts`

**Step 1: Write the failing test**

Add tests that expect:
- the manifest loader to fetch a `wikipediaLocaleKey` asset
- the Wikipedia map store to be populated from snapshot data
- renderer tests to seed the map through the store rather than relying on hardcoded entries

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/workouts-api-build.test.ts src/__tests__/workout-category-wikipedia-map.test.ts src/__tests__/workout-page-renderer.test.ts`
Expected: FAIL because the Wikipedia map is still hardcoded and the manifest does not load a Wikipedia asset.

**Step 3: Write minimal implementation**

Create/set/reset the Wikipedia map store and load it from the snapshot manifest.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/workouts-api-build.test.ts src/__tests__/workout-category-wikipedia-map.test.ts src/__tests__/workout-page-renderer.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/__tests__/workouts-api-build.test.ts src/__tests__/workout-category-wikipedia-map.test.ts src/__tests__/workout-page-renderer.test.ts src/lib/workoutCategoryWikipediaMap.ts src/lib/workoutsApi.ts
git commit -m "refactor: load wikipedia links from workout snapshot"
```

### Task 2: Run regression verification

**Files:**
- Test: `src/__tests__/workouts-api-build.test.ts`
- Test: `src/__tests__/workout-category-wikipedia-map.test.ts`
- Test: `src/__tests__/workout-page-renderer.test.ts`
- Test: `src/__tests__/workout-pages-generated.test.ts`

**Step 1: Run targeted regression tests**

Run: `npm test -- src/__tests__/workouts-api-build.test.ts src/__tests__/workout-category-wikipedia-map.test.ts src/__tests__/workout-page-renderer.test.ts src/__tests__/workout-pages-generated.test.ts`
Expected: PASS

**Step 2: Run full test suite**

Run: `npm test -- --run`
Expected: PASS

**Step 3: Commit**

```bash
git add src docs/plans
git commit -m "test: verify wikipedia api migration"
```
