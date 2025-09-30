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
                        bat '''
                            echo "Sirviendo presentación en http://localhost:8081"
                            start /B python -m http.server 8081
                            timeout /t 5 >nul
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
                    bat '''
                        powershell -Command "try { Invoke-WebRequest -Uri http://localhost:8081 -UseBasicParsing | Out-Null; Write-Host 'Presentación disponible en http://localhost:8081' } catch { exit 1 }"
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
            bat '''
                for /f "tokens=5" %%a in ('netstat -aon ^| find ":8081" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul || echo "No hay procesos en puerto 8081"
            '''
        }
    }
}
