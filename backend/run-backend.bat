@echo off
REM Script para ejecutar el backend localmente en Windows

setlocal EnableDelayedExpansion

echo ========================================
echo 🚀 Iniciando Backend GYMETRA Localmente
echo ========================================
echo.

REM Verificar Java
java -version >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ Java no está instalado o no está en el PATH
    echo    Por favor instala Java 17 o superior
    exit /b 1
)

echo ✅ Java encontrado
echo.

REM Cambiar al directorio del backend
cd /d "%~dp0GYMETR-login"

if not exist "pom.xml" (
    echo ❌ No se encontró el archivo pom.xml
    echo    Asegúrate de estar en el directorio correcto
    exit /b 1
)

echo 📦 Compilando proyecto...
call mvnw.cmd clean compile -q
if !errorlevel! neq 0 (
    echo ❌ Error al compilar el proyecto
    exit /b 1
)

echo ✅ Compilación exitosa
echo.
echo 🗄️  IMPORTANTE: Asegúrate de que PostgreSQL esté corriendo en localhost:5000
echo    Puedes iniciarlo con: docker-compose up -d database
echo.
echo 🚀 Iniciando aplicación Spring Boot...
echo.

call mvnw.cmd spring-boot:run





