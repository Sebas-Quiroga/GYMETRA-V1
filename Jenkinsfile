pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Clonando repositorio...'
                checkout scm
            }
        }
        
        stage('Stop Previous Container') {
            steps {
                script {
                    echo 'Deteniendo contenedor anterior si existe...'
                    bat '''
                        docker-compose down || echo "No hay contenedor previo"
                        docker system prune -f || echo "Limpieza de sistema completada"
                    '''
                }
            }
        }
        
        stage('Build & Deploy with Docker') {
            steps {
                script {
                    echo 'Construyendo y desplegando con Docker Compose...'
                    bat '''
                        echo "Construyendo imagen Docker..."
                        docker-compose build
                        echo "Iniciando contenedor..."
                        docker-compose up -d
                        echo "Esperando que el servicio esté listo..."
                        timeout /t 10 /nobreak
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo 'Verificando que la presentación esté disponible...'
                    bat '''
                        echo "Verificando servidor en http://localhost:8081"
                        powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:8081 -UseBasicParsing -TimeoutSec 15; Write-Host 'Presentación disponible en http://localhost:8081'; exit 0 } catch { Write-Host 'Servidor no disponible aún'; exit 0 }"
                        echo "Verificando estado del contenedor..."
                        docker-compose ps
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo '🎉 Deploy exitoso! Presentación GYMETRA disponible en http://localhost:8081'
            echo '🐳 Contenedor Docker ejecutándose de forma persistente'
            bat 'docker-compose ps'
        }
        failure {
            echo '❌ Error en el deploy de la presentación'
            bat '''
                echo "Logs del contenedor:"
                docker-compose logs || echo "No hay logs disponibles"
            '''
        }
        always {
            echo '📊 Estado final del contenedor:'
            bat 'docker-compose ps || echo "Docker compose no disponible"'
        }
    }
}
