$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop "Go'fer.lnk"
if (Test-Path $shortcutPath) {
  Write-Host "A Go'fer shortcut already exists. Rename or remove it first if you want a replacement."
  exit 1
}
$shell = New-Object -ComObject WScript.Shell
$link = $shell.CreateShortcut($shortcutPath)
$link.TargetPath = Join-Path $root 'Start-Gofer.cmd'
$link.WorkingDirectory = $root
$link.IconLocation = (Join-Path $root 'assets\gofer-shoulder.ico')
$link.Description = "Go'fer - Double Diamond Labs training desk"
$link.Save()
Write-Host "Go'fer shortcut created on your desktop."
