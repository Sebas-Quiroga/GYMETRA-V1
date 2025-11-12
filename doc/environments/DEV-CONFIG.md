# 🔧 DEV Environment Configuration

## 📋 Environment Overview
- **Purpose**: Development and feature testing
- **Git Branch**: `develop`
- **Status**: ✅ CONFIGURED
- **Database**: gymdb_dev

## 🌐 Access URLs
- **Frontend**: http://localhost:8100
- **Backend**: http://localhost:8080
- **Database**: localhost:5000

## 🐳 Docker Configuration

### Docker Compose File: `docker-compose.yml` (on develop branch)
> **Note**: Each environment has its own docker-compose.yml file in its respective branch

```yaml
services:
  database:
    image: postgres:15-alpine
    container_name: gymetra_database_dev
    ports:
      - "5000:5432"
    environment:
      - POSTGRES_DB=gymdb_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=123456
    volumes:
      - postgres_data_dev:/var/lib/postgresql/data
      - ./data/Database-Setup:/docker-entrypoint-initdb.d
    restart: unless-stopped
    networks:
      - gymetra-net-dev
    labels:
      com.gymetra.service: "database"
      com.gymetra.environment: "development"

  backend:
    image: gymetra/backend:dev
    build:
      context: ./backend/GYMETR-login
      dockerfile: Dockerfile
      args:
        - GIT_COMMIT=${GIT_COMMIT:-dev-local}
        - BUILD_TIME=${BUILD_TIME:-unknown}
        - SKIP_TESTS=false
    container_name: gymetra_backend_dev
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=development
      - JAVA_OPTS=-Xmx512m -Xms256m
      - DB_HOST=database
      - DB_PORT=5432
      - DB_NAME=gymdb_dev
      - DB_USER=postgres
      - DB_PASSWORD=123456
      - DEBUG_MODE=true
      - LOG_LEVEL=DEBUG
    depends_on:
      - database
    restart: unless-stopped
    networks:
      - gymetra-net-dev

  frontend:
    image: gymetra/frontend:dev
    build:
      context: ./frontend/gymetra-frontend
      dockerfile: Dockerfile
      args:
        - GIT_COMMIT=${GIT_COMMIT:-dev-local}
        - BUILD_TIME=${BUILD_TIME:-unknown}
    container_name: gymetra_frontend_dev
    ports:
      - "8100:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - gymetra-net-dev
    environment:
      - NODE_ENV=development
      - REACT_APP_API_URL=http://localhost:8080
      - REACT_APP_DEBUG=true

networks:
  gymetra-net-dev:
    driver: bridge

volumes:
  postgres_data_dev:
    driver: local
```

## ⚙️ Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `SPRING_PROFILES_ACTIVE` | development | Spring Boot profile |
| `DB_NAME` | gymdb_dev | Development database |
| `LOG_LEVEL` | DEBUG | Detailed logging |
| `DEBUG_MODE` | true | Enable debug features |
| `SKIP_TESTS` | false | Run tests during build |
| `NODE_ENV` | development | React environment |
| `REACT_APP_DEBUG` | true | Enable React debug mode |

## 🚀 Deployment Commands

```bash
# Switch to develop branch
git checkout develop

# Start DEV environment
docker-compose up -d

# Build and start with fresh images
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop environment
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 🔍 Health Checks

```bash
# Check backend health
curl -f http://localhost:8080/actuator/health

# Check frontend
curl -f http://localhost:8100

# Check database connection
docker exec gymetra_database_dev pg_isready -U postgres -d gymdb_dev
```

## 📋 Development Features
- ✅ Hot reload enabled
- ✅ Debug mode active
- ✅ Detailed logging
- ✅ Test execution enabled
- ✅ Development database with test data

## 🔧 Jenkins Pipeline Configuration (Ready)

```groovy
pipeline {
    agent any
    
    environment {
        ENVIRONMENT = 'development'
        BRANCH = 'develop'
    }
    
    triggers {
        pollSCM('H/5 * * * *') // Check every 5 minutes for changes
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'develop', url: 'https://github.com/Sebas-Quiroga/GYMETRA-V1.git'
            }
        }
        
        stage('Build') {
            steps {
                sh 'docker-compose build'
            }
        }
        
        stage('Test') {
            steps {
                sh 'docker-compose run --rm backend mvn test'
                sh 'docker-compose run --rm frontend npm test'
            }
        }
        
        stage('Deploy DEV') {
            steps {
                sh 'docker-compose up -d'
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    sleep(30)
                    sh 'curl -f http://localhost:8080/actuator/health'
                    sh 'curl -f http://localhost:8100'
                }
            }
        }
    }
    
    post {
        success {
            echo 'DEV deployment successful!'
            // Notify development team
        }
        failure {
            echo 'DEV deployment failed!'
            sh 'docker-compose logs'
        }
    }
}
```

## 📝 Development Workflow

1. **Switch to develop branch**
   ```bash
   git checkout develop
   ```

2. **Start environment**
   ```bash
   docker-compose up -d
   ```

3. **Develop features**
   - Frontend: http://localhost:8100
   - Backend API: http://localhost:8080
   - Database: localhost:5000

4. **Run tests**
   ```bash
   # Backend tests
   docker exec gymetra_backend_dev ./mvnw test
   
   # Frontend tests
   docker exec gymetra_frontend_dev npm test
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: new feature implementation"
   git push origin develop
   ```

---
**Environment Status**: ✅ READY FOR DEPLOYMENT
