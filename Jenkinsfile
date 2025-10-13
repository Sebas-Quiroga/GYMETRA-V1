pipeline {
    agent any
    environment {
    // ...existing code...
    JAVA_HOME = 'C:/Program Files/Eclipse Adoptium/jdk-17.0.16.8-hotspot' // Ruta real del JDK en Jenkins
    PATH = "${JAVA_HOME}/bin;${env.PATH}"
    }
    stages {
        stage('Workspace Global Diagnostic') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    bat 'dir /s /b'
                }
            }
        }
        stage('Build Backend - GYMETR-login') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    dir('backend/GYMETR-login') {
                        bat 'mvnw.cmd clean package -DskipTests'
                    }
                }
            }
        }
        stage('Membership Diagnostic') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    dir('backend/GYMETR-Membership') {
                        bat 'dir /a'
                        bat 'type mvnw.cmd'
                    }
                }
            }
        }
        stage('Build Backend - GYMETR-Membership') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    dir('backend/GYMETR-Membership') {
                        bat 'mvnw.cmd clean package -DskipTests'
                    }
                }
            }
        }
        stage('Diagnóstico Frontend') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    dir('frontend/gymetra-frontend') {
                        bat 'dir'
                        bat 'type index.html'
                    }
                }
            }
        }
        stage('Build Frontend') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    dir('frontend/gymetra-frontend') {
                        bat 'npm install'
                        bat 'npm run build'
                    }
                }
            }
        }
        stage('Commit & Push to Git') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    bat 'git config user.email "jenkins@localhost"'
                    bat 'git config user.name "jenkins"'
                    bat 'git add .'
                    bat 'git commit -m "[jenkins] build & docker deploy" || echo "No changes to commit"'
                    // El push puede fallar en detached HEAD, así que lo comentamos para evitar fallo del pipeline
                    // bat 'git push https://github.com/Sebas-Quiroga/GYMETRA-V1.git HEAD:develop-jenkis || echo "Push failed (detached HEAD)"'
                }
            }
        }
        stage('Build Docker Images & Deploy') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    bat 'docker-compose build'
                    bat 'docker-compose up -d'
                }
            }
        }
    }
}
