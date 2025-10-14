# 🚀 GYMETRA Deployment Guide

## 📋 Overview
Complete deployment guide for all GYMETRA environments with step-by-step instructions.

## 🏗️ Environment Deployment Matrix

| Environment | Branch | Docker File | Database | Purpose |
|-------------|--------|-------------|----------|---------|
| DEV | `develop` | `docker-compose.yml` | gymdb_dev | Development |
| QA | `qa` | `docker-compose.yml` | gymdb_qa | Testing |
| RELEASE | `release/*` | `docker-compose.yml` | gymdb_staging | Pre-prod |
| MAIN | `main` | `docker-compose.yml` | gymdb | Production |

> **Note**: Each environment has its own docker-compose.yml file in its respective git branch

## 🔄 Standard Deployment Flow

### 1. Development Workflow
```bash
# Switch to develop branch
git checkout develop

# Pull latest changes
git pull origin develop

# Deploy to DEV environment
docker-compose down
docker-compose up -d --build

# Verify deployment
curl -f http://localhost:8080/actuator/health
curl -f http://localhost:8100
```

### 2. QA Deployment
```bash
# Switch to qa branch
git checkout qa

# Merge develop to qa
git merge develop

# Deploy to QA environment
docker-compose down
docker-compose up -d --build

# Run automated tests
docker-compose exec backend mvn test
```

### 3. Release Deployment
```bash
# Switch to release branch
git checkout release/v1.0.0

# Merge qa to release
git merge qa

# Deploy to RELEASE environment
docker-compose down
docker-compose up -d --build

# Validate release
curl -f http://localhost:8080/actuator/health
curl -f http://localhost:8080/actuator/metrics
```

### 4. Production Deployment
```bash
# Switch to main branch
git checkout main

# Merge release to main
git merge release/v1.0.0

# Deploy to MAIN environment
docker-compose down
docker-compose up -d --build

# Production validation
curl -f http://localhost:8080/actuator/health
```

## 🐳 Docker Compose Configuration

### Branch-Based Configuration
Each environment has its own docker-compose.yml file in its respective git branch:

```bash
# DEV environment (develop branch)
git checkout develop
# Uses docker-compose.yml with DEV configuration

# QA environment (qa branch) 
git checkout qa
# Uses docker-compose.yml with QA configuration

# RELEASE environment (release/* branch)
git checkout release/v1.0.0
# Uses docker-compose.yml with STAGING configuration

# MAIN environment (main branch)
git checkout main
# Uses docker-compose.yml with PRODUCTION configuration
```

### Environment Variables by Branch
Each branch contains environment-specific variables in its docker-compose.yml:

- **develop**: Development database, debug mode, test data
- **qa**: QA database, test endpoints, integration testing
- **release/***: Staging database, production-like settings
- **main**: Production database, optimized settings

## 🔧 Environment Switching

### Branch-Based Environment Switching
```bash
# Switch to DEV environment
git checkout develop
docker-compose down
docker-compose up -d

# Switch to QA environment
git checkout qa
docker-compose down  
docker-compose up -d

# Switch to RELEASE environment
git checkout release/v1.0.0
docker-compose down
docker-compose up -d

# Switch to MAIN environment
git checkout main
docker-compose down
docker-compose up -d
```

### Quick Switch Scripts
```bash
# scripts/switch-to-dev.sh
#!/bin/bash
echo "🔄 Switching to DEV environment..."
docker-compose down
git checkout develop
docker-compose up -d
echo "✅ DEV environment active"

# scripts/switch-to-qa.sh
#!/bin/bash
echo "🔄 Switching to QA environment..."
docker-compose down
git checkout qa
docker-compose up -d
echo "✅ QA environment active"

# scripts/switch-to-main.sh
#!/bin/bash
echo "🔄 Switching to MAIN environment..."
docker-compose down
git checkout main
docker-compose up -d
echo "✅ MAIN environment active"
```

## 📋 Pre-Deployment Checklist

### Before Any Deployment
- [ ] Git branch is up to date
- [ ] No uncommitted changes
- [ ] Tests are passing
- [ ] Configuration verified
- [ ] Backup created (for MAIN)

### DEV Deployment
- [ ] Feature branch merged to develop
- [ ] Development database reset if needed
- [ ] Debug mode enabled
- [ ] Test data loaded

### QA Deployment
- [ ] All dev features integrated
- [ ] Test database prepared
- [ ] Test scenarios documented
- [ ] Automated tests configured

### RELEASE Deployment
- [ ] QA testing completed
- [ ] Performance tests passed
- [ ] Security scans completed
- [ ] Release notes prepared

### MAIN Deployment
- [ ] Release validation passed
- [ ] Database backup created
- [ ] Rollback plan ready
- [ ] Monitoring alerts configured

## 🚨 Emergency Procedures

### Rollback Procedure
```bash
# Quick rollback (any environment)
docker-compose down
git checkout <previous-stable-commit>
docker-compose up -d

# Database rollback (MAIN only)
docker exec gymetra_database psql -U postgres -d gymdb < backup-latest.sql
```

### Health Check Script
```bash
#!/bin/bash
# health-check.sh

ENVIRONMENT=${1:-"main"}
echo "🔍 Health checking $ENVIRONMENT environment..."

case $ENVIRONMENT in
  "dev")
    COMPOSE_FILE="docker-compose.dev.yml"
    ;;
  "qa")
    COMPOSE_FILE="docker-compose.qa.yml"
    ;;
  "staging")
    COMPOSE_FILE="docker-compose.staging.yml"
    ;;
  "main")
    COMPOSE_FILE="docker-compose.yml"
    ;;
esac

# Check containers
docker-compose -f $COMPOSE_FILE ps

# Check health endpoints
curl -f http://localhost:8080/actuator/health
curl -f http://localhost:8100

echo "✅ Health check completed for $ENVIRONMENT"
```

## 📊 Monitoring and Validation

### Post-Deployment Validation
```bash
# Container status
docker-compose ps

# Application logs
docker-compose logs -f --tail=50

# Resource usage
docker stats

# Application metrics
curl http://localhost:8080/actuator/metrics

# Database connection
docker exec gymetra_database pg_isready -U postgres
```

### Automated Validation Script
```bash
#!/bin/bash
# validate-deployment.sh

echo "🚀 Starting deployment validation..."

# Wait for services
sleep 30

# Test backend
echo "Testing backend..."
if curl -f http://localhost:8080/actuator/health; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend failed health check"
    exit 1
fi

# Test frontend  
echo "Testing frontend..."
if curl -f http://localhost:8100; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend failed"
    exit 1
fi

# Test database
echo "Testing database..."
if docker exec gymetra_database pg_isready -U postgres; then
    echo "✅ Database is ready"
else
    echo "❌ Database failed"
    exit 1
fi

echo "🎉 Deployment validation successful!"
```

## 🔐 Security Considerations

### Environment Security
- Production passwords different from dev/qa
- HTTPS enabled in production
- Database access restricted
- Container security scanning
- Network security configured

### Secrets Management
```bash
# Use environment files for secrets
echo "DB_PASSWORD=secure_password" >> .env.prod
echo "JWT_SECRET=random_jwt_secret" >> .env.prod

# Never commit secrets to git
echo ".env.*" >> .gitignore
```

---
**Deployment Guide**: ✅ COMPLETE  
*All environments ready for automated CI/CD pipeline integration*
