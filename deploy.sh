#!/bin/bash

# Script de deployment para GYMETRA
# Uso: ./deploy.sh [staging|production] [IMAGE_TAG]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parámetros
ENVIRONMENT=${1:-staging}
IMAGE_TAG=${2:-latest}
DEPLOY_DIR="/opt/gymetra"

log_info "Starting deployment to $ENVIRONMENT environment with tag $IMAGE_TAG"

# Validar parámetros
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    log_error "Environment must be 'staging' or 'production'"
    exit 1
fi

# Crear directorio de deployment si no existe
sudo mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# Backup de la configuración actual si existe
if [ -f docker-compose.yml ]; then
    log_info "Creating backup of current deployment..."
    sudo cp docker-compose.yml docker-compose.yml.backup.$(date +%Y%m%d_%H%M%S)
fi

# Verificar que las imágenes existen
log_info "Verifying Docker images..."
DOCKER_REGISTRY=${DOCKER_REGISTRY:-docker.io}
DOCKER_REPO=${DOCKER_REPO:-gymetra}

for service in login core membership frontend; do
    IMAGE="${DOCKER_REGISTRY}/${DOCKER_REPO}/${service}:${IMAGE_TAG}"
    if ! docker manifest inspect $IMAGE > /dev/null 2>&1; then
        log_error "Image not found: $IMAGE"
        exit 1
    fi
    log_info "✓ Image verified: $IMAGE"
done

# Detener servicios actuales
log_info "Stopping current services..."
if [ -f docker-compose.yml ]; then
    sudo docker-compose -f docker-compose.yml -f docker-compose.$ENVIRONMENT.yml down || true
fi

# Limpiar recursos no utilizados
log_info "Cleaning up unused Docker resources..."
sudo docker system prune -f

# Actualizar configuración
log_info "Updating deployment configuration..."
export IMAGE_TAG=$IMAGE_TAG
export DOCKER_REGISTRY=$DOCKER_REGISTRY
export DOCKER_REPO=$DOCKER_REPO

# Cargar variables de entorno específicas del ambiente
if [ -f .env.$ENVIRONMENT ]; then
    source .env.$ENVIRONMENT
    log_info "Loaded environment variables for $ENVIRONMENT"
else
    log_warn "Environment file .env.$ENVIRONMENT not found"
fi

# Pull de las nuevas imágenes
log_info "Pulling latest images..."
sudo docker-compose -f docker-compose.yml -f docker-compose.$ENVIRONMENT.yml pull

# Iniciar servicios
log_info "Starting services..."
sudo docker-compose -f docker-compose.yml -f docker-compose.$ENVIRONMENT.yml up -d

# Esperar a que los servicios estén listos
log_info "Waiting for services to be ready..."
sleep 30

# Health check
log_info "Performing health checks..."
MAX_RETRIES=10
RETRY_COUNT=0

check_service() {
    local url=$1
    local name=$2
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -f -s $url > /dev/null; then
            log_info "✓ $name is healthy"
            return 0
        else
            log_warn "⚠ $name not ready yet... (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)"
            RETRY_COUNT=$((RETRY_COUNT + 1))
            sleep 10
        fi
    done
    
    log_error "✗ $name failed health check"
    return 1
}

# Health checks para cada servicio
SERVICES_HEALTHY=true

if ! check_service "http://localhost:8080/actuator/health" "Login Service"; then
    SERVICES_HEALTHY=false
fi

RETRY_COUNT=0
if ! check_service "http://localhost:8081/actuator/health" "Core Service"; then
    SERVICES_HEALTHY=false
fi

RETRY_COUNT=0
if ! check_service "http://localhost:8082/actuator/health" "Membership Service"; then
    SERVICES_HEALTHY=false
fi

RETRY_COUNT=0
if ! check_service "http://localhost/health" "Frontend"; then
    SERVICES_HEALTHY=false
fi

# Resultado final
if [ "$SERVICES_HEALTHY" = true ]; then
    log_info "🎉 Deployment to $ENVIRONMENT completed successfully!"
    log_info "Frontend: http://localhost"
    log_info "APIs: http://localhost:8080, http://localhost:8081, http://localhost:8082"
    
    # Limpiar backups antiguos (mantener solo los últimos 5)
    sudo find $DEPLOY_DIR -name "docker-compose.yml.backup.*" -type f | sort -r | tail -n +6 | xargs -r rm
    
    exit 0
else
    log_error "💥 Deployment failed! Some services are not healthy"
    
    # Mostrar logs para debugging
    log_info "Container status:"
    sudo docker-compose ps
    
    log_info "Recent logs:"
    sudo docker-compose logs --tail=50
    
    exit 1
fi
