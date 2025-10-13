pipeline {
    agent any
    environment {
        GIT_CREDENTIALS_ID = 'git-credentials-id' // Cambia esto por el ID real de tus credenciales en Jenkins
    }
    stages {
        stage('Build Backend - GYMETR-login') {
            steps {
                dir('backend/GYMETR-login') {
                    bat 'mvnw.cmd clean package -DskipTests'
                }
            }
        }
        stage('Build Backend - GYMETR-Membership') {
            steps {
                dir('backend/GYMETR-Membership') {
                    bat 'mvnw.cmd clean package -DskipTests'
                }
            }
        }
        stage('Build Frontend') {
            steps {
                dir('frontend/gymetra-frontend') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }
        stage('Commit & Push to Git') {
            steps {
                bat 'git config user.email "jenkins@localhost"'
                bat 'git config user.name "jenkins"'
                bat 'git add .'
                bat 'git commit -m "[jenkins] build & docker deploy" || echo "No changes to commit"'
                bat 'git push https://github.com/Sebas-Quiroga/GYMETRA-V1.git HEAD:develop-jenkis'
            }
        }
        stage('Build Docker Images & Deploy') {
            steps {
                bat 'docker-compose build'
                bat 'docker-compose up -d'
            }
        }
    }
}
