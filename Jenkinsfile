# Jenkins pipeline for GYMETRA-V1
pipeline {
    agent any
    environment {
        GIT_CREDENTIALS_ID = 'git-credentials-id' // Cambia esto por el ID real de tus credenciales en Jenkins
    }
    stages {
        stage('Build Backend - GYMETR-login') {
            steps {
                dir('backend/GYMETR-login') {
                    sh 'chmod +x mvnw || exit 0'
                    sh './mvnw clean package -DskipTests'
                }
            }
        }
        stage('Build Backend - GYMETR-Membership') {
            steps {
                dir('backend/GYMETR-Membership') {
                    sh 'chmod +x mvnw || exit 0'
                    sh './mvnw clean package -DskipTests'
                }
            }
        }
        stage('Build Frontend') {
            steps {
                dir('frontend/gymetra-frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
        stage('Commit & Push to Git') {
            steps {
                sh '''
                    git config user.email "jenkins@localhost"
                    git config user.name "jenkins"
                    git add .
                    git commit -m "[jenkins] build & docker deploy" || echo "No changes to commit"
                    git push https://github.com/Sebas-Quiroga/GYMETRA-V1.git HEAD:develop-jenkis
                '''
            }
        }
        stage('Build Docker Images & Deploy') {
            steps {
                sh 'docker-compose build'
                sh 'docker-compose up -d'
            }
        }
    }
}
