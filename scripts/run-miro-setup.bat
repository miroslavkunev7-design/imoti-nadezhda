@echo off
REM Двойно кликване: клонира/обновява imoti-nadezhda в C:\Desktop\Miro и макс Burgas setup
set MIRO_DESKTOP=C:\Desktop\Miro
cd /d "%~dp0.."
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-miro-desktop.ps1"
pause
