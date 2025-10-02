pipeline {
    agent any

    environment {
        GIT_REPO_URL = 'https://github.com/Sebas-Quiroga/GYMETRA-V1.git'
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        PROJECT_NAME = 'gymetra'
        BACKEND_PORT = '8080'
        FRONTEND_PORT = '8100'
        TARGET_BRANCH = 'qa-jenkis'
        BUILD_SUCCESS = 'false'
        BACKEND_BUILD_SUCCESS = 'false'
        FRONTEND_BUILD_SUCCESS = 'false'
        DEPLOY_SUCCESS = 'false'
        GIT_COMMIT_SHORT = ''
        BUILD_TIME = ''
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        retry(1)
        skipStagesAfterUnstable()
        skipDefaultCheckout(true) // evitamos el checkout automático para usar la lógica personalizada abajo
    }

    stages {
        stage('Checkout') {
            steps {
                script { echo "Checkout (shallow) de rama ${TARGET_BRANCH}" }
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${TARGET_BRANCH}"]],
                    userRemoteConfigs: [[url: GIT_REPO_URL]],
                    extensions: [
                        [$class: 'WipeWorkspace'],
                        [$class: 'CloneOption', depth: 1, noTags: true, shallow: true]
                    ]
                ])
                script {
                    // Capturar commit corto y hora de build para etiquetar imágenes
                    def shortSha = bat(script: '@echo off && git rev-parse --short HEAD', returnStdout: true).trim()
                    if(!shortSha || shortSha.trim().length()==0){
                        shortSha = 'local'
                    }
                    def buildTime = new Date().format("yyyy-MM-dd-HH-mm-ss")
                    env.GIT_COMMIT_SHORT = shortSha
                    env.BUILD_TIME = buildTime
                    echo "Commit: ${shortSha}  BuildTime: ${buildTime}"
                }
                script {
                    // Confirmar presencia de archivos clave
                    bat 'if exist docker-compose.yml (echo docker-compose.yml OK) else (echo FALTA docker-compose.yml & exit /b 2)'
                }
            }
        }

        stage('Environment Check') {
            steps {
                script {
                    echo "Checking deployment environment..."
                }

                // Verificar que Docker este disponible
                script {
                    // IMPORTANTE: En Windows el último ERRORLEVEL se conserva; si un findstr no encuentra coincidencias deja ERRORLEVEL=1 y el step falla.
                    // Añadimos for loop y reset explícito del ERRORLEVEL al final.
                    bat '''
                        @echo off
                        echo Checking Docker...
                        docker --version || exit /b 10
                        docker-compose --version || exit /b 11

                        echo Checking available ports...
                        for %%P in (8080 8100) do (
                            netstat -an | findstr :%%P >nul 2>&1
                            if errorlevel 1 (
                                echo Port %%P is available
                            ) else (
                                echo Port %%P is in use
                            )
                        )

                        echo Environment check completed successfully
                        rem Forzamos exit code 0 para que el stage no falle por un ERRORLEVEL heredado
                        cmd /c exit /b 0
                    '''
                }
            }
        }

        stage('Pre-deploy Cleanup') {
            steps {
                script {
                    echo "Cleaning previous deployment..."
                    try {
                        bat '''
                            docker-compose -f %DOCKER_COMPOSE_FILE% down --remove-orphans || echo "No containers to stop"
                            docker image prune -f || echo "No images to clean"
                            docker volume prune -f || echo "No volumes to clean"
                            echo Cleanup completed
                        '''
                    } catch (Exception e) {
                        echo "Cleanup encountered issues: ${e.getMessage()}"
                        echo "Continuing with deployment..."
                    }
                }
            }
        }

        stage('Build Services') {
            steps {
                script {
                    echo "Building gymetra-deploy-qa unified container..."
                    try {
                        bat '''
                            set DOCKER_BUILDKIT=1
                            set COMPOSE_DOCKER_CLI_BUILD=1
                            docker-compose -f %DOCKER_COMPOSE_FILE% build --progress=plain gymetra-deploy-qa
                        '''
                        env.BUILD_SUCCESS = 'true'
                        echo "Unified container build completed successfully"
                    } catch (Exception e) {
                        echo "Unified container build failed: ${e.getMessage()}"
                        env.BUILD_SUCCESS = 'false'
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }

        stage('Tag Images') {
            when {
                environment name: 'BUILD_SUCCESS', value: 'true'
            }
            steps {
                script {
                    echo "Tagging built image with commit and build time..."
                    echo "Using commit: ${env.GIT_COMMIT_SHORT}"
                    echo "Using build time: ${env.BUILD_TIME}"
                    
                    if (env.BUILD_SUCCESS == 'true' && env.GIT_COMMIT_SHORT && env.GIT_COMMIT_SHORT != 'null') {
                        try {
                            bat "docker image tag gymetra/deploy-qa:latest gymetra/deploy-qa:${env.GIT_COMMIT_SHORT}"
                            echo "Tagged unified container image with: ${env.GIT_COMMIT_SHORT}"
                        } catch (Exception e) {
                            echo "Failed to tag unified container image: ${e.getMessage()}"
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo "Deploying GYMETRA QA unified container..."
                    if (env.BUILD_SUCCESS == 'true') {
                        try {
                            bat """
                                echo Deploying with GIT_COMMIT: ${env.GIT_COMMIT_SHORT}
                                echo Deploying with BUILD_TIME: ${env.BUILD_TIME}
                                docker-compose -f %DOCKER_COMPOSE_FILE% up -d
                                echo Deployment completed
                                docker-compose -f %DOCKER_COMPOSE_FILE% ps
                            """
                            env.DEPLOY_SUCCESS = 'true'
                        } catch (Exception e) {
                            echo "Deployment failed: ${e.getMessage()}"
                            env.DEPLOY_SUCCESS = 'false'
                        }
                    } else {
                        echo "Skipping deployment - container build failed"
                        env.DEPLOY_SUCCESS = 'false'
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    if (env.DEPLOY_SUCCESS == 'true') {
                        echo "Checking unified container health..."
                        try {
                            bat '''
                                echo Waiting for services to be ready...
                                timeout /t 45 /nobreak
                                
                                echo Checking PostgreSQL on port 5000...
                                powershell -Command "try { $connection = New-Object System.Data.SqlClient.SqlConnection; $connection.ConnectionString = 'Server=localhost,5000;Database=gymdb;User Id=postgres;Password=123456;'; $connection.Open(); echo 'PostgreSQL is healthy'; $connection.Close(); } catch { echo 'PostgreSQL not responding yet...' }"
                                
                                echo Checking backend on port %BACKEND_PORT%...
                                powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:%BACKEND_PORT%/actuator/health' -TimeoutSec 10; if ($response.StatusCode -eq 200) { echo 'Backend is healthy' } else { echo 'Backend responded with code: ' + $response.StatusCode } } catch { echo 'Backend not responding - checking basic connectivity...' }"
                                
                                echo Checking frontend on port %FRONTEND_PORT%...
                                powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:%FRONTEND_PORT%' -TimeoutSec 10; if ($response.StatusCode -eq 200) { echo 'Frontend is healthy' } else { echo 'Frontend responded with code: ' + $response.StatusCode } } catch { echo 'Frontend not responding yet...' }"
                                
                                echo Checking container status...
                                docker ps --filter "name=gymetra-deploy-qa" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
                            '''
                        } catch (Exception e) {
                            echo "Health check encountered issues: ${e.getMessage()}"
                        }
                    } else {
                        echo "Skipping health check - deployment was not successful"
                    }
                }
            }
        }

        stage('Post-deploy Info') {
            steps {
                script {
                    echo "Completed deployment information:"
                    try {
                        bat '''
                            echo === DEPLOYMENT INFORMATION ===
                            echo Project: %PROJECT_NAME%
                            echo Branch: %TARGET_BRANCH%
                            echo Date: %date% %time%
                            echo Container: gymetra-deploy-qa (Unified QA Environment)
                            
                            echo === DEPLOYED SERVICES ===
                            echo PostgreSQL Database: localhost:5000
                            echo Backend API (GYMETR-login): http://localhost:%BACKEND_PORT%
                            echo Frontend Web (gymetra-frontend): http://localhost:%FRONTEND_PORT%
                            echo.
                            echo === CONTAINER STATUS ===
                            docker-compose -f %DOCKER_COMPOSE_FILE% ps
                            echo.
                            echo === RECENT LOGS ===
                            docker-compose -f %DOCKER_COMPOSE_FILE% logs --tail=10
                        '''
                    } catch (Exception e) {
                        echo "Could not retrieve deployment information: ${e.getMessage()}"
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                echo "Executing post-deployment actions..."
                echo "Build Status: ${currentBuild.currentResult}"
                if (env.BUILD_SUCCESS == 'true') {
                    echo "Build: SUCCESS"
                } else {
                    echo "Build: FAILED"
                }
                if (env.DEPLOY_SUCCESS == 'true') {
                    echo "Deploy: SUCCESS"
                } else {
                    echo "Deploy: FAILED"
                }
            }
        }

        success {
            script {
                echo "Successful deployment of GYMETRA QA!"
                echo "PostgreSQL Database: localhost:5000"
                echo "Backend API: http://localhost:${BACKEND_PORT}"
                echo "Frontend Web: http://localhost:${FRONTEND_PORT}"
                echo "Unified Container: gymetra-deploy-qa"
                echo "Deployment completed at: ${new Date()}"
            }
        }

        failure {
            script {
                echo "Error in GYMETRA deployment"
                echo "Please check the logs below for details:"
            }

            script {
                try {
                    bat '''
                        echo === DEBUG LOGS ===
                        echo === Container Status ===
                        docker ps -a || echo "Could not get container status"
                        echo.
                        echo === Docker Compose Logs ===
                        docker-compose -f %DOCKER_COMPOSE_FILE% logs --tail=50 || echo "Could not get compose logs"
                        echo.
                        echo === System Resources ===
                        docker system df || echo "Could not get system resources"
                    '''
                } catch (Exception e) {
                    echo "Could not retrieve debug information: ${e.getMessage()}"
                }
            }
        }

        unstable {
            script {
                echo "Deployment completed with warnings - GYMETRA QA"
                echo "Check unified container logs: docker logs gymetra-deploy-qa"
                echo "Monitor services: PostgreSQL (5000), Backend (8080), Frontend (8100)"
                echo "Some components may not be fully functional"
                echo "Please review the deployment status"
            }
        }

        cleanup {
            script {
                echo "Performing cleanup tasks for GYMETRA QA deployment..."
                echo "Container gymetra-deploy-qa remains running for QA environment"
                echo "Workspace cleanup preserving deployment state"
                // Clean up build artifacts but preserve deployment
            }
        }
    }
}