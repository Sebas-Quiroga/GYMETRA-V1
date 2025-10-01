#!/bin/bash

# Script para ejecutar GYMETRA en Docker
set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funciones de utilidad
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para mostrar ayuda
show_help() {
    echo "GYMETRA Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start [env]     Start all services (env: dev, staging, prod)"
    echo "  stop            Stop all services"
    echo "  restart [env]   Restart all services"
    echo "  build           Build all Docker images"
    echo "  logs [service]  Show logs for all services or specific service"
    echo "  status          Show status of all services"
    echo "  clean           Clean up containers, networks, and volumes"
    echo "  db-reset        Reset database (development only)"
    echo "  health          Check health of all services"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start dev          # Start in development mode"
    echo "  $0 start staging      # Start in staging mode"
    echo "  $0 build              # Build all images"
    echo "  $0 logs gymetra-login # Show logs for login service"
}

# Verificar que Docker está ejecutándose
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Verificar que Docker Compose está disponible
check_docker_compose() {
    if ! command -v docker-compose >/dev/null 2>&1; then
        log_error "docker-compose is not installed or not in PATH"
        exit 1
    fi
}

# Función para iniciar servicios
start_services() {
    local env=${1:-dev}
    log_info "Starting GYMETRA services in $env mode..."
    
    case $env in
        dev)
            docker-compose -f docker-compose.dev.yml up -d
            ;;
        staging)
            docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
            ;;
        prod)
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
            ;;
        *)
            docker-compose up -d
            ;;
    esac
    
    log_info "Services started successfully!"
    log_info "Frontend: http://localhost"
    log_info "Login API: http://localhost:8080"
    log_info "Core API: http://localhost:8081"
    log_info "Membership API: http://localhost:8082"
    
    if [ "$env" == "dev" ]; then
        log_info "Adminer (DB Manager): http://localhost:8080"
    fi
}

# Función para detener servicios
stop_services() {
    log_info "Stopping GYMETRA services..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    log_info "Services stopped successfully!"
}

# Función para reiniciar servicios
restart_services() {
    local env=${1:-dev}
    log_info "Restarting GYMETRA services..."
    stop_services
    start_services $env
}

# Función para construir imágenes
build_images() {
    log_info "Building GYMETRA Docker images..."
    docker-compose build --no-cache
    log_info "Images built successfully!"
}

# Función para mostrar logs
show_logs() {
    local service=$1
    if [ -z "$service" ]; then
        log_info "Showing logs for all services..."
        docker-compose logs -f
    else
        log_info "Showing logs for $service..."
        docker-compose logs -f $service
    fi
}

# Función para mostrar estado
show_status() {
    log_info "GYMETRA Services Status:"
    docker-compose ps
    echo ""
    log_info "Docker Images:"
    docker images | grep gymetra
}

# Función de limpieza
clean_up() {
    log_warn "This will remove all GYMETRA containers, networks, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log_info "Cleaning up GYMETRA resources..."
        docker-compose down -v --remove-orphans
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans 2>/dev/null || true
        
        # Limpiar imágenes
        docker images | grep gymetra | awk '{print $3}' | xargs docker rmi -f 2>/dev/null || true
        
        # Limpiar volúmenes huérfanos
        docker volume prune -f
        
        log_info "Cleanup completed!"
    else
        log_info "Cleanup cancelled."
    fi
}

# Función para resetear base de datos
reset_database() {
    log_warn "This will reset the database. All data will be lost. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log_info "Resetting database..."
        docker-compose stop postgres || true
        docker-compose rm -f postgres || true
        docker volume rm gymetra-v1_postgres_data 2>/dev/null || true
        docker-compose up -d postgres
        log_info "Database reset completed!"
    else
        log_info "Database reset cancelled."
    fi
}

# Función para verificar salud de servicios
check_health() {
    log_info "Checking health of GYMETRA services..."
    
    services=("http://localhost:8080/actuator/health" "http://localhost:8081/actuator/health" "http://localhost:8082/actuator/health" "http://localhost/health")
    service_names=("Login Service" "Core Service" "Membership Service" "Frontend")
    
    for i in "${!services[@]}"; do
        if curl -f "${services[$i]}" >/dev/null 2>&1; then
            log_info "${service_names[$i]}: ✅ Healthy"
        else
            log_error "${service_names[$i]}: ❌ Unhealthy"
        fi
    done
}

# Main script
main() {
    check_docker
    check_docker_compose
    
    case $1 in
        start)
            start_services $2
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services $2
            ;;
        build)
            build_images
            ;;
        logs)
            show_logs $2
            ;;
        status)
            show_status
            ;;
        clean)
            clean_up
            ;;
        db-reset)
            reset_database
            ;;
        health)
            check_health
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@"
