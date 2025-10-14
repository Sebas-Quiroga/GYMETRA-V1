# 🧪 QA Environment Configuration

## 📋 Environment Overview
- **Purpose**: Quality Assurance and Integration Testing
- **Git Branch**: `qa`
- **Status**: ✅ CONFIGURED
- **Database**: gymdb_qa

## 🌐 Access URLs
- **Frontend**: http://localhost:8100
- **Backend**: http://localhost:8080
- **Database**: localhost:5000

## 🐳 Docker Configuration

### Docker Compose File: `docker-compose.yml` (on qa branch)
> **Note**: Each environment has its own docker-compose.yml file in its respective branch
```yaml
services:
  database:
    image: postgres:15-alpine
    container_name: gymetra_database_qa
    ports:
      - "5000:5432"
    environment:
      - POSTGRES_DB=gymdb_qa
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=123456
    volumes:
      - postgres_data_qa:/var/lib/postgresql/data
      - ./data/Database-Setup:/docker-entrypoint-initdb.d
      - ./data/QA-TestData:/docker-entrypoint-initdb.d/test-data
    restart: unless-stopped
    networks:
      - gymetra-net-qa
    labels:
      com.gymetra.service: "database"
      com.gymetra.environment: "qa"

  backend:
    image: gymetra/backend:qa
    build:
      context: ./backend/GYMETR-login
      dockerfile: Dockerfile
      args:
        - GIT_COMMIT=${GIT_COMMIT:-qa-local}
        - BUILD_TIME=${BUILD_TIME:-unknown}
        - SKIP_TESTS=false
    container_name: gymetra_backend_qa
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=qa
      - JAVA_OPTS=-Xmx512m -Xms256m
      - DB_HOST=database
      - DB_PORT=5432
      - DB_NAME=gymdb_qa
      - DB_USER=postgres
      - DB_PASSWORD=123456
      - TEST_MODE=true
      - LOG_LEVEL=INFO
      - ENABLE_TEST_ENDPOINTS=true
    depends_on:
      - database
    restart: unless-stopped
    networks:
      - gymetra-net-qa

  frontend:
    image: gymetra/frontend:qa
    build:
      context: ./frontend/gymetra-frontend
      dockerfile: Dockerfile
      args:
        - GIT_COMMIT=${GIT_COMMIT:-qa-local}
        - BUILD_TIME=${BUILD_TIME:-unknown}
    container_name: gymetra_frontend_qa
    ports:
      - "8100:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - gymetra-net-qa
    environment:
      - NODE_ENV=production
      - REACT_APP_API_URL=http://localhost:8080
      - REACT_APP_DEBUG=false
      - REACT_APP_TEST_MODE=true

networks:
  gymetra-net-qa:
    driver: bridge

volumes:
  postgres_data_qa:
    driver: local
```

## ⚙️ Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `SPRING_PROFILES_ACTIVE` | qa | Spring Boot QA profile |
| `DB_NAME` | gymdb_qa | QA database |
| `LOG_LEVEL` | INFO | Standard logging |
| `TEST_MODE` | true | Enable test features |
| `ENABLE_TEST_ENDPOINTS` | true | Enable testing endpoints |
| `NODE_ENV` | production | Optimized React build |
| `REACT_APP_TEST_MODE` | true | Enable test mode in frontend |

## 🚀 Deployment Commands

```bash
# Switch to qa branch
git checkout qa

# Start QA environment
docker-compose up -d

# Build and start with fresh images
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop environment
docker-compose down

# Reset environment with fresh test data
docker-compose down -v
docker-compose up -d
```

## 🧪 Testing Features
- ✅ Pre-loaded test data
- ✅ Test endpoints enabled
- ✅ Integration test ready
- ✅ Automated test execution
- ✅ Test reporting enabled

## 🔍 QA Validation Commands

```bash
# Run integration tests
docker-compose exec backend mvn test -Dtest=IntegrationTest

# Health checks
curl -f http://localhost:8080/actuator/health
curl -f http://localhost:8100

# Test data validation
curl -f http://localhost:8080/api/test/users
curl -f http://localhost:8080/api/test/memberships
```

## 🔧 Jenkins Pipeline Configuration (Ready)

```groovy
pipeline {
    agent any
    
    environment {
        ENVIRONMENT = 'qa'
        BRANCH = 'qa'
    }
    
    triggers {
        pollSCM('H/10 * * * *') // Check every 10 minutes for changes
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'qa', url: 'https://github.com/Sebas-Quiroga/GYMETRA-V1.git'
            }
        }
        
        stage('Build') {
            steps {
                sh 'docker-compose build'
            }
        }
        
        stage('Deploy QA') {
            steps {
                sh 'docker-compose up -d'
            }
        }
        
        stage('Integration Tests') {
            steps {
                script {
                    sleep(30)
                    sh 'docker-compose exec -T backend mvn test -Dtest=IntegrationTest'
                }
            }
        }
        
        stage('E2E Tests') {
            steps {
                sh 'docker-compose exec -T frontend npm run test:e2e'
            }
        }
        
        stage('Performance Tests') {
            steps {
                sh 'docker-compose exec -T backend mvn test -Dtest=PerformanceTest'
            }
        }
        
        stage('Quality Gates') {
            steps {
                script {
                    // Check test coverage, performance metrics, etc.
                    sh 'docker-compose exec -T backend mvn jacoco:check'
                }
            }
        }
    }
    
    post {
        always {
            publishTestResults testResultsPattern: 'target/surefire-reports/*.xml'
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'target/site/jacoco',
                reportFiles: 'index.html',
                reportName: 'Coverage Report'
            ])
        }
        success {
            echo 'QA validation successful! Ready for release candidate.'
        }
        failure {
            echo 'QA validation failed!'
            sh 'docker-compose logs'
        }
    }
}
```

---
**Environment Status**: ✅ READY FOR QA TESTING
