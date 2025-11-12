# 🔧 GYMETRA Troubleshooting Guide

## 📋 Common Issues and Solutions

### 🐳 Docker Issues

#### Port Already in Use
**Problem**: `Error: Port 8080/8100/5000 is already in use`

**Solution**:
```bash
# Find process using port
netstat -ano | findstr :8080
netstat -ano | findstr :8100
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <process_id> /F

# Or stop all Docker containers
docker stop $(docker ps -q)
```

#### Container Won't Start
**Problem**: Container exits immediately or fails to start

**Solution**:
```bash
# Check container logs
docker-compose logs <service_name>

# Check container status
docker-compose ps

# Rebuild containers
docker-compose down
docker-compose up -d --build --force-recreate
```

#### Out of Disk Space
**Problem**: `no space left on device`

**Solution**:
```bash
# Clean Docker system
docker system prune -a

# Remove unused volumes
docker volume prune

# Remove unused images
docker image prune -a
```

### 🗄️ Database Issues

#### Database Connection Failed
**Problem**: Backend can't connect to database

**Solution**:
```bash
# Check database container
docker exec gymetra_database pg_isready -U postgres -d gymdb

# Check database logs
docker-compose logs database

# Reset database
docker-compose down -v
docker-compose up database -d
sleep 10
docker-compose up -d
```

#### Database Data Lost
**Problem**: Database data disappeared after restart

**Solution**:
```bash
# Check volume exists
docker volume ls | grep postgres_data

# Restore from backup
docker exec gymetra_database psql -U postgres -d gymdb < backup-latest.sql

# Recreate volume if needed
docker-compose down -v
docker-compose up -d
```

#### Database Performance Issues
**Problem**: Slow database queries

**Solution**:
```bash
# Check database stats
docker exec gymetra_database psql -U postgres -d gymdb -c "\l+"

# Monitor database activity
docker exec gymetra_database psql -U postgres -d gymdb -c "SELECT * FROM pg_stat_activity;"

# Restart database
docker-compose restart database
```

### 🔧 Backend Issues

#### Backend Won't Start
**Problem**: Spring Boot application fails to start

**Solution**:
```bash
# Check backend logs
docker-compose logs backend

# Common issues to check:
# - Database connection
# - Java memory settings
# - Configuration files
# - Port conflicts

# Restart with clean build
docker-compose stop backend
docker-compose build backend
docker-compose up backend -d
```

#### Backend Health Check Fails
**Problem**: `/actuator/health` returns error

**Solution**:
```bash
# Check if backend is running
curl -v http://localhost:8080/actuator/health

# Check backend configuration
docker-compose exec backend env | grep SPRING

# Check database connectivity from backend
docker-compose exec backend ping database

# Restart backend
docker-compose restart backend
```

#### Backend Memory Issues
**Problem**: OutOfMemoryError in backend

**Solution**:
```bash
# Increase memory in docker-compose
# Change JAVA_OPTS=-Xmx512m to JAVA_OPTS=-Xmx1g

# Monitor memory usage
docker stats gymetra_backend

# Restart with new settings
docker-compose down
docker-compose up -d
```

### 🎨 Frontend Issues

#### Frontend Won't Load
**Problem**: Frontend not accessible on port 8100

**Solution**:
```bash
# Check frontend container
docker-compose logs frontend

# Check if port is accessible
curl -v http://localhost:8100

# Restart frontend
docker-compose restart frontend

# Rebuild frontend
docker-compose build frontend
docker-compose up frontend -d
```

#### Frontend Build Fails
**Problem**: npm build errors during container build

**Solution**:
```bash
# Check build logs
docker-compose logs frontend

# Clean build
docker-compose down
docker-compose build frontend --no-cache
docker-compose up -d

# Check Node.js version compatibility
docker-compose exec frontend node --version
```

#### Frontend Can't Connect to Backend
**Problem**: API calls from frontend fail

**Solution**:
```bash
# Check backend URL in frontend environment
docker-compose exec frontend env | grep API_URL

# Test backend connectivity from frontend container
docker-compose exec frontend curl http://backend:8080/actuator/health

# Verify network connectivity
docker network ls
docker network inspect gymetra-net
```

### 🌐 Network Issues

#### Containers Can't Communicate
**Problem**: Services can't reach each other

