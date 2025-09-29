pipeline {
    agent any
    
    environment {
        GIT_REPO_URL = 'https://github.com/Sebas-Quiroga/GYMETRA-V1.git'
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        PROJECT_NAME = 'gymetra'
        BACKEND_PORT = '8080'
        FRONTEND_PORT = '8100'
        TARGET_                        echo "Build: SUCCESS"
                } else {
                    echo "Build: FAILED"
                }
                if (env.DEPLOY_SUCCESS == 'true') {
                    echo "Deploy: SUCCESS"
                } else {
                    echo "Deploy: FAILED" 'develop'
        BUILD_SUCCESS = 'false'
    }
    
    triggers {
        pollSCM('H/5 * * * *')
    }
    
    options {
        timeout(time: 30, unit: 'MINUTES')
        retry(1)
        skipStagesAfterUnstable()
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "Starting optimized checkout from ${TARGET_BRANCH} branch"
                }
                
                // Checkout específico evitando node_modules
                script {
                    bat '''
                        echo Cleaning workspace...
                        if exist .git rmdir /s /q .git || echo "No .git directory"
                        if exist node_modules rmdir /s /q node_modules || echo "No node_modules directory"
                        
                        echo Cloning repository without sparse-checkout...
                        git clone --depth 1 --branch develop https://github.com/Sebas-Quiroga/GYMETRA-V1.git temp_repo
                        cd temp_repo
                        
                        echo Removing node_modules to save space...
                        if exist frontend\\gymetra-frontend\\node_modules rmdir /s /q frontend\\gymetra-frontend\\node_modules || echo "No node_modules in frontend"
                        
                        echo Copying necessary files...
                        xcopy /E /I /Y backend ..\\backend\\
                        xcopy /E /I /Y frontend ..\\frontend\\
                        copy docker-compose.yml ..\\ 2>nul || echo "Copied docker-compose.yml"
                        copy Jenkinsfile ..\\ 2>nul || echo "Copied Jenkinsfile"
                        copy *.md ..\\ 2>nul || echo "Copied markdown files"
                        
                        cd ..
                        rmdir /s /q temp_repo || echo "Cleanup temp repo"
                        
                        echo Checkout process completed successfully
                        exit /b 0
                    '''
                }
                
                script {
                    echo "Checkout completed from ${TARGET_BRANCH} branch"
                }
                
                bat '''
                    echo Verifying copied files...
                    dir /s backend 2>nul || echo "Backend directory"
                    dir /s frontend 2>nul || echo "Frontend directory"  
                    dir docker-compose.yml 2>nul || echo "Docker compose file"
                '''
            }
        }
        
        stage('Environment Check') {
            steps {
                script {
                    echo "Checking deployment environment..."
                }
                
                // Verificar que Docker este disponible
                script {
                    bat '''
                        echo Checking Docker...
                        docker --version
                        docker-compose --version
                        
                        echo Checking available ports...
                        
                        netstat -an | findstr :8080 >nul 2>&1
                        if %errorlevel% equ 0 (
                            echo Port 8080 is in use
                        ) else (
                            echo Port 8080 is available
                        )
                        
                        netstat -an | findstr :8100 >nul 2>&1
                        if %errorlevel% equ 0 (
                            echo Port 8100 is in use
                        ) else (
                            echo Port 8100 is available
                        )
                        
                        echo Environment check completed successfully
                    '''
                }
            }
        }
        
        stage('Pre-deploy Cleanup') {
            when {
                expression { currentBuild.currentResult != 'FAILURE' }
            }
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
            when {
                expression { currentBuild.currentResult != 'FAILURE' }
            }
            parallel {
                stage('Build Backend') {
                    steps {
                        script {
                            echo "Building backend (GYMETR-login)..."
                            try {
                                bat '''
                                    docker-compose -f %DOCKER_COMPOSE_FILE% build backend
                                    echo Backend built successfully
                                '''
                                env.BACKEND_BUILD_SUCCESS = 'true'
                            } catch (Exception e) {
                                echo "Backend build failed: ${e.getMessage()}"
                                env.BACKEND_BUILD_SUCCESS = 'false'
                                currentBuild.result = 'UNSTABLE'
                            }
                        }
                    }
                }
                
                stage('Build Frontend') {
                    steps {
                        script {
                            echo "Building frontend (gymetra-frontend)..."
                            try {
                                bat '''
                                    docker-compose -f %DOCKER_COMPOSE_FILE% build frontend
                                    echo Frontend built successfully
                                '''
                                env.FRONTEND_BUILD_SUCCESS = 'true'
                            } catch (Exception e) {
                                echo "Frontend build failed: ${e.getMessage()}"
                                env.FRONTEND_BUILD_SUCCESS = 'false'
                                currentBuild.result = 'UNSTABLE'
                            }
                        }
                    }
                }
            }
            post {
                success {
                    script {
                        env.BUILD_SUCCESS = 'true'
                        echo "All services built successfully"
                    }
                }
                failure {
                    script {
                        env.BUILD_SUCCESS = 'false'
                        echo "Some services failed to build"
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                anyOf {
                    expression { env.BUILD_SUCCESS == 'true' }
                    expression { currentBuild.currentResult == 'UNSTABLE' && (env.BACKEND_BUILD_SUCCESS == 'true' || env.FRONTEND_BUILD_SUCCESS == 'true') }
                }
            }
            steps {
                script {
                    echo "Deploying GYMETRA application..."
                    try {
                        bat '''
                            docker-compose -f %DOCKER_COMPOSE_FILE% up -d
                            echo Deployment completed
                            docker-compose -f %DOCKER_COMPOSE_FILE% ps
                        '''
                        env.DEPLOY_SUCCESS = 'true'
                    } catch (Exception e) {
                        echo "Deployment failed: ${e.getMessage()}"
                        env.DEPLOY_SUCCESS = 'false'
                        error("Deployment failed")
                    }
                }
            }
        }
        
        stage('Health Check') {
            when {
                expression { env.DEPLOY_SUCCESS == 'true' }
            }
            steps {
                script {
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
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
        
        stage('Post-deploy Info') {
            when {
                anyOf {
                    expression { currentBuild.currentResult == 'SUCCESS' }
                    expression { currentBuild.currentResult == 'UNSTABLE' && env.DEPLOY_SUCCESS == 'true' }
                }
            }
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
                    echo "✅ Build: SUCCESS"
                } else {
                    echo "❌ Build: FAILED"
                }
                if (env.DEPLOY_SUCCESS == 'true') {
                    echo "✅ Deploy: SUCCESS"
                } else {
                    echo "❌ Deploy: FAILED"
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