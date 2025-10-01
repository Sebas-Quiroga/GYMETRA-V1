@echo off
REM Script de PowerShell para Windows para ejecutar GYMETRA en Docker

setlocal enabledelayedexpansion

REM Colores para el output (usando PowerShell)
set "GREEN=[32m"
set "RED=[31m"
set "YELLOW=[33m"
set "NC=[0m"

REM Función para mostrar ayuda
if "%1"=="help" goto :show_help
if "%1"=="--help" goto :show_help
if "%1"=="-h" goto :show_help
if "%1"=="" goto :show_help

REM Verificar que Docker está ejecutándose
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running. Please start Docker first.
    exit /b 1
)

REM Verificar que docker-compose está disponible
where docker-compose >nul 2>&1
if errorlevel 1 (
    echo ERROR: docker-compose is not installed or not in PATH
    exit /b 1
)

REM Procesar comandos
if "%1"=="start" goto :start_services
if "%1"=="stop" goto :stop_services
if "%1"=="restart" goto :restart_services
if "%1"=="build" goto :build_images
if "%1"=="logs" goto :show_logs
if "%1"=="status" goto :show_status
if "%1"=="clean" goto :clean_up
if "%1"=="db-reset" goto :reset_database
if "%1"=="health" goto :check_health

echo ERROR: Unknown command: %1
goto :show_help

:show_help
echo GYMETRA Docker Management Script
echo.
echo Usage: %0 [COMMAND] [OPTIONS]
echo.
echo Commands:
echo   start [env]     Start all services (env: dev, staging, prod)
echo   stop            Stop all services
echo   restart [env]   Restart all services
echo   build           Build all Docker images
echo   logs [service]  Show logs for all services or specific service
echo   status          Show status of all services
echo   clean           Clean up containers, networks, and volumes
echo   db-reset        Reset database (development only)
echo   health          Check health of all services
echo   help            Show this help message
echo.
echo Examples:
echo   %0 start dev          # Start in development mode
echo   %0 start staging      # Start in staging mode
echo   %0 build              # Build all images
echo   %0 logs gymetra-login # Show logs for login service
goto :eof

:start_services
set "env=%2"
if "%env%"=="" set "env=dev"

echo INFO: Starting GYMETRA services in %env% mode...

if "%env%"=="dev" (
    docker-compose -f docker-compose.dev.yml up -d
) else if "%env%"=="staging" (
    docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
) else if "%env%"=="prod" (
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
) else (
    docker-compose up -d
)

if errorlevel 1 (
    echo ERROR: Failed to start services
    exit /b 1
)

echo INFO: Services started successfully!
echo INFO: Frontend: http://localhost
echo INFO: Login API: http://localhost:8080
echo INFO: Core API: http://localhost:8081
echo INFO: Membership API: http://localhost:8082

if "%env%"=="dev" (
    echo INFO: Adminer (DB Manager): http://localhost:8080
)
goto :eof

:stop_services
echo INFO: Stopping GYMETRA services...
docker-compose down
docker-compose -f docker-compose.dev.yml down 2>nul
echo INFO: Services stopped successfully!
goto :eof

:restart_services
echo INFO: Restarting GYMETRA services...
call :stop_services
call :start_services %2
goto :eof

:build_images
echo INFO: Building GYMETRA Docker images...
docker-compose build --no-cache
if errorlevel 1 (
    echo ERROR: Failed to build images
    exit /b 1
)
echo INFO: Images built successfully!
goto :eof

:show_logs
if "%2"=="" (
    echo INFO: Showing logs for all services...
    docker-compose logs -f
) else (
    echo INFO: Showing logs for %2...
    docker-compose logs -f %2
)
goto :eof

:show_status
echo INFO: GYMETRA Services Status:
docker-compose ps
echo.
echo INFO: Docker Images:
docker images | findstr gymetra
goto :eof

:clean_up
set /p "response=This will remove all GYMETRA containers, networks, and volumes. Are you sure? (y/N): "
if /i "%response%"=="y" (
    echo INFO: Cleaning up GYMETRA resources...
    docker-compose down -v --remove-orphans
    docker-compose -f docker-compose.dev.yml down -v --remove-orphans 2>nul
    
    REM Limpiar imágenes
    for /f "tokens=3" %%i in ('docker images ^| findstr gymetra') do docker rmi -f %%i 2>nul
    
    REM Limpiar volúmenes huérfanos
    docker volume prune -f
    
    echo INFO: Cleanup completed!
) else (
    echo INFO: Cleanup cancelled.
)
goto :eof

:reset_database
set /p "response=This will reset the database. All data will be lost. Are you sure? (y/N): "
if /i "%response%"=="y" (
    echo INFO: Resetting database...
    docker-compose stop postgres 2>nul
    docker-compose rm -f postgres 2>nul
    docker volume rm gymetra-v1_postgres_data 2>nul
    docker-compose up -d postgres
    echo INFO: Database reset completed!
) else (
    echo INFO: Database reset cancelled.
)
goto :eof

:check_health
echo INFO: Checking health of GYMETRA services...

curl -f "http://localhost:8080/actuator/health" >nul 2>&1
if errorlevel 1 (
    echo ERROR: Login Service: ❌ Unhealthy
) else (
    echo INFO: Login Service: ✅ Healthy
)

curl -f "http://localhost:8081/actuator/health" >nul 2>&1
if errorlevel 1 (
    echo ERROR: Core Service: ❌ Unhealthy
) else (
    echo INFO: Core Service: ✅ Healthy
)

curl -f "http://localhost:8082/actuator/health" >nul 2>&1
if errorlevel 1 (
    echo ERROR: Membership Service: ❌ Unhealthy
) else (
    echo INFO: Membership Service: ✅ Healthy
)

curl -f "http://localhost/health" >nul 2>&1
if errorlevel 1 (
    echo ERROR: Frontend: ❌ Unhealthy
) else (
    echo INFO: Frontend: ✅ Healthy
)
goto :eof
