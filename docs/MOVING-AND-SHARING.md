# Move the app. Keep your own miles.

## Move your current copy to E:\Gofer

1. In the existing app, download a workspace backup in Settings. Store it outside the source folder.
2. Quit Go’fer. Copy the app folder to `E:\Gofer` so `Start-Gofer.cmd` is directly inside it.
3. Add this public release's source files there, replacing matching app files. Keep personal exports outside it.
4. Start from `E:\Gofer\Start-Gofer.cmd`. On the same Windows account, the existing workspace is used automatically.
5. Verify your calendar and saved foods. Keep the original C: copy until that check succeeds.
6. Rename/remove the old desktop shortcut, then run `Create-Desktop-Shortcut.cmd` in E:\Gofer. Re-pin the new shortcut if needed.

The runtime and personal data remain separate. The default workspace stays on C:
under your Windows profile even when the app is on E:. This move is not a relocation
of the workspace database. Keep the drive letter stable for shortcuts.

## Use the network share to distribute app copies

Suggested separate folders beneath your chosen share:

- `Gofer-App`: a copy of the public source or release ZIP.
- `Gofer-Sync`: optional app-managed synchronization data, outside the Git repository.
- `Gofer-Backups`: private exported backups, outside the Git repository.

Close the app before replacing its source files. Prefer copying the source package
without `node_modules` or `.git`; each machine installs dependencies on first launch.
Run locally, not directly from the network share. A public source copy has no personal
workspace in it, and copying it does not automatically synchronize records.

## Set up the other athlete on D:\Gofer

Copy the source from the network share to `D:\Gofer` on that laptop, launch
`Start-Gofer.cmd`, and create that athlete's own workspace. Node.js/npm and internet
are required for initial setup. Create a shortcut on that laptop afterward.

Do not restore the first athlete's complete backup into the second athlete's
workspace. To reuse a training plan, export/import a reusable plan and review its
new dates. Each runner manages and prints their own plan.

## Optional synchronization and travel

The app's Sync now copies revision data to your chosen shared folder; it does not
merge two athletes into one calendar. For two computers belonging to the SAME
athlete, restore that athlete's backup onto their second machine to retain workspace
identity, then use the same synchronization folder. Review conflicts when prompted.

Test with an empty share first. Before travel, sync and download a backup while
connected. Work locally while away; sync after reconnecting. Never manually replace
live workspace files while Go’fer is running.
