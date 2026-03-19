# Lib Clarity Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor `src/lib` to remove redundant helper patterns and make export/module intent clearer without changing behavior.

**Architecture:** Keep the existing `src/lib` file layout, but centralize snapshot asset loading, standardize locale typing, and rename ambiguous page/i18n exports. Apply changes test-first and preserve the existing uncommitted edits in `src/lib/workoutSidebarI18n.ts`.

**Tech Stack:** TypeScript, Vitest, VitePress

---

### Task 1: Add failing tests for clearer export names and shared snapshot helpers

**Files:**
- Modify: `src/__tests__/workouts-api-build.test.ts`
- Modify: `src/__tests__/workouts-catalog.test.ts`
- Modify: `src/__tests__/workout-page-renderer.test.ts`
- Test: `src/__tests__/workouts-api-build.test.ts`

**Step 1: Write the failing test**

Add tests that expect:
- shared snapshot asset URL building to stay consistent across API and locale loading paths
- the clearer page-copy export name to exist and return the same values as the old call sites

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/workouts-api-build.test.ts src/__tests__/workout-page-renderer.test.ts`
Expected: FAIL because the new clearer exports/helpers do not exist yet.

**Step 3: Write minimal implementation**

Create the shared helper surface and export aliases required for those tests to pass.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/workouts-api-build.test.ts src/__tests__/workout-page-renderer.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/__tests__/workouts-api-build.test.ts src/__tests__/workout-page-renderer.test.ts src/lib
git commit -m "refactor: clarify lib exports and snapshot helpers"
```

### Task 2: Consolidate snapshot asset loading in `src/lib`

**Files:**
- Create: `src/lib/workoutSnapshotUtils.ts`
- Modify: `src/lib/workoutsApi.ts`
- Modify: `src/lib/workoutLocaleMaps.ts`
- Test: `src/__tests__/workouts-api-build.test.ts`

**Step 1: Write the failing test**

Extend the snapshot-loading test so it proves both locale maps and detail metadata rely on the same URL construction and response validation behavior.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/workouts-api-build.test.ts`
Expected: FAIL because the behavior is still split across modules.

**Step 3: Write minimal implementation**

Move duplicated `readJson` and asset URL creation logic into `src/lib/workoutSnapshotUtils.ts`, then switch `workoutsApi.ts` and `workoutLocaleMaps.ts` to reuse it.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/workouts-api-build.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/workoutSnapshotUtils.ts src/lib/workoutsApi.ts src/lib/workoutLocaleMaps.ts src/__tests__/workouts-api-build.test.ts
git commit -m "refactor: share workout snapshot loading utilities"
```

### Task 3: Clarify locale and page-copy exports

**Files:**
- Modify: `src/lib/workoutPageLocale.ts`
- Modify: `src/lib/workoutI18nMapping.ts`
- Modify: `docs/.vitepress/workouts/workoutPageRenderer.*`
- Test: `src/__tests__/workout-page-renderer.test.ts`

**Step 1: Write the failing test**

Add or update tests to reference the clearer page-copy export name and confirm renderer output remains unchanged.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/workout-page-renderer.test.ts`
Expected: FAIL because the renderer and/or exports still use the old names.

**Step 3: Write minimal implementation**

Rename page-copy exports to clearer names, keep compatibility aliases where useful, and give the serialized i18n mapping export a more explicit name.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/workout-page-renderer.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/workoutPageLocale.ts src/lib/workoutI18nMapping.ts docs/.vitepress/workouts src/__tests__/workout-page-renderer.test.ts
git commit -m "refactor: clarify workout locale and mapping exports"
```

### Task 4: Refine normalization helpers without changing output

**Files:**
- Modify: `src/lib/workoutsCatalog.ts`
- Modify: `src/lib/workoutI18nUtils.ts`
- Modify: `src/lib/workoutCategoryWikipediaMap.ts`
- Test: `src/__tests__/workouts-catalog.test.ts`
- Test: `src/__tests__/workout-category-wikipedia-map.test.ts`

**Step 1: Write the failing test**

Add tests that lock in normalization behavior while allowing internal helper extraction and clearer naming.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/workouts-catalog.test.ts src/__tests__/workout-category-wikipedia-map.test.ts`
Expected: FAIL because the new helper seams are not implemented yet.

**Step 3: Write minimal implementation**

Extract small internal helpers for category/title/schedule normalization, tighten type reuse, and remove redundant inline typing where it obscures intent.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/workouts-catalog.test.ts src/__tests__/workout-category-wikipedia-map.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/workoutsCatalog.ts src/lib/workoutI18nUtils.ts src/lib/workoutCategoryWikipediaMap.ts src/__tests__/workouts-catalog.test.ts src/__tests__/workout-category-wikipedia-map.test.ts
git commit -m "refactor: simplify workout normalization helpers"
```

### Task 5: Run the regression suite for `src/lib`

**Files:**
- Test: `src/__tests__/workouts-api-build.test.ts`
- Test: `src/__tests__/workouts-catalog.test.ts`
- Test: `src/__tests__/workout-page-renderer.test.ts`
- Test: `src/__tests__/workout-title-i18n.test.ts`
- Test: `src/__tests__/workout-date.test.ts`
- Test: `src/__tests__/workout-category-wikipedia-map.test.ts`

**Step 1: Run targeted regression tests**

Run: `npm test -- src/__tests__/workouts-api-build.test.ts src/__tests__/workouts-catalog.test.ts src/__tests__/workout-page-renderer.test.ts src/__tests__/workout-title-i18n.test.ts src/__tests__/workout-date.test.ts src/__tests__/workout-category-wikipedia-map.test.ts`
Expected: PASS

**Step 2: Run the full test suite**

Run: `npm test -- --run`
Expected: PASS

**Step 3: Commit**

```bash
git add src docs/plans
git commit -m "test: verify lib clarity refactor"
```
