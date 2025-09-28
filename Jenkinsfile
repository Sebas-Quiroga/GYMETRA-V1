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
                    echo "Iniciando checkout de la rama ${TARGET_BRANCH}"
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
                    echo "Checkout completado desde la rama ${TARGET_BRANCH}"
                }
                
                bat '''
                    echo Verificando información del repositorio...
                    git branch -a
                    git log --oneline -n 5
                '''
            }
        }
        
        stage('Environment Check') {
            steps {
                script {
                    echo "Verificando el entorno de despliegue..."
                }
                
                // Verificar que Docker esté disponible
                bat '''
                    echo Verificando Docker...
                    docker --version
                    docker-compose --version
                    
                    echo Verificando puertos disponibles...
                    netstat -an | findstr :8080 && echo "Puerto 8080 esta en uso" || echo "Puerto 8080 esta disponible"
                    netstat -an | findstr :8100 && echo "Puerto 8100 esta en uso" || echo "Puerto 8100 esta disponible"
                    
                    echo Verificacion de entorno completada
                '''
            }
        }
        
        stage('Pre-deploy Cleanup') {
            steps {
                script {
                    echo "Limpiando despliegue anterior..."
                }
                
                // Detener y eliminar contenedores existentes
                bat '''
                    REM Detener contenedores existentes si están corriendo
                    docker-compose -f %DOCKER_COMPOSE_FILE% down --remove-orphans || echo "No hay contenedores para detener"
                    
                    REM Limpiar imágenes huérfanas
                    docker image prune -f || echo "No hay imagenes para limpiar"
                    
                    REM Limpiar volúmenes no utilizados
                    docker volume prune -f || echo "No hay volumenes para limpiar"
                    
                    echo Limpieza completada
                '''
            }
        }
        
        stage('Build Services') {
            parallel {
                stage('Build Backend') {
                    steps {
                        script {
                            echo "Construyendo el backend (GYMETR-login)..."
                        }
                        
                        bat '''
                            REM Construir la imagen del backend
                            docker-compose -f %DOCKER_COMPOSE_FILE% build backend
                            
                            echo Backend construido exitosamente
                        '''
                    }
                }
                
                stage('Build Frontend') {
                    steps {
                        script {
                            echo "Construyendo el frontend (gymetra-frontend)..."
                        }
                        
                        bat '''
                            REM Construir la imagen del frontend
                            docker-compose -f %DOCKER_COMPOSE_FILE% build frontend
                            
                            echo Frontend construido exitosamente
                        '''
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    echo "Desplegando aplicacion GYMETRA..."
                }
                
                bat '''
                    REM Desplegar todos los servicios
                    docker-compose -f %DOCKER_COMPOSE_FILE% up -d
                    
                    echo Despliegue completado
                    
                    REM Mostrar estado de los contenedores
                    docker-compose -f %DOCKER_COMPOSE_FILE% ps
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo "Verificando estado de salud de los servicios..."
                }
                
                bat '''
                    REM Esperar a que los servicios estén listos
                    echo Esperando que los servicios esten listos...
                    timeout /t 30 /nobreak
                    
                    REM Verificar backend - usando PowerShell para mejor manejo de HTTP
                    echo Verificando backend en puerto %BACKEND_PORT%...
                    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:%BACKEND_PORT%/actuator/health' -TimeoutSec 10; if ($response.StatusCode -eq 200) { echo 'Backend esta saludable' } else { echo 'Backend respondio con codigo: ' + $response.StatusCode } } catch { echo 'Backend no responde - esperando mas tiempo...' }"
                    
                    REM Verificar frontend
                    echo Verificando frontend en puerto %FRONTEND_PORT%...
                    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:%FRONTEND_PORT%' -TimeoutSec 10; if ($response.StatusCode -eq 200) { echo 'Frontend esta saludable' } else { echo 'Frontend respondio con codigo: ' + $response.StatusCode } } catch { echo 'Frontend no responde todavia...' }"
                '''
            }
        }
        
        stage('Post-deploy Info') {
            steps {
                script {
                    echo "Informacion del despliegue completado:"
                }
                
                bat '''
                    echo === INFORMACION DEL DESPLIEGUE ===
                    echo Proyecto: %PROJECT_NAME%
                    echo Rama: %TARGET_BRANCH%
                    echo Fecha: %date% %time%
                    for /f "tokens=*" %%i in ('git rev-parse --short HEAD') do echo Commit: %%i
                    echo.
                    echo === SERVICIOS DESPLEGADOS ===
                    echo Backend (GYMETR-login): http://localhost:%BACKEND_PORT%
                    echo Frontend (gymetra-frontend): http://localhost:%FRONTEND_PORT%
                    echo.
                    echo === ESTADO DE CONTENEDORES ===
                    docker-compose -f %DOCKER_COMPOSE_FILE% ps
                    echo.
                    echo === LOGS RECIENTES ===
                    docker-compose -f %DOCKER_COMPOSE_FILE% logs --tail=10
                '''
            }
        }
    }
    
    post {
        always {
            script {
                echo "Ejecutando acciones post-despliegue..."
            }
            
            // Limpiar workspace si es necesario
            // cleanWs()
        }
        
        success {
            script {
                echo "Despliegue exitoso de GYMETRA!"
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
                echo "Error en el despliegue de GYMETRA"
            }
            
            // Logs de debug en caso de falla
            bat '''
                echo === LOGS DE DEBUG ===
                docker-compose -f %DOCKER_COMPOSE_FILE% logs || echo "No se pudieron obtener logs"
                docker ps -a || echo "No se pudo obtener estado de contenedores"
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
                echo "Despliegue inestable de GYMETRA"
            }
        }
    }
}