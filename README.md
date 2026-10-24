# Go’fer 🟣

**Plan the adventure. Put it on the fridge. Go earn the snacks.**

A Windows desktop training desk from **Double Diamond Labs**, built by runners
who like long adventures, useful tools, and a little personality.

Go’fer brings race planning, editable training calendars, food and bottle recipes,
gear, and workout notes into one local workspace. From a 5K to a 100-miler—or
another questionable decision at a Backyard Ultra bell—start with a draft and
make it your own.

**v0.6.3 · Desktop preview · Local data · No account required**

!\[Home calendar with fictional demonstration workouts](docs/screenshots/home.png)

## Pick your adventure

* **Your training calendar:** two months by default, plus day, month and three-month views.
* **Race-focused drafts:** distance-based plans, hills and technical trail practice,
varied workouts, chosen peaks, optional back-to-backs and dedicated Backyard rehearsals.
* **A plan you control:** edit workouts, record results, add notes and gear, or
Give it a Spin for a reviewed alternative within an eligible workout category.
* **Race preparation:** review suggestions from a race website, model aid-station
time, and print a vest pace card for one to four equal-distance loops.
* **Food \& fuel:** save labels, review locally read label photos, build drink mixes,
log partial bottles and convert mL to US fl oz.
* **Bring your watch files:** review completed activities exported as FIT or TCX
from Garmin or COROS. No direct watch-account connection.
* **Keep it visible:** landscape PDF calendars, Excel exports and reusable plan files.
* **Make it yours:** Edition \& Tribute artwork, dedication and a gopher with a purple toe.

!\[Food and fuel with fictional saved recipes](docs/screenshots/fuel.png)

## Meet the companion: 2 Live Crew

**Go’fer prepares the runner.** [**2 Live Crew**](https://github.com/doublediamondlabs/2-Live-Crew)
**helps the crew on race day.**

Save foods and bottle recipes once in Go’fer, then carry them to the companion app:

1. In Go’fer, open **Food \& fuel → Send to 2 Live Crew** and export the JSON file.
2. Transfer that file to the phone using USB, email or your preferred file service.
3. In a Crew build that includes the Go’fer importer (v0.3.1 or later), open
**Setup → Defaults → Import from Go’fer**.
4. Select the file and runner, review the foods and recipes, then save.

This is a **one-way file transfer**, not automatic synchronization. Existing
same-name defaults are skipped. Race courses, training calendars, completed
workouts and intake logs are not transferred. Verify serving basis and bottle
capacity when reviewing an imported recipe.

Go’fer tracks calories, carbs, protein, fat, sodium and caffeine. The Crew importer calculates 
calories, carbs, protein, fat, sodium and caffeine and are included in Crew totals (Crew v0.3.2).
The companion importer must be installed/published separately; it is not bundled here.

!\[Companion export review using fictional foods](docs/screenshots/crew-export.png)

## Get started on Windows

1. Download this repository with **Code → Download ZIP**, and extract it fully
to a local folder such as `E:\\\\Gofer`. Do not run it inside the ZIP.
2. Install Node.js **22.12 or newer** with npm if needed.
3. Double-click **Start-Gofer.cmd**. First setup requires internet to install dependencies.
4. Set up your own workspace, then add a race or a workout.
5. Optionally run **Create-Desktop-Shortcut.cmd**.

This is a source distribution, not a standalone installer. Go’fer runs on a
Windows desktop/laptop; 2 Live Crew is the separate phone-friendly companion.
Core planning and logging work offline after setup. Weather and reading new race
websites require internet. GitHub Pages cannot host Go’fer's desktop/server runtime.

## Your app folder and your records are separate

|What|Default location|
|-|-|
|App source and launcher|Your extracted folder, such as `E:\\\\Gofer`|
|Personal workspace and recovery backups|`%LOCALAPPDATA%\\\\DoubleDiamondGofer`|
|Electron window settings|`%APPDATA%\\\\DoubleDiamondGoferDesktop`|
|Optional shared synchronization files|A folder you choose in Settings|

Moving the app folder does **not** move your training records. Each athlete on a
separate Windows account/computer starts with an independent workspace. Copying
source files to another laptop does not copy the first runner's calendar.

Use Settings to download backups. A source repository is **not** a backup of your
personal records. Keep exported backups, photos, watch files, and synchronization
folders outside this repository. See [Moving and sharing](docs/MOVING-AND-SHARING.md).

## What to expect from this preview

Training plans are editable, rule-based drafts, not individualized coaching or an
assessment of fitness. Review load, pacing and recovery before adopting a draft.
Website suggestions and label reading need manual review. Weather is a fetched
snapshot, not continuous monitoring. Existing plans do not automatically change
when race details change. PDF vest cards currently support one to four equal loops,
not Backyard races.

Screenshots show **fictional demonstration data**, not a recommended training plan.
Personal reference schedules are intentionally absent from the public distribution;
reusable Go’fer plan imports are still available. No existing saved workspace is reset.

## Development and checks

```sh
npm ci
npm test
npm run desktop
```

`npm start` provides a browser fallback on `127.0.0.1:43128`.
`GOFER\\\_DATA\\\_DIR` and `GOFER\\\_PORT` can isolate development workspaces.
Local automated checks and Chromium UI checks have been run; native Windows,
Android companion installation and real SMB synchronization need device testing.

## Credits and licensing

Created by **Bobby Greenwell / Double Diamond Labs**. Local label-reader workflow
adapted from 2 Live Crew; its MIT notice remains in `assets/2-Live-Crew-LICENSE.txt`.
Bundled OCR notices remain in `public/ocr`; npm dependencies carry their own licenses.
Gopher artwork was generated for this project; provenance is in `assets/ARTWORK.txt`.

Go’fer is licensed under the MIT License. See LICENSE.txt. Third-party components retain their respective licenses.


## v0.6.4 — Back to the fridge

Print / export now uses a dedicated landscape calendar with weekly scheduled-mile
summaries, completion boxes, handwriting space, and a local print timestamp.
Monthly and two-week views respect the exact selected dates. Busy months continue
onto another sheet instead of shrinking the type. Optional full workout instructions
print separately. Fictional examples are in `docs/print-examples`.

Progress on the three agreed improvements lives in
[the improvement checklist](docs/IMPROVEMENT-CHECKLIST.md): fridge calendar first,
plan explanations second, and updates/recovery third.
