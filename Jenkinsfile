pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Clonando repositorio...'
                checkout scm
            }
        }
        
        stage('Deploy Presentation') {
            steps {
                script {
                    echo 'Iniciando servidor para presentación GYMETRA...'
                    dir('doc/manual/Presentacion GYMETRA') {
                        // Servir el index.html usando Python HTTP server
                        sh '''
                            echo "Sirviendo presentación en http://localhost:8081"
                            python3 -m http.server 8081 &
                            echo $! > server.pid
                            sleep 5
                            echo "Servidor iniciado correctamente"
                        '''
                    }
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo 'Verificando que la presentación esté disponible...'
                    sh '''
                        curl -f http://localhost:8081/ || exit 1
                        echo "✅ Presentación disponible en http://localhost:8081"
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo '🎉 Deploy exitoso! Presentación GYMETRA disponible en http://localhost:8081'
        }
        failure {
            echo '❌ Error en el deploy de la presentación'
        }
        always {
            echo 'Limpiando procesos...'
            sh '''
                if [ -f "doc/manual/Presentacion GYMETRA/server.pid" ]; then
                    kill $(cat "doc/manual/Presentacion GYMETRA/server.pid") || true
                    rm "doc/manual/Presentacion GYMETRA/server.pid" || true
                fi
            '''
        }
    }
}
