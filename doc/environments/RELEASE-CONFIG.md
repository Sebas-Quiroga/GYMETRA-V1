# 🚀 RELEASE Environment Configuration

## 📋 Environment Overview
- **Purpose**: Pre-production staging and release validation
- **Git Branch**: `release/*`
- **Status**: ✅ CONFIGURED
- **Database**: gymdb_staging

## 🌐 Access URLs
- **Frontend**: http://localhost:8100
- **Backend**: http://localhost:8080
- **Database**: localhost:5000

## 🐳 Docker Configuration

### Docker Compose File: `docker-compose.yml` (on release/* branch)
> **Note**: Each environment has its own docker-compose.yml file in its respective branch
```yaml
services:
  database:
    image: postgres:15-alpine
    container_name: gymetra_database_staging
    ports:
      - "5000:5432"
    environment:
      - POSTGRES_DB=gymdb_staging
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=123456
    volumes:
      - postgres_data_staging:/var/lib/postgresql/data
      - ./data/Database-Setup:/docker-entrypoint-initdb.d
      - ./data/Staging-Data:/docker-entrypoint-initdb.d/staging-data
    restart: unless-stopped
    networks:
      - gymetra-net-staging
    labels:
      com.gymetra.service: "database"
      com.gymetra.environment: "staging"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d gymdb_staging"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 15s

  backend:
    image: gymetra/backend:staging
    build:
      context: ./backend/GYMETR-login
      dockerfile: Dockerfile
      args:
        - GIT_COMMIT=${GIT_COMMIT:-staging-local}
        - BUILD_TIME=${BUILD_TIME:-unknown}
        - SKIP_TESTS=true
    container_name: gymetra_backend_staging
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=staging
      - JAVA_OPTS=-Xmx1g -Xms512m
      - DB_HOST=database
      - DB_PORT=5432
      - DB_NAME=gymdb_staging
      - DB_USER=postgres
      - DB_PASSWORD=123456
      - LOG_LEVEL=INFO
      - ENABLE_MONITORING=true
      - PERFORMANCE_MONITORING=true
    depends_on:
      database:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - gymetra-net-staging
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:8080/actuator/health || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 6
      start_period: 30s

  frontend:
    image: gymetra/frontend:staging
    build:
      context: ./frontend/gymetra-frontend
      dockerfile: Dockerfile
      args:
        - GIT_COMMIT=${GIT_COMMIT:-staging-local}
        - BUILD_TIME=${BUILD_TIME:-unknown}
    container_name: gymetra_frontend_staging
    ports:
      - "8100:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - gymetra-net-staging
    environment:
      - NODE_ENV=production
      - REACT_APP_API_URL=http://localhost:8080
      - REACT_APP_ENVIRONMENT=staging
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost/ || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 5
      start_period: 15s

networks:
  gymetra-net-staging:
    driver: bridge

volumes:
  postgres_data_staging:
    driver: local
```

## ⚙️ Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `SPRING_PROFILES_ACTIVE` | staging | Spring Boot staging profile |
| `DB_NAME` | gymdb_staging | Staging database |
| `LOG_LEVEL` | INFO | Production-like logging |
| `JAVA_OPTS` | -Xmx1g -Xms512m | Production memory settings |
| `ENABLE_MONITORING` | true | Enable performance monitoring |
| `PERFORMANCE_MONITORING` | true | Enable performance metrics |
| `NODE_ENV` | production | Optimized React build |
| `REACT_APP_ENVIRONMENT` | staging | Staging environment flag |

## 🚀 Deployment Commands

```bash
# Switch to release branch
git checkout release/v1.0.0

# Start RELEASE environment
docker-compose up -d

# Build and start with fresh images
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop environment
docker-compose down

# Full reset for new release testing
docker-compose down -v
docker-compose up -d --build
```

## 🔍 Pre-Production Validation

```bash
# Health checks
curl -f http://localhost:8080/actuator/health
curl -f http://localhost:8100

# Performance check
curl -f http://localhost:8080/actuator/metrics

# Database validation
docker exec gymetra_database_staging pg_isready -U postgres -d gymdb_staging

# Load test validation
docker-compose exec backend curl -f http://localhost:8080/actuator/metrics/http.server.requests
```

## 📊 Release Validation Features
- ✅ Production-like configuration
- ✅ Performance monitoring enabled
- ✅ Health checks configured
- ✅ Staging data loaded
- ✅ Memory optimization
- ✅ Production build optimization

## 🔧 Jenkins Pipeline Configuration (Ready)

```groovy
pipeline {
    agent any
    
    environment {
        ENVIRONMENT = 'staging'
        BRANCH = 'release/*'
    }
    
    triggers {
        pollSCM('H/15 * * * *') // Check every 15 minutes for changes
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: env.BRANCH_NAME, url: 'https://github.com/Sebas-Quiroga/GYMETRA-V1.git'
            }
        }
        
        stage('Pre-Release Build') {
            steps {
                sh 'docker-compose build'
            }
        }
        
        stage('Deploy to Staging') {
            steps {
                sh 'docker-compose up -d'
            }
        }
        
        stage('Health Validation') {
            steps {
                script {
                    sleep(45)
                    sh 'curl -f http://localhost:8080/actuator/health'
                    sh 'curl -f http://localhost:8100'
                }
            }
        }
        
        stage('Performance Tests') {
            steps {
                sh 'docker-compose exec -T backend mvn test -Dtest=PerformanceTest'
            }
        }
        
        stage('Load Tests') {
            steps {
                sh 'artillery run load-test-config.yml'
            }
        }
        
        stage('Security Scan') {
            steps {
                sh 'docker run --rm -v $(pwd):/app owasp/zap2docker-stable zap-baseline.py -t http://localhost:8080'
            }
        }
        
        stage('Release Approval') {
            when {
                branch 'release/*'
            }
            steps {
                input message: 'Approve release to production?', ok: 'Deploy to Production'
            }
        }
        
        stage('Create Release Tag') {
            when {
                branch 'release/*'
            }
            steps {
                script {
                    def version = env.BRANCH_NAME.split('/')[1]
                    sh "git tag -a v${version} -m 'Release version ${version}'"
                    sh "git push origin v${version}"
                }
            }
        }
    }
    
    post {
        success {
            echo 'Release validation completed successfully!'
            // Merge to main branch
            sh 'git checkout main'
            sh "git merge ${env.BRANCH_NAME}"
            sh 'git push origin main'
        }
        failure {
            echo 'Release validation failed!'
            sh 'docker-compose logs'
        }
    }
}
```

---
**Environment Status**: ✅ READY FOR RELEASE VALIDATION
