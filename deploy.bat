@echo off
REM Script de despliegue para GYMETRA en Windows

setlocal EnableDelayedExpansion

set PROJECT_NAME=gymetra
set BACKEND_PORT=8080
set FRONTEND_PORT=8100
set COMPOSE_FILE=docker-compose.yml

echo 🚀 Iniciando despliegue de GYMETRA...
echo ==================================

REM Verificar si Docker está instalado
docker --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ Docker no está instalado
    exit /b 1
)

docker-compose --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ Docker Compose no está instalado
    exit /b 1
)

if not exist %COMPOSE_FILE% (
    echo ❌ No se encontró el archivo %COMPOSE_FILE%
    exit /b 1
)

echo ✅ Prerequisitos verificados

REM Procesamiento de argumentos
if "%1"=="" goto deploy
if "%1"=="deploy" goto deploy
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="logs" goto logs
if "%1"=="status" goto status
if "%1"=="clean" goto clean
if "%1"=="help" goto help
if "%1"=="--help" goto help
if "%1"=="-h" goto help

echo ❌ Comando desconocido: %1
goto help

:deploy
echo 🏗️ Construyendo y desplegando servicios...
docker-compose -f %COMPOSE_FILE% down --remove-orphans
docker-compose -f %COMPOSE_FILE% up -d --build

echo ⏳ Esperando que los servicios estén listos...
timeout /t 30 /nobreak >nul

echo 🏥 Verificando estado de salud...
curl -f http://localhost:%BACKEND_PORT%/actuator/health >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ Backend (puerto %BACKEND_PORT%) está saludable
) else (
    echo ⚠️ Backend (puerto %BACKEND_PORT%) no responde
)

curl -f http://localhost:%FRONTEND_PORT% >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ Frontend (puerto %FRONTEND_PORT%) está saludable
) else (
    echo ⚠️ Frontend (puerto %FRONTEND_PORT%) no responde
)

goto status

:stop
echo 🛑 Deteniendo servicios...
docker-compose -f %COMPOSE_FILE% down
echo ✅ Servicios detenidos
goto end

:restart
echo 🔄 Reiniciando servicios...
docker-compose -f %COMPOSE_FILE% restart
timeout /t 10 /nobreak >nul
echo ✅ Servicios reiniciados
goto end

:logs
echo 📋 Mostrando logs de los servicios...
docker-compose -f %COMPOSE_FILE% logs --tail=50 -f
goto end

:status
echo 📊 Estado actual de los servicios:
echo =================================
docker-compose -f %COMPOSE_FILE% ps
echo.
echo 🌐 URLs de acceso:
echo Backend:  http://localhost:%BACKEND_PORT%
echo Frontend: http://localhost:%FRONTEND_PORT%
goto end

:clean
echo 🧹 Limpiando contenedores e imágenes no utilizadas...
docker-compose -f %COMPOSE_FILE% down --volumes --remove-orphans
docker system prune -f
docker volume prune -f
echo ✅ Limpieza completada
goto end

:help
echo Uso: %0 [COMANDO]
echo.
echo Comandos disponibles:
echo   deploy    - Despliega la aplicación completa
echo   stop      - Detiene todos los servicios
echo   restart   - Reinicia todos los servicios
echo   logs      - Muestra los logs de los servicios
echo   status    - Muestra el estado de los contenedores
echo   clean     - Limpia contenedores e imágenes no utilizadas
echo   help      - Muestra esta ayuda
echo.
goto end

:end
echo ✅ Operación completada
pause