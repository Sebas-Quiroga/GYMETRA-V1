pipeline {
    agent any

    environment {
        GIT_REPO_URL = 'https://github.com/Sebas-Quiroga/GYMETRA-V1.git'
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        PROJECT_NAME = 'gymetra'
        BACKEND_PORT = '8080'
        FRONTEND_PORT = '8100'
        TARGET_BRANCH = 'develop'
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
            parallel {
                stage('Build Backend') {
                    steps {
                        script {
                            echo "Building backend (GYMETR-login)..."
                            try {
                                withEnv(["GIT_COMMIT=${env.GIT_COMMIT_SHORT}", "BUILD_TIME=${env.BUILD_TIME}"]) {
                                    def result = bat(returnStatus: true, script: '''
                                        echo DEBUG: GIT_COMMIT_SHORT = %GIT_COMMIT%
                                        echo DEBUG: BUILD_TIME = %BUILD_TIME%
                                        docker-compose -f %DOCKER_COMPOSE_FILE% build backend
                                        if %errorlevel% neq 0 exit /b %errorlevel%
                                        
                                        if not "%GIT_COMMIT%"=="null" (
                                            docker image tag gymetra/backend:latest gymetra/backend:%GIT_COMMIT%
                                            echo Tagged backend image with: %GIT_COMMIT%
                                        ) else (
                                            echo WARNING: GIT_COMMIT es null, se omite tag secundario backend
                                        )
                                        
                                        echo Backend built successfully
                                    ''')
                                    if (result == 0) {
                                        env.BACKEND_BUILD_SUCCESS = 'true'
                                        echo "Backend build completed successfully"
                                    } else {
                                        env.BACKEND_BUILD_SUCCESS = 'false'
                                        echo "Backend build failed with exit code: ${result}"
                                    }
                                }
                            } catch (Exception e) {
                                echo "Backend build failed: ${e.getMessage()}"
                                env.BACKEND_BUILD_SUCCESS = 'false'
                            }
                        }
                    }
                }

                stage('Build Frontend') {
                    steps {
                        script {
                            echo "Building frontend (gymetra-frontend)..."
                            try {
                                withEnv(["GIT_COMMIT=${env.GIT_COMMIT_SHORT}", "BUILD_TIME=${env.BUILD_TIME}"]) {
                                    def result = bat(returnStatus: true, script: '''
                                        echo DEBUG: GIT_COMMIT_SHORT = %GIT_COMMIT%
                                        echo DEBUG: BUILD_TIME = %BUILD_TIME%
                                        docker-compose -f %DOCKER_COMPOSE_FILE% build frontend
                                        if %errorlevel% neq 0 exit /b %errorlevel%
                                        
                                        if not "%GIT_COMMIT%"=="null" (
                                            docker image tag gymetra/frontend:latest gymetra/frontend:%GIT_COMMIT%
                                            echo Tagged frontend image with: %GIT_COMMIT%
                                        ) else (
                                            echo WARNING: GIT_COMMIT es null, se omite tag secundario frontend
                                        )
                                        
                                        echo Frontend built successfully
                                    ''')
                                    if (result == 0) {
                                        env.FRONTEND_BUILD_SUCCESS = 'true'
                                        echo "Frontend build completed successfully"
                                    } else {
                                        env.FRONTEND_BUILD_SUCCESS = 'false'
                                        echo "Frontend build failed with exit code: ${result}"
                                    }
                                }
                            } catch (Exception e) {
                                echo "Frontend build failed: ${e.getMessage()}"
                                env.FRONTEND_BUILD_SUCCESS = 'false'
                            }
                        }
                    }
                }
            }
            post {
                always {
                    script {
                        echo "DEBUG: BACKEND_BUILD_SUCCESS = ${env.BACKEND_BUILD_SUCCESS}"
                        echo "DEBUG: FRONTEND_BUILD_SUCCESS = ${env.FRONTEND_BUILD_SUCCESS}"

                        if (env.BACKEND_BUILD_SUCCESS == 'true' && env.FRONTEND_BUILD_SUCCESS == 'true') {
                            env.BUILD_SUCCESS = 'true'
                            echo "All services built successfully"
                        } else if (env.BACKEND_BUILD_SUCCESS == 'true' || env.FRONTEND_BUILD_SUCCESS == 'true') {
                            env.BUILD_SUCCESS = 'partial'
                            echo "Some services built successfully"
                        } else {
                            env.BUILD_SUCCESS = 'false'
                            echo "Build failed"
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo "Deploying GYMETRA application..."
                    if (env.BUILD_SUCCESS == 'true' || env.BUILD_SUCCESS == 'partial') {
                        try {
                            withEnv(["GIT_COMMIT=${env.GIT_COMMIT_SHORT}", "BUILD_TIME=${env.BUILD_TIME}"]) {
                                bat '''
                                    docker-compose -f %DOCKER_COMPOSE_FILE% up -d
                                    echo Deployment completed
                                    docker-compose -f %DOCKER_COMPOSE_FILE% ps
                                '''
                            }
                            env.DEPLOY_SUCCESS = 'true'
                        } catch (Exception e) {
                            echo "Deployment failed: ${e.getMessage()}"
                            env.DEPLOY_SUCCESS = 'false'
                        }
                    } else {
                        echo "Skipping deployment - no services built successfully"
                        env.DEPLOY_SUCCESS = 'false'
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    if (env.DEPLOY_SUCCESS == 'true') {
                        echo "Checking services health..."
                        try {
                            bat '''
                                echo Waiting for services to be ready...
                                timeout /t 30 /nobreak
                                
                                echo Checking backend on port %BACKEND_PORT%...
                                powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:%BACKEND_PORT%/actuator/health' -TimeoutSec 10; if ($response.StatusCode -eq 200) { echo 'Backend is healthy' } else { echo 'Backend responded with code: ' + $response.StatusCode } } catch { echo 'Backend not responding - checking basic connectivity...' }"
                                
                                echo Checking frontend on port %FRONTEND_PORT%...
                                powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:%FRONTEND_PORT%' -TimeoutSec 10; if ($response.StatusCode -eq 200) { echo 'Frontend is healthy' } else { echo 'Frontend responded with code: ' + $response.StatusCode } } catch { echo 'Frontend not responding yet...' }"
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
                            
                            echo === DEPLOYED SERVICES ===
                            echo Backend (GYMETR-login): http://localhost:%BACKEND_PORT%
                            echo Frontend (gymetra-frontend): http://localhost:%FRONTEND_PORT%
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
                echo "Successful deployment of GYMETRA!"
                echo "Backend available at: http://localhost:${BACKEND_PORT}"
                echo "Frontend available at: http://localhost:${FRONTEND_PORT}"
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
                echo "Unstable deployment of GYMETRA"
                echo "Some components may not be fully functional"
                if (env.BACKEND_BUILD_SUCCESS == 'true' && env.FRONTEND_BUILD_SUCCESS != 'true') {
                    echo "Backend deployed successfully, but frontend had issues"
                } else if (env.FRONTEND_BUILD_SUCCESS == 'true' && env.BACKEND_BUILD_SUCCESS != 'true') {
                    echo "Frontend deployed successfully, but backend had issues"
                }
            }
        }

        cleanup {
            script {
                echo "Performing cleanup tasks..."
                // Clean up workspace if needed, but preserve deployment
            }
        }
    }
}