#!/bin/bash

# Script de despliegue manual para GYMETRA
# Este script puede ser usado para desplegar manualmente la aplicación

set -e

PROJECT_NAME="gymetra"
BACKEND_PORT="8080"
FRONTEND_PORT="8100"
COMPOSE_FILE="docker-compose.yml"

echo "🚀 Iniciando despliegue manual de GYMETRA..."
echo "=================================="

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponibles:"
    echo "  deploy    - Despliega la aplicación completa"
    echo "  stop      - Detiene todos los servicios"
    echo "  restart   - Reinicia todos los servicios"
    echo "  logs      - Muestra los logs de los servicios"
    echo "  status    - Muestra el estado de los contenedores"
    echo "  clean     - Limpia contenedores e imágenes no utilizadas"
    echo "  help      - Muestra esta ayuda"
    echo ""
}

# Función para verificar prerequisitos
check_prerequisites() {
    echo "🔍 Verificando prerequisitos..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker no está instalado"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose no está instalado"
        exit 1
    fi
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        echo "❌ No se encontró el archivo $COMPOSE_FILE"
        exit 1
    fi
    
    echo "✅ Prerequisitos verificados"
}

# Función para desplegar
deploy() {
    echo "🏗️ Construyendo y desplegando servicios..."
    
    # Detener servicios existentes
    docker-compose -f $COMPOSE_FILE down --remove-orphans
    
    # Construir y desplegar
    docker-compose -f $COMPOSE_FILE up -d --build
    
    echo "⏳ Esperando que los servicios estén listos..."
    sleep 30
    
    # Verificar estado
    check_health
}

# Función para verificar salud de servicios
check_health() {
    echo "🏥 Verificando estado de salud..."
    
    # Verificar backend
    if curl -f http://localhost:$BACKEND_PORT/actuator/health > /dev/null 2>&1; then
        echo "✅ Backend (puerto $BACKEND_PORT) está saludable"
    else
        echo "⚠️ Backend (puerto $BACKEND_PORT) no responde"
    fi
    
    # Verificar frontend
    if curl -f http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
        echo "✅ Frontend (puerto $FRONTEND_PORT) está saludable"
    else
        echo "⚠️ Frontend (puerto $FRONTEND_PORT) no responde"
    fi
}

# Función para detener servicios
stop() {
    echo "🛑 Deteniendo servicios..."
    docker-compose -f $COMPOSE_FILE down
    echo "✅ Servicios detenidos"
}

# Función para reiniciar servicios
restart() {
    echo "🔄 Reiniciando servicios..."
    docker-compose -f $COMPOSE_FILE restart
    sleep 10
    check_health
}

# Función para mostrar logs
show_logs() {
    echo "📋 Mostrando logs de los servicios..."
    docker-compose -f $COMPOSE_FILE logs --tail=50 -f
}

# Función para mostrar estado
show_status() {
    echo "📊 Estado actual de los servicios:"
    echo "================================="
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    echo "🌐 URLs de acceso:"
    echo "Backend:  http://localhost:$BACKEND_PORT"
    echo "Frontend: http://localhost:$FRONTEND_PORT"
}

# Función para limpiar
clean() {
    echo "🧹 Limpiando contenedores e imágenes no utilizadas..."
    docker-compose -f $COMPOSE_FILE down --volumes --remove-orphans
    docker system prune -f
    docker volume prune -f
    echo "✅ Limpieza completada"
}

# Procesamiento de argumentos
case "${1:-deploy}" in
    deploy)
        check_prerequisites
        deploy
        show_status
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ Comando desconocido: $1"
        show_help
        exit 1
        ;;
esac

echo "✅ Operación completada"