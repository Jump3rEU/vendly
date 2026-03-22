@echo off
echo ========================================
echo VENDLY - Production build a start
echo ========================================
echo.

REM Kontrola node_modules
if not exist "node_modules" (
    echo Instaluji zavislosti...
    call npm install
    if errorlevel 1 (
        echo CHYBA: Instalace selhala!
        pause
        exit /b 1
    )
)

REM Kontrola a spusteni Docker services
echo Kontroluji Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker neni nainstalovan!
    echo Stahnete ho z: https://docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo Spoustim databaze (PostgreSQL + Redis)...
docker-compose up -d postgres redis
if errorlevel 1 (
    echo CHYBA: Docker-compose selhal!
    pause
    exit /b 1
)

REM Pockej na databazi
echo Cekam na pripravenost databaze...
timeout /t 3 /nobreak >nul

REM Sync Prisma schema
echo Synchronizuji databazi...
call npx prisma db push --accept-data-loss >nul 2>&1

echo Building production version...
call npm run build
if errorlevel 1 (
    echo CHYBA: Build selhal!
    pause
    exit /b 1
)

echo.
echo Spoustim production server...
echo Otevrete: http://localhost:3000
echo.

npm run start
