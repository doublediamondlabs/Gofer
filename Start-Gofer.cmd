@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto missing
where npm >nul 2>nul
if errorlevel 1 goto missing
node -e "const v=process.versions.node.split('.').map(Number);process.exit(v[0]>22||(v[0]===22&&v[1]>=12)?0:1)"
if errorlevel 1 goto missing
if not exist "node_modules\@garmin\fitsdk\package.json" goto setup
if not exist "node_modules\exceljs\package.json" goto setup
if exist "node_modules\electron\dist\electron.exe" goto launch
:setup
echo Go'fer - first-time setup
echo Downloading the desktop runtime and Excel exporter. Internet is needed now.
call npm ci --include=dev --no-audit --no-fund
if errorlevel 1 goto failed
if exist "node_modules\electron\dist\electron.exe" goto launch
node node_modules\electron\install.js
if errorlevel 1 goto failed
:launch
start "" "node_modules\electron\dist\electron.exe" "%~dp0."
exit /b
:missing
echo Go'fer needs Node.js 22.12 or newer and npm for setup.
echo Install Node.js LTS from https://nodejs.org then reopen this launcher.
pause
exit /b 1
:failed
echo Setup did not finish. Keep this error message for troubleshooting.
pause
exit /b 1
