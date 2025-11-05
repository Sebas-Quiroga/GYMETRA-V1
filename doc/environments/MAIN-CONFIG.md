# 🏭 MAIN Environment Configuration

## 📋 Environment Overview
- **Purpose**: Production environment
- **Git Branch**: `main`
- **Status**: ✅ ACTIVE
- **Database**: gymdb

## 🌐 Access URLs
- **Frontend**: http://localhost:8100
- **Backend**: http://localhost:8080
- **Database**: localhost:5000

## 🐳 Current Docker Configuration

### Docker Compose File: `docker-compose.yml` (ACTIVE)
This is the current production configuration based on the existing docker-compose.yml file:

```yaml
services:
  database:
    image: postgres:15-alpine
    container_name: gymetra_database
    ports:
      - "5000:5432"
    environment:
      - POSTGRES_DB=gymdb
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=123456
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./data/Database-Setup:/docker-entrypoint-initdb.d
    restart: unless-stopped
    networks:
      - gymetra-net
    labels:
      com.gymetra.service: "database"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d gymdb"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 15s

  backend:
    image: gymetra/backend:latest
    build:
      context: ./backend/GYMETR-login
      dockerfile: Dockerfile
      args:
        - GIT_COMMIT=${GIT_COMMIT:-local}
        - BUILD_TIME=${BUILD_TIME:-unknown}
        - SKIP_TESTS=true
    container_name: gymetra_backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - JAVA_OPTS=-Xmx512m -Xms256m
      - DB_HOST=database
      - DB_PORT=5432
      - DB_NAME=gymdb
      - DB_USER=postgres
      - DB_PASSWORD=123456
    depends_on:
      database:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - gymetra-net
    labels:
      com.gymetra.service: "backend"
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:8080/actuator/health || wget -qO- http://localhost:8080/ || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 6
      start_period: 30s

  frontend:
    image: gymetra/frontend:latest
    build:
      context: ./frontend/gymetra-frontend
      dockerfile: Dockerfile
      args:
        - GIT_COMMIT=${GIT_COMMIT:-local}
        - BUILD_TIME=${BUILD_TIME:-unknown}
    container_name: gymetra_frontend
    ports:
      - "8100:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - gymetra-net
    environment:
      - NODE_ENV=production
    labels:
      com.gymetra.service: "frontend"
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost/ || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 5
      start_period: 15s

networks:
  gymetra-net:
    driver: bridge

volumes:
  postgres_data:
    driver: local
```

## ⚙️ Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `SPRING_PROFILES_ACTIVE` | prod | Spring Boot production profile |
| `DB_NAME` | gymdb | Production database |
| `JAVA_OPTS` | -Xmx512m -Xms256m | Production memory settings |
| `SKIP_TESTS` | true | Skip tests in production build |
| `NODE_ENV` | production | Optimized React build |

## 🚀 Deployment Commands

```bash
# Start MAIN environment (currently active)
docker-compose up -d

# Build and start with fresh images
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop environment
docker-compose down

# Emergency stop all services
docker-compose kill
```

## 📊 Current Status

### ✅ Active Services
```bash
# Check running containers
docker ps

# Expected output:
# gymetra_frontend    - Port 8100 ✅
# gymetra_backend     - Port 8080 ✅  
# gymetra_database    - Port 5000 ✅
```

### 🔍 Health Monitoring

```bash
# Backend health check
curl -f http://localhost:8080/actuator/health

# Frontend check
curl -f http://localhost:8100

# Database check
docker exec gymetra_database pg_isready -U postgres -d gymdb

# Container health status
docker-compose ps
```

## 🛡️ Production Features
- ✅ Health checks enabled
- ✅ Restart policies configured
- ✅ Production profiles active
- ✅ Optimized memory settings
- ✅ Production database
- ✅ Error handling configured

## 🔧 Jenkins Pipeline Configuration (Ready)

```groovy
pipeline {
    agent any
    
    environment {
        COMPOSE_FILE = 'docker-compose.yml'
        ENVIRONMENT = 'production'
    }
    
    stages {
        stage('Pre-Deploy Validation') {
            steps {
                script {
                    // Validate release branch
                    if (env.BRANCH_NAME != 'main') {
                        error("Production deploys only from main branch")
                    }
                }
            }
        }
        
        stage('Backup Database') {
            steps {
                sh 'docker exec gymetra_database pg_dump -U postgres gymdb > backup-$(date +%Y%m%d-%H%M%S).sql'
            }
        }
        
        stage('Build Production Images') {
            steps {
                sh 'docker-compose build'
            }
        }
        
        stage('Deploy to Production') {
            steps {
                sh 'docker-compose up -d'
            }
        }
        
        stage('Post-Deploy Validation') {
            steps {
                script {
                    sleep(45)
                    sh 'curl -f http://localhost:8080/actuator/health'
                    sh 'curl -f http://localhost:8100'
                }
            }
        }
        
        stage('Smoke Tests') {
            steps {
                sh 'docker-compose exec -T backend mvn test -Dtest=SmokeTest'
            }
        }
    }
    
    post {
        success {
            echo 'Production deployment completed successfully!'
            // Notify team
        }
        failure {
            echo 'Production deployment failed! Rolling back...'
            sh 'docker-compose down'
            // Restore backup if needed
            // Notify team immediately
        }
    }
}
```

## 🚨 Emergency Procedures

### Quick Rollback
```bash
# Stop current deployment
docker-compose down

# Restore from backup
docker-compose up database -d
sleep 10
docker exec gymetra_database psql -U postgres -d gymdb < backup-YYYYMMDD-HHMMSS.sql

# Start previous stable version
docker-compose up -d
```

### Health Check Script
```bash
#!/bin/bash
echo "🔍 GYMETRA Production Health Check"
echo "=================================="

# Backend check
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✅ Backend: HEALTHY"
else
    echo "❌ Backend: DOWN"
fi

# Frontend check
if curl -f http://localhost:8100 > /dev/null 2>&1; then
    echo "✅ Frontend: HEALTHY"
else
    echo "❌ Frontend: DOWN"
fi

# Database check
if docker exec gymetra_database pg_isready -U postgres -d gymdb > /dev/null 2>&1; then
    echo "✅ Database: HEALTHY"
else
    echo "❌ Database: DOWN"
fi

echo "=================================="
```

---
**Environment Status**: ✅ ACTIVE IN PRODUCTION
