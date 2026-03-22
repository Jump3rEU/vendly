@echo off
echo ========================================
echo VENDLY - Spousteni lokalniho serveru
echo ========================================
echo.

REM Kontrola, zda existuje node_modules
if not exist "node_modules" (
    echo Instaluji zavislosti...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo CHYBA: Instalace selhala!
        pause
        exit /b 1
    )
    echo.
    echo Zavislosti nainstalovany.
    echo.
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
    echo Ujistete se, ze Docker Desktop bezi.
    pause
    exit /b 1
)

REM Pockej na databazi
echo Cekam na pripravenost databaze...
timeout /t 3 /nobreak >nul

REM Sync Prisma schema
echo Synchronizuji databazi...
call npx prisma db push --accept-data-loss >nul 2>&1

echo.
echo Spoustim Vendly v development modu...
echo.
echo Otevrete: http://localhost:3000
echo.
echo Pro zastaveni pouzijte CTRL+C
echo ========================================
echo.

npm run dev
