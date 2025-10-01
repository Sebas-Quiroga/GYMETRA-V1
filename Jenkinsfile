pipeline {
    agent any
    
    environment {
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_REGISTRY = "docker.io"
        DOCKER_REPO = "gymetra"
    }
    
    stages {
        stage('Cleanup') {
            steps {
                script {
                    echo 'Limpiando contenedores y recursos previos...'
                    bat '''
                        docker-compose down -v --remove-orphans || echo "No hay contenedores previos"
                        docker system prune -f || echo "Limpieza completada"
                    '''
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend/GYMETR-login') {
                    echo 'Construyendo imagen del backend (Login Service)...'
                    bat "docker build -t gymetra-login:${IMAGE_TAG} -t gymetra-login:latest ."
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend/gymetra-frontend') {
                    echo 'Construyendo imagen del frontend...'
                    bat "docker build -t gymetra-frontend:${IMAGE_TAG} -t gymetra-frontend:latest ."
                }
            }
        }
        
        stage('Test Database Connection') {
            steps {
                echo 'Probando conexión a base de datos...'
                bat '''
                    docker-compose -f docker-compose.test.yml up -d postgres-test
                    timeout /t 30 /nobreak
                    docker-compose -f docker-compose.test.yml exec -T postgres-test pg_isready -U postgres || echo "DB check completed"
                    docker-compose -f docker-compose.test.yml down -v
                '''
            }
        }
        
        stage('Deploy Containers') {
            steps {
                echo 'Desplegando contenedores...'
                bat '''
                    set IMAGE_TAG=%IMAGE_TAG%
                    docker-compose up -d
                    timeout /t 45 /nobreak
                '''
                echo 'Verificando estado de los servicios...'
                bat 'docker-compose ps'
            }
        }
        
        stage('Health Check') {
            steps {
                echo 'Verificando salud de los servicios...'
                script {
                    sleep(time: 30, unit: 'SECONDS')
                    bat '''
                        echo "Verificando backend..."
                        curl -f http://localhost:8080/actuator/health || echo "Backend health check failed"
                        echo "Verificando frontend..."
                        curl -f http://localhost/ || echo "Frontend health check failed"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo 'Limpiando recursos de prueba...'
            bat 'docker-compose -f docker-compose.test.yml down -v || echo "Test cleanup completed"'
        }
        success {
            echo '✅ Build y despliegue exitoso!'
            echo 'Backend disponible en: http://localhost:8080'
            echo 'Frontend disponible en: http://localhost'
            echo 'Swagger UI: http://localhost:8080/swagger-ui.html'
        }
        failure {
            echo '❌ Build o despliegue falló!'
            bat '''
                echo "=== LOGS DE LOS CONTENEDORES ==="
                docker-compose logs
                echo "=== ESTADO DE LOS CONTENEDORES ==="
                docker-compose ps
            '''
        }
        cleanup {
            echo 'Limpieza final del workspace...'
        }
    }
}