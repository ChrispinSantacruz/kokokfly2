@echo off
echo.
echo ================================
echo   KOKOK THE ROACH - RED LOCAL
echo ================================
echo.
echo Iniciando servidor para red local...
echo.

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    echo.
)

REM Mostrar IP local
echo Encontrando IP local...
node find-ip.js
echo.

REM Iniciar servidor
echo Iniciando servidor...
echo.
npm start

pause 