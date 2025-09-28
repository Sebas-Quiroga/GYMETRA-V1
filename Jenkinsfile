pipeline {
    agent any
    
    environment {
        // Configuración del repositorio
        GIT_REPO_URL = 'https://github.com/Sebas-Quiroga/GYMETRA-V1.git'
        
        // Configuración Docker
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        PROJECT_NAME = 'gymetra'
        
        // Puertos de la aplicación
        BACKEND_PORT = '8080'
        FRONTEND_PORT = '8100'
        
        // Configuración de rama
        TARGET_BRANCH = 'develop'
    }
    
    triggers {
        // Trigger automático cuando hay cambios en la rama develop
        pollSCM('H/5 * * * *') // Revisa cada 5 minutos
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "🔄 Iniciando checkout de la rama ${TARGET_BRANCH}"
                }
                
                // Checkout del código desde la rama develop
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${TARGET_BRANCH}"]],
                    userRemoteConfigs: [[
                        url: "${GIT_REPO_URL}",
                        credentialsId: 'github-credentials' // Configurar en Jenkins si el repo es privado
                    ]]
                ])
                
                script {
                    echo "✅ Checkout completado desde la rama ${TARGET_BRANCH}"
                    sh 'git branch -a'
                    sh 'git log --oneline -n 5'
                }
            }
        }
        
        stage('Environment Check') {
            steps {
                script {
                    echo "🔍 Verificando el entorno de despliegue..."
                }
                
                // Verificar que Docker esté disponible
                sh '''
                    echo "Verificando Docker..."
                    docker --version
                    docker-compose --version
                    
                    echo "Verificando puertos disponibles..."
                    if netstat -tuln | grep ":${BACKEND_PORT}"; then
                        echo "⚠️ Puerto ${BACKEND_PORT} está en uso"
                    else
                        echo "✅ Puerto ${BACKEND_PORT} está disponible"
                    fi
                    
                    if netstat -tuln | grep ":${FRONTEND_PORT}"; then
                        echo "⚠️ Puerto ${FRONTEND_PORT} está en uso"
                    else
                        echo "✅ Puerto ${FRONTEND_PORT} está disponible"
                    fi
                '''
            }
        }
        
        stage('Pre-deploy Cleanup') {
            steps {
                script {
                    echo "🧹 Limpiando despliegue anterior..."
                }
                
                // Detener y eliminar contenedores existentes
                sh '''
                    # Detener contenedores existentes si están corriendo
                    docker-compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans || true
                    
                    # Limpiar imágenes huérfanas
                    docker image prune -f || true
                    
                    # Limpiar volúmenes no utilizados
                    docker volume prune -f || true
                    
                    echo "✅ Limpieza completada"
                '''
            }
        }
        
        stage('Build Services') {
            parallel {
                stage('Build Backend') {
                    steps {
                        script {
                            echo "🏗️ Construyendo el backend (GYMETR-login)..."
                        }
                        
                        sh '''
                            # Construir la imagen del backend
                            docker-compose -f ${DOCKER_COMPOSE_FILE} build backend
                            
                            echo "✅ Backend construido exitosamente"
                        '''
                    }
                }
                
                stage('Build Frontend') {
                    steps {
                        script {
                            echo "🏗️ Construyendo el frontend (gymetra-frontend)..."
                        }
                        
                        sh '''
                            # Construir la imagen del frontend
                            docker-compose -f ${DOCKER_COMPOSE_FILE} build frontend
                            
                            echo "✅ Frontend construido exitosamente"
                        '''
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    echo "🚀 Desplegando aplicación GYMETRA..."
                }
                
                sh '''
                    # Desplegar todos los servicios
                    docker-compose -f ${DOCKER_COMPOSE_FILE} up -d
                    
                    echo "✅ Despliegue completado"
                    
                    # Mostrar estado de los contenedores
                    docker-compose -f ${DOCKER_COMPOSE_FILE} ps
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo "🏥 Verificando estado de salud de los servicios..."
                }
                
                sh '''
                    # Esperar a que los servicios estén listos
                    echo "Esperando que los servicios estén listos..."
                    sleep 30
                    
                    # Verificar backend
                    echo "Verificando backend en puerto ${BACKEND_PORT}..."
                    for i in {1..10}; do
                        if curl -f http://localhost:${BACKEND_PORT}/actuator/health > /dev/null 2>&1; then
                            echo "✅ Backend está saludable"
                            break
                        else
                            echo "⏳ Esperando backend... intento $i/10"
                            sleep 10
                        fi
                        if [ $i -eq 10 ]; then
                            echo "❌ Backend no responde después de 10 intentos"
                            exit 1
                        fi
                    done
                    
                    # Verificar frontend
                    echo "Verificando frontend en puerto ${FRONTEND_PORT}..."
                    for i in {1..5}; do
                        if curl -f http://localhost:${FRONTEND_PORT} > /dev/null 2>&1; then
                            echo "✅ Frontend está saludable"
                            break
                        else
                            echo "⏳ Esperando frontend... intento $i/5"
                            sleep 5
                        fi
                        if [ $i -eq 5 ]; then
                            echo "❌ Frontend no responde después de 5 intentos"
                            exit 1
                        fi
                    done
                '''
            }
        }
        
        stage('Post-deploy Info') {
            steps {
                script {
                    echo "📊 Información del despliegue completado:"
                }
                
                sh '''
                    echo "=== INFORMACIÓN DEL DESPLIEGUE ==="
                    echo "🏷️  Proyecto: ${PROJECT_NAME}"
                    echo "🌿 Rama: ${TARGET_BRANCH}"
                    echo "📅 Fecha: $(date)"
                    echo "🔧 Commit: $(git rev-parse --short HEAD)"
                    echo ""
                    echo "=== SERVICIOS DESPLEGADOS ==="
                    echo "🖥️  Backend (GYMETR-login): http://localhost:${BACKEND_PORT}"
                    echo "🌐 Frontend (gymetra-frontend): http://localhost:${FRONTEND_PORT}"
                    echo ""
                    echo "=== ESTADO DE CONTENEDORES ==="
                    docker-compose -f ${DOCKER_COMPOSE_FILE} ps
                    echo ""
                    echo "=== LOGS RECIENTES ==="
                    docker-compose -f ${DOCKER_COMPOSE_FILE} logs --tail=10
                '''
            }
        }
    }
    
    post {
        always {
            script {
                echo "🔍 Ejecutando acciones post-despliegue..."
            }
            
            // Limpiar workspace si es necesario
            // cleanWs()
        }
        
        success {
            script {
                echo "✅ ¡Despliegue exitoso de GYMETRA!"
                echo "Backend disponible en: http://localhost:${BACKEND_PORT}"
                echo "Frontend disponible en: http://localhost:${FRONTEND_PORT}"
            }
            
            // Aquí puedes agregar notificaciones (email, Slack, etc.)
            // emailext (
            //     subject: "✅ GYMETRA - Despliegue Exitoso",
            //     body: "El despliegue de GYMETRA desde la rama develop ha sido exitoso.",
            //     to: "team@example.com"
            // )
        }
        
        failure {
            script {
                echo "❌ Error en el despliegue de GYMETRA"
            }
            
            // Logs de debug en caso de falla
            sh '''
                echo "=== LOGS DE DEBUG ==="
                docker-compose -f ${DOCKER_COMPOSE_FILE} logs || true
                docker ps -a || true
            '''
            
            // Notificación de fallo
            // emailext (
            //     subject: "❌ GYMETRA - Fallo en Despliegue",
            //     body: "Ha ocurrido un error durante el despliegue de GYMETRA desde la rama develop.",
            //     to: "team@example.com"
            // )
        }
        
        unstable {
            script {
                echo "⚠️ Despliegue inestable de GYMETRA"
            }
        }
    }
}