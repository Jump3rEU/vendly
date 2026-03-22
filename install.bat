@echo off
echo ========================================
echo VENDLY - Quick Install Script
echo ========================================
echo.

echo Tento skript nainstaluje vsechny zavislosti pro Vendly.
echo.
echo Pozadavky:
echo   - Node.js 18+ (https://nodejs.org/)
echo   - Docker Desktop (https://docker.com/products/docker-desktop/)
echo.
pause

echo.
echo [1/4] Instaluji Node.js zavislosti...
echo.

call npm install

if errorlevel 1 (
    echo.
    echo ========================================
    echo CHYBA: Instalace selhala!
    echo ========================================
    echo.
    echo Zkontrolujte, zda mate nainstalovan Node.js:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo.
echo [2/4] Kontroluji Docker...
echo.

docker --version >nul 2>&1
if errorlevel 1 (
    echo VAROVANI: Docker neni nainstalovan!
    echo Stahnete ho z: https://docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo Docker nalezen.
echo.
echo [3/4] Spoustim Docker kontejnery (PostgreSQL + Redis)...
echo.

docker-compose up -d postgres redis

if errorlevel 1 (
    echo CHYBA: Docker-compose selhal!
    echo Ujistete se, ze Docker Desktop bezi.
    pause
    exit /b 1
)

echo Cekam na pripravenost databaze...
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Synchronizuji databazove schema...
echo.

call npx prisma db push --accept-data-loss

echo.
echo ========================================
echo Instalace dokoncena!
echo ========================================
echo.
echo Sluzby:
echo   - PostgreSQL: localhost:5432
echo   - Redis: localhost:6379
echo.
echo Pro spusteni pouzijte: start-vendly.bat
echo Pro zastaveni databazi: docker-compose down
echo.
pause
