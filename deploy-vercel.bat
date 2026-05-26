@echo off
chcp 65001 >nul
echo ============================================
echo  Имоти Надежда — Deploy на Vercel
echo ============================================
echo.
echo 1) Build (проверка):
call npm run build
if errorlevel 1 exit /b 1
echo.
echo 2) Deploy (трябва Vercel акаунт — отвори браузъра):
call npx vercel deploy --prod
echo.
echo Готово! Провери Environment Variables в Vercel (POSTGRES_URL + Supabase keys).
pause
