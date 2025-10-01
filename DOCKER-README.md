# GYMETRA - Docker & Jenkins Setup

Este documento describe cómo ejecutar GYMETRA usando Docker y cómo configurar el pipeline de Jenkins.

## 📋 Prerrequisitos

- Docker >= 20.10
- Docker Compose >= 2.0
- Jenkins (para CI/CD)
- Git

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Clonar el repositorio
git clone <repository-url>
cd GYMETRA-V1

# Dar permisos de ejecución al script (Linux/Mac)
chmod +x docker-run.sh

# Iniciar en modo desarrollo
./docker-run.sh start dev
# O en Windows:
docker-run.bat start dev
```

### Producción

```bash
# Construir imágenes
./docker-run.sh build

# Iniciar en modo producción
./docker-run.sh start prod
```

## 🏗️ Arquitectura del Sistema

### Servicios

1. **Frontend** (Puerto 80/443)
   - Aplicación Ionic/Vue.js
   - Nginx como servidor web
   - Proxy reverso para APIs

2. **Login Service** (Puerto 8080)
   - Autenticación y autorización
   - Spring Boot + Spring Security
   - JWT tokens

3. **Core Service** (Puerto 8081)
   - Lógica de negocio principal
   - Spring Boot + JPA

4. **Membership Service** (Puerto 8082)
   - Gestión de membresías
   - Spring Boot + JPA

5. **PostgreSQL** (Puerto 5000)
   - Base de datos principal
   - Inicialización automática

### Red

Todos los servicios se ejecutan en una red Docker personalizada (`gymetra-network`) que permite la comunicación entre contenedores.

## 🛠️ Comandos Disponibles

### Script de Gestión

```bash
# Iniciar servicios
./docker-run.sh start [dev|staging|prod]

# Detener servicios
./docker-run.sh stop

# Reiniciar servicios
./docker-run.sh restart [env]

# Construir imágenes
./docker-run.sh build

# Ver logs
./docker-run.sh logs [service_name]

# Ver estado
./docker-run.sh status

# Verificar salud
./docker-run.sh health

# Limpiar todo
./docker-run.sh clean

# Resetear base de datos
./docker-run.sh db-reset

# Ayuda
./docker-run.sh help
```

### Docker Compose Manual

```bash
# Desarrollo
docker-compose -f docker-compose.dev.yml up -d

# Staging
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d

# Producción
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Detener
docker-compose down

# Ver logs
docker-compose logs -f [service]

# Reconstruir
docker-compose build --no-cache
```

## 🔧 Configuración

### Variables de Entorno

Las principales variables de entorno se configuran en los archivos de docker-compose:

- `SPRING_DATASOURCE_URL`: URL de la base de datos
- `SPRING_DATASOURCE_USERNAME`: Usuario de BD
- `SPRING_DATASOURCE_PASSWORD`: Contraseña de BD
- `SERVER_PORT`: Puerto del servicio
- `SPRING_PROFILES_ACTIVE`: Perfil activo (dev/staging/prod)

### Volúmenes

- `postgres_data`: Datos persistentes de PostgreSQL
- Logs de aplicación se almacenan en volúmenes nombrados

### Redes

- `gymetra-network`: Red bridge personalizada para comunicación interna

## 🔍 Monitoreo y Salud

### Health Checks

Cada servicio tiene configurado health checks:

- **Backend Services**: `/actuator/health`
- **Frontend**: `/health`
- **PostgreSQL**: `pg_isready`

### Endpoints Importantes

- Frontend: http://localhost
- Login API: http://localhost:8080
- Core API: http://localhost:8081
- Membership API: http://localhost:8082
- Swagger (Login): http://localhost:8080/swagger-ui.html
- Adminer (Dev): http://localhost:8080 (solo en modo dev)

## 🚀 Jenkins Pipeline

### Configuración Inicial

1. **Instalar Jenkins** con los siguientes plugins:
   - Pipeline
   - Docker Pipeline
   - Git
   - Maven Integration
   - NodeJS
   - SonarQube Scanner
   - Email Extension

2. **Configurar herramientas globales**:
   - JDK 17
   - Maven 3.9.4
   - NodeJS 18
   - Docker

3. **Configurar credenciales**:
   - `docker-registry-credentials`: Para registry de Docker
   - `database-credentials`: Para base de datos
   - Git credentials si es repositorio privado

### Pipeline Stages

1. **Checkout**: Obtiene el código fuente
2. **Build & Test Backend**: Compila y prueba servicios Spring Boot en paralelo
3. **Build & Test Frontend**: Compila y prueba aplicación Ionic
4. **Code Quality**: SonarQube y análisis de seguridad
5. **Build Docker Images**: Construye imágenes Docker
6. **Integration Tests**: Pruebas de integración
7. **Push Images**: Subida a registry (solo en ramas principales)
8. **Deploy**: Despliegue automático según rama
9. **Health Check**: Verificación de servicios

### Ramas y Entornos

- `main`: Producción (requiere aprobación manual)
- `qa-jenkins`: Staging (automático)
- `develop`: Testing (automático)
- Feature branches: Solo build y test

## 🐛 Troubleshooting

### Problemas Comunes

1. **Puerto en uso**:
   ```bash
   # Verificar puertos ocupados
   netstat -tlnp | grep :8080
   
   # Cambiar puerto en docker-compose.yml
   ports:
     - "8090:8080"  # Cambiar puerto host
   ```

2. **Base de datos no conecta**:
   ```bash
   # Verificar logs de PostgreSQL
   docker-compose logs postgres
   
   # Reiniciar solo la base de datos
   docker-compose restart postgres
   ```

3. **Memoria insuficiente**:
   ```bash
   # Aumentar memoria para Docker Desktop
   # En configuración: Resources > Memory > 4GB+
   ```

4. **Imágenes no se actualizan**:
   ```bash
   # Forzar rebuild sin cache
   docker-compose build --no-cache
   
   # Limpiar imágenes antiguas
   docker system prune -a
   ```

### Logs y Debugging

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs específicos
docker-compose logs -f gymetra-login

# Entrar a un contenedor
docker exec -it gymetra-login bash

# Ver recursos utilizados
docker stats
```

## 📈 Optimización de Performance

### Producción

1. **Múltiples réplicas** configuradas en `docker-compose.prod.yml`
2. **Límites de recursos** para evitar monopolización
3. **Health checks** configurados para restart automático
4. **Volúmenes optimizados** para persistencia

### Desarrollo

1. **Hot reload** habilitado para desarrollo
2. **Debugger ports** expuestos
3. **Volúmenes de código** para cambios en tiempo real

## 🔒 Seguridad

1. **Usuarios no-root** en contenedores
2. **Secretos** gestionados via Docker secrets o env files
3. **Red aislada** para comunicación interna
4. **Imágenes base** oficiales y actualizadas
5. **Escaneo de vulnerabilidades** en pipeline

## 📚 Referencias

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Spring Boot Docker Guide](https://spring.io/guides/topicals/spring-boot-docker/)
- [Ionic Docker Guide](https://ionicframework.com/docs/deployment/docker)
