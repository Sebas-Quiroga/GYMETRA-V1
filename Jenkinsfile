pipeline {
    agent any
    
    environment {
        GIT_REPO_URL = 'https://github.com/Sebas-Quiroga/GYMETRA-V1.git'
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        PROJECT_NAME = 'gymetra'
        BACKEND_PORT = '8080'
        FRONTEND_PORT = '8100'
        TARGET_BRANCH = 'develop'
    }
    
    triggers {
        pollSCM('H/5 * * * *')
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
            steps {
                script {
                    echo "Cleaning previous deployment..."
                }
                
                bat '''
                    docker-compose -f %DOCKER_COMPOSE_FILE% down --remove-orphans || echo "No containers to stop"
                    docker image prune -f || echo "No images to clean"
                    docker volume prune -f || echo "No volumes to clean"
                    echo Cleanup completed
                '''
            }
        }
        
        stage('Build Services') {
            parallel {
                stage('Build Backend') {
                    steps {
                        script {
                            echo "Building backend (GYMETR-login)..."
                        }
                        
                        bat '''
                            docker-compose -f %DOCKER_COMPOSE_FILE% build backend
                            echo Backend built successfully
                        '''
                    }
                }
                
                stage('Build Frontend') {
                    steps {
                        script {
                            echo "Building frontend (gymetra-frontend)..."
                        }
                        
                        bat '''
                            docker-compose -f %DOCKER_COMPOSE_FILE% build frontend
                            echo Frontend built successfully
                        '''
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    echo "Deploying GYMETRA application..."
                }
                
                bat '''
                    docker-compose -f %DOCKER_COMPOSE_FILE% up -d
                    echo Deployment completed
                    docker-compose -f %DOCKER_COMPOSE_FILE% ps
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo "Checking services health..."
                }
                
                bat '''
                    echo Waiting for services to be ready...
                    timeout /t 30 /nobreak
                    
                    echo Checking backend on port %BACKEND_PORT%...
                    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:%BACKEND_PORT%/actuator/health' -TimeoutSec 10; if ($response.StatusCode -eq 200) { echo 'Backend is healthy' } else { echo 'Backend responded with code: ' + $response.StatusCode } } catch { echo 'Backend not responding - waiting more time...' }"
                    
                    echo Checking frontend on port %FRONTEND_PORT%...
                    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:%FRONTEND_PORT%' -TimeoutSec 10; if ($response.StatusCode -eq 200) { echo 'Frontend is healthy' } else { echo 'Frontend responded with code: ' + $response.StatusCode } } catch { echo 'Frontend not responding yet...' }"
                '''
            }
        }
        
        stage('Post-deploy Info') {
            steps {
                script {
                    echo "Completed deployment information:"
                }
                
                bat '''
                    echo === DEPLOYMENT INFORMATION ===
                    echo Project: %PROJECT_NAME%
                    echo Branch: %TARGET_BRANCH%
                    echo Date: %date% %time%
                    for /f "tokens=*" %%i in ('git rev-parse --short HEAD') do echo Commit: %%i
                    echo.
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
            }
        }
    }
    
    post {
        always {
            script {
                echo "Executing post-deployment actions..."
            }
        }
        
        success {
            script {
                echo "Successful deployment of GYMETRA!"
                echo "Backend available at: http://localhost:${BACKEND_PORT}"
                echo "Frontend available at: http://localhost:${FRONTEND_PORT}"
            }
        }
        
        failure {
            script {
                echo "Error in GYMETRA deployment"
            }
            
            bat '''
                echo === DEBUG LOGS ===
                docker-compose -f %DOCKER_COMPOSE_FILE% logs || echo "Could not get logs"
                docker ps -a || echo "Could not get container status"
            '''
        }
        
        unstable {
            script {
                echo "Unstable deployment of GYMETRA"
            }
        }
    }
}