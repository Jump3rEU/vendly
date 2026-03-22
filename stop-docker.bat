@echo off
echo ========================================
echo VENDLY - Zastaveni Docker sluzeb
echo ========================================
echo.

echo Zastavuji PostgreSQL a Redis...
docker-compose down

echo.
echo Sluzby zastaveny.
echo.
echo Pro smazani dat pouzijte: docker-compose down -v
echo.
pause
