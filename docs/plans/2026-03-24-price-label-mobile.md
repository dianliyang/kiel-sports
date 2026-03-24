# Mobile Price Label Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent long localized price labels from overlapping values on small screens.

**Architecture:** Keep localized price labels unchanged and solve the overlap in the shared workout stylesheet. Add a regression test that inspects the CSS for the mobile breakpoint rules that make price labels wrap and stack cleanly.

**Tech Stack:** VitePress, TypeScript, Vitest, CSS

---

### Task 1: Add CSS regression coverage

**Files:**
- Create: `src/__tests__/workout-price-layout.test.ts`
- Test: `src/__tests__/workout-price-layout.test.ts`

**Step 1: Write the failing test**

```ts
test("uses a single-column price grid and wrapping labels on small screens", () => {
  // Assert the mobile media block contains the one-column price grid rule.
  // Assert the price label rule does not force nowrap and instead allows wrapping.
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/workout-price-layout.test.ts`
Expected: FAIL because the stylesheet still uses a two-column mobile grid and `white-space: nowrap`.

### Task 2: Implement the minimal CSS fix

**Files:**
- Modify: `docs/.vitepress/theme/workouts.css`

**Step 1: Write minimal implementation**

```css
.workout-price-label {
  white-space: normal;
  overflow-wrap: anywhere;
}

@media (max-width: 640px) {
  .workout-price-panel,
  .workout-schedule-entry-price {
    grid-template-columns: 1fr;
  }
}
```

**Step 2: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/workout-price-layout.test.ts`
Expected: PASS

**Step 3: Run adjacent verification**

Run: `npm test -- --run src/__tests__/workout-page-renderer.test.ts`
Expected: PASS
