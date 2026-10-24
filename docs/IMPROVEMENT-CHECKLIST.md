# Go’fer: three improvements, three checkpoints

Order agreed October 24, 2026. Each release is cumulative. Keep this file with
source updates and use it as the handoff between sessions.

## 1. Fridge calendar — v0.6.4 ready for user check

- [x] Dedicated landscape layout with readable workout names and targets.
- [x] Scheduled weekly mileage, ranges, partial-week labels and missing-mileage notes.
- [x] Completion boxes, saved Completed/Skipped state, and handwriting space.
- [x] Local print date/time/time zone plus selected date range on each calendar sheet.
- [x] Exact date filtering; no unexpected workouts from boundary months.
- [x] Optional full instructions on separate pages; busy calendar continuation pages.
- [x] Automated checks and rendered PDF review, including a six-row month and two-workout days.
- [ ] Bobby/Jessica: save a PDF in the Windows desktop app and print at actual size.
- [ ] Confirm names, weekly totals and writing room work on the fridge.

Examples in print-examples use fictional records, not a prescribed training plan.
Calendar totals are scheduled distance (including skipped sessions), not actual miles.
Monthly boundary rows total only the days shown in that month and selected range.
Unmeasured/time-only sessions do not invent a mileage value. Busy months may use
multiple sheets. Long instructions belong in the optional instructions section.
No training records are rewritten by printing.

## 2. Explain generated plans — planned

- [ ] Requested versus generated peak weekly mileage and long-run targets.
- [ ] Longest-run dates, back-to-back weekends, climbing emphasis and taper.
- [ ] Concrete reasons for every unmet/reduced target.
- [ ] Verify summary against generated workouts: Red Cedar, shorter race, Backyard.
- [ ] User review before moving to the next checkpoint.

## 3. Updates and recovery — planned

- [ ] App version, records location, last successful backup and last successful sync.
- [ ] Distinguish exported/downloaded backups from automatic recovery copies.
- [ ] Successful operations advance timestamps; canceled/failed operations do not.
- [ ] Straightforward backup/recovery actions and Windows user check.

## Deferred

Windows installer/upgrades/taskbar identity: separate project.
Repeat-import recipe replacement: separate companion-app improvement.

## Validation history

v0.6.4: 47 Node tests passed; browser-triggered monthly and fortnight PDFs rendered
and reviewed. Busy August example uses two pages, fortnight example uses one.
Instruction appendix checked separately. Actual Windows printer/desktop PDF paths
remain a user check. Source baseline: GitHub commit b6c0eea928648639272c8938947522715bee136a.
