# Go’fer change log

## Not yet released

Latest published release: v0.6.6 (pre-release; confirmed by Bobby).
Current development package: v0.8.0.
Recommendation: **Release candidate after local review.** This bundles the food collections and Go’fer recipe exchange. Try a recipe transfer between your two Windows installs before publishing v0.8.0. No urgent release is required.

### v0.8.0 — Share recipes and convert jug volumes
- Volume converter supports mL, US fluid ounces and US gallons; quick picks include ½-, 1-, and 2-gallon jugs plus the 300 mL hand bottle.
- Share selected recipes, foods and bottle presets in a dedicated JSON file; dependencies come along automatically.
- Import review compares incoming and local definitions. Reuse identical items, keep yours, add a copy, or explicitly update.
- Final preview shows additions, updates and recalculated recipe totals before any write.
- A recovery backup precedes the import. Training records and historical intake snapshots remain untouched.
- Repeat imports reuse matching definitions, including files re-shared by another Go’fer.
- Both sender and recipient need v0.8.0 or newer for this workflow. No 2 Live Crew update is needed.

### v0.7.0 — Organize the snack department
- Separate Foods & ingredients, My bottles, and Saved recipes collections.
- Search, favorites, compact expandable rows, and 12-item pages.
- Archive/restore removes clutter while preserving intake snapshots and existing recipe references.
- Reusable bottle presets with capacity in mL and independent finished drink volume.
- Existing ingredient recipes classify automatically; manual mixes can be categorized in Edit.
- Ingredient servings calculate nutrition; bottle presets never dilute or scale nutrients automatically.
- Active foods/recipes export to 2 Live Crew; archived items and bottle presets do not.
- Bottle presets are hydration gear records, so they participate in backup/sync without a new workspace schema.

### v0.6.8 — Copy saved foods and mixes
- Copy opens a prefilled draft with “(copy)” in its name. Nothing is saved until Save is clicked.
- Original food, recipe, and prior intake records remain unchanged.
- Both manually entered foods/mixes and ingredient-based bottle recipes can be copied.
- Review nutrition manually for manually entered foods; ingredient-based recipe totals recalculate from servings.

### v0.6.7 — Clarify the running wheel
- Shorter “Try another running workout” button.
- Non-running sessions explain the wheel’s scope; walk/hike sessions excluded.

## v0.6.6 — Published pre-release
- Improved fridge calendars, generated-plan explanations, and backup/recovery status.
- Corrected the sidebar version label.

## When publishing
Move the accumulated unreleased entries under the published version and date. Clear the pending list, update the latest published version, and keep the app version, tag, and ZIP name aligned. Review after a meaningful feature or workflow improvement, several small changes, or about two weeks of accumulated work. A review is not an obligation to release.
