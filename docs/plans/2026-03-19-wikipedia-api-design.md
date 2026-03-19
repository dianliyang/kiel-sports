# Wikipedia API Design

**Goal:** Move category Wikipedia URLs out of hardcoded source code and load them from the existing workout snapshot API.

## Chosen Approach

Add a new localized category Wikipedia asset to the published workouts manifest and load it alongside the existing title/category/metadata assets.

This keeps Wikipedia links as normalized reference data instead of duplicating them across workout detail records.

## Architecture

- Extend the snapshot manifest with a `wikipediaLocaleKey` field.
- Add an in-memory Wikipedia map store in `src/lib/workoutCategoryWikipediaMap.ts`, matching the current lookup behavior.
- Load the Wikipedia map from the snapshot API during `loadWorkoutDetailCatalogFromSnapshot()`.
- Keep renderer usage simple: page rendering still calls `getCategoryWikipediaUrl(locale, category)`, but the data now comes from the loaded API state instead of a hardcoded map.

## Behavior

- Use the locale-specific Wikipedia URL when present.
- Fall back to the English URL when the requested locale is missing.
- Return `null` when the category has no mapping.

## Migration

- Replace hardcoded static Wikipedia entries with a resettable/settable store.
- Update tests to seed the store directly where appropriate, and verify snapshot loading populates it from the new manifest asset.
