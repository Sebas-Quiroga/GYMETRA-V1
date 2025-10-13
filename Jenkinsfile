pipeline {
    agent any
    environment {
    // ...existing code...
    JAVA_HOME = 'C:/Program Files/Eclipse Adoptium/jdk-17.0.16.8-hotspot' // Ruta real del JDK en Jenkins
    PATH = "${JAVA_HOME}/bin;${env.PATH}"
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
        stage('Diagnóstico archivos Membership') {
            steps {
                dir('backend/GYMETR-Membership') {
                    bat 'dir /a'
                    bat 'type mvnw.cmd'
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
