# Lib Clarity Refactor Design

**Goal:** Make `src/lib` easier to understand by reducing redundant utility patterns, clarifying export names, and tightening module ownership without changing runtime behavior.

## Current Shape

The `src/lib` tree currently works, but the responsibilities are blurred:
- locale types are defined in more than one place
- snapshot URL and JSON loading logic is duplicated
- some exports are generic enough that their ownership is unclear
- several modules expose raw data structures and helpers with overlapping naming

There is also an existing uncommitted edit in `src/lib/workoutSidebarI18n.ts`, so the refactor must preserve that work.

## Chosen Approach

Use a focused readability refactor rather than a structural reorganization.

This keeps the current file layout, but improves clarity through:
- shared type aliases for workout locales
- a single small snapshot-fetch helper layer reused by `workoutsApi.ts` and `workoutLocaleMaps.ts`
- narrower, more descriptive names for page-copy and i18n exports
- small internal helper extraction in catalog/i18n modules where the current code repeats intent

## Module Boundaries

`workoutI18nUtils.ts`
- Keep as the pure normalization and lookup module.
- Continue owning key normalization, label trimming, and localized-map lookup helpers.

`workoutLocaleMaps.ts`
- Become the obvious in-memory storage layer for title/category locale maps.
- Reuse shared snapshot asset helpers instead of maintaining its own fetch/JSON utilities.

`workoutsApi.ts`
- Keep ownership of manifest and detail snapshot loading.
- Reuse the same shared snapshot asset helpers used by locale map loading.

`workoutPageLocale.ts`
- Own page copy and weekday labels only.
- Rename broad exports like `getCopy` to a more explicit page-copy name.

`workoutSidebarI18n.ts`
- Keep ownership of sidebar/category/title localization behavior.
- Preserve the user's uncommitted title-phrase edits.

## Naming Direction

Planned naming changes are intentionally small:
- `pageLocaleCopy` -> `workoutPageCopyByLocale`
- `getCopy()` -> `getWorkoutPageCopy()`
- serialized i18n mapping export gets a clearer name that signals it is an exported snapshot-style payload rather than a general runtime helper

Backward compatibility wrappers may be kept temporarily where tests or downstream code still rely on older names, but the primary call sites in this repo should move to the clearer exports.

## Testing

The refactor should be validated with targeted tests around:
- snapshot asset loading helpers
- page-copy export naming behavior
- catalog normalization behavior
- existing i18n and rendering tests

The objective is cleanup with stable behavior, not feature changes.