**Solution**:
```bash
# Check network configuration
docker network ls
docker network inspect gymetra-net

# Test connectivity between containers
docker-compose exec frontend ping backend
docker-compose exec backend ping database

# Recreate network
docker-compose down
docker-compose up -d
```

#### External Access Issues
**Problem**: Can't access services from host machine

**Solution**:
```bash
# Check port mappings
docker-compose ps

# Check if ports are bound correctly
netstat -an | findstr :8080
netstat -an | findstr :8100

# Restart with port mapping
docker-compose down
docker-compose up -d
```

### 📊 Environment-Specific Issues

#### DEV Environment Issues
```bash
# Debug mode not working
# Check SPRING_PROFILES_ACTIVE=development
docker-compose -f docker-compose.dev.yml exec backend env | grep SPRING_PROFILES_ACTIVE

# Hot reload not working
# Rebuild with fresh code
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d --build
```

#### QA Environment Issues
```bash
# Test data not loading
# Check test data volume mount
docker-compose -f docker-compose.qa.yml exec database ls -la /docker-entrypoint-initdb.d/

# Tests failing
# Run tests manually
docker-compose -f docker-compose.qa.yml exec backend mvn test
```

#### MAIN Environment Issues
```bash
# Production health checks failing
# Check all health endpoints
curl http://localhost:8080/actuator/health
curl http://localhost:8100

# Performance issues
# Check resource usage
docker stats
```

## 🚨 Emergency Procedures

### Complete System Reset
```bash
# CAUTION: This will destroy all data
docker-compose down -v
docker system prune -a
docker volume prune
docker-compose up -d
```

### Environment Switch Issues
```bash
# If switching between environments fails
# Stop all environments
docker-compose down
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.qa.yml down
docker-compose -f docker-compose.staging.yml down

# Clear any port conflicts
docker ps -a
docker stop $(docker ps -q)

# Start desired environment
docker-compose -f <desired-compose-file> up -d
```

### Data Recovery
```bash
# Backup current state
docker exec gymetra_database pg_dump -U postgres gymdb > emergency-backup.sql

# Restore from backup
docker exec gymetra_database psql -U postgres -d gymdb < backup-file.sql
```

## 📋 Diagnostic Commands

### Health Check All Services
```bash
#!/bin/bash
echo "🔍 GYMETRA System Diagnostic"
echo "============================"

# Container status
echo "📦 Container Status:"
docker-compose ps

# Service health
echo "🏥 Service Health:"
curl -s http://localhost:8080/actuator/health | grep status || echo "❌ Backend unreachable"
curl -s http://localhost:8100 > /dev/null && echo "✅ Frontend OK" || echo "❌ Frontend unreachable"

# Database status
echo "🗄️ Database Status:"
docker exec gymetra_database pg_isready -U postgres -d gymdb && echo "✅ Database OK" || echo "❌ Database unreachable"

# Resource usage
echo "💾 Resource Usage:"
docker stats --no-stream

# Network status
echo "🌐 Network Status:"
docker network ls | grep gymetra
```

### Log Collection
```bash
#!/bin/bash
# collect-logs.sh
echo "📋 Collecting logs..."

mkdir -p logs/$(date +%Y%m%d_%H%M%S)
cd logs/$(date +%Y%m%d_%H%M%S)

# Collect all service logs
docker-compose logs database > database.log
docker-compose logs backend > backend.log  
docker-compose logs frontend > frontend.log

# System information
docker-compose ps > containers.log
docker stats --no-stream > stats.log
docker system df > disk-usage.log

echo "✅ Logs collected in logs/$(date +%Y%m%d_%H%M%S)/"
```

## 🔗 Support Resources

### Documentation Links
- [DEV Environment](./DEV-CONFIG.md)
- [QA Environment](./QA-CONFIG.md)
- [RELEASE Environment](./RELEASE-CONFIG.md)
- [MAIN Environment](./MAIN-CONFIG.md)
- [Deployment Guide](./DEPLOYMENT-GUIDE.md)

### Quick Reference
```bash
# Health checks
curl http://localhost:8080/actuator/health  # Backend
curl http://localhost:8100                 # Frontend

# Container management
docker-compose ps                          # Status
docker-compose logs -f                     # Live logs
docker-compose restart <service>          # Restart service

# Emergency stop
docker-compose kill                        # Force stop all
```

---
**Troubleshooting Guide**: ✅ COMPLETE  
*Comprehensive solutions for common GYMETRA deployment issues*
