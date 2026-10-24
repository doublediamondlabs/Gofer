# Go’fer: three improvements, three checkpoints

Order agreed October 24, 2026. Each release is cumulative. Keep this file with
source updates and use it as the handoff between sessions.

## 1. Fridge calendar — v0.6.4 layout accepted

- [x] Dedicated landscape layout with readable workout names and targets.
- [x] Scheduled weekly mileage, ranges, partial-week labels and missing-mileage notes.
- [x] Completion boxes, saved Completed/Skipped state, and handwriting space.
- [x] Local print date/time/time zone plus selected date range on each calendar sheet.
- [x] Exact date filtering; no unexpected workouts from boundary months.
- [x] Optional full instructions on separate pages; busy calendar continuation pages.
- [x] Automated checks and rendered PDF review, including a six-row month and two-workout days.
- [ ] Bobby/Jessica: save a PDF in the Windows desktop app and print at actual size.
- [x] User reviewed the layout and approved readability (October 24, 2026).

Examples in print-examples use fictional records, not a prescribed training plan.
Calendar totals are scheduled distance (including skipped sessions), not actual miles.
Monthly boundary rows total only the days shown in that month and selected range.
Unmeasured/time-only sessions do not invent a mileage value. Busy months may use
multiple sheets. Long instructions belong in the optional instructions section.
No training records are rewritten by printing.

## 2. Explain generated plans — v0.6.5 installed by user

- [x] Requested versus generated peak weekly mileage and long-run targets.
- [x] Longest-run dates, back-to-back weekends, climbing emphasis and taper.
- [x] Concrete reasons for every unmet/reduced target.
- [x] Verify summary against generated workouts: Red Cedar, shorter race, Backyard.
- [x] User confirmed the update and authorized the next checkpoint.

## 3. Updates and recovery — v0.6.6 ready for Windows check

- [x] App version, records location, last successful backup and last successful sync.
- [x] Distinguish exported/downloaded backups from automatic recovery copies.
- [x] Successful operations advance timestamps; canceled/failed operations do not.
- [x] Straightforward backup/recovery actions.
- [ ] Native Windows Save dialog and Open Folder user check.

## Deferred

Windows installer/upgrades/taskbar identity: separate project.
Repeat-import recipe replacement: separate companion-app improvement.

## Validation history

v0.6.4: 47 Node tests passed; browser-triggered monthly and fortnight PDFs rendered
and reviewed. Busy August example uses two pages, fortnight example uses one.
Instruction appendix checked separately. Actual Windows printer/desktop PDF paths
remain a user check. Source baseline: GitHub commit b6c0eea928648639272c8938947522715bee136a.


v0.6.5: 52 tests passed. Red Cedar 70 mi peak / 26–28–30 mi dates verified,
gradual shortfall bounds explained, marathon taper and race exclusion checked,
Backyard whole-yard and timing distinctions preserved. Browser builder checks
passed for rejected progression, preview, Adjust settings, and shorter-race reset.
No training-engine change; existing saved plans are not rewritten.


v0.6.6: 59 automated tests passed, including verified exports, failed writes,
protected live workspace path, browser preparation, restore metadata and sync
status. Browser UI verified save/reload and simulated desktop cancel/save at laptop
size. Native Windows Save dialog and Open Folder require user check.
