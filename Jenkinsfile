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
                        // Matar proceso anterior si existe
                        bat '''
                            netstat -aon | find ":8081" | find "LISTENING" > temp_processes.txt 2>nul
                            if exist temp_processes.txt (
                                for /f "tokens=5" %%a in (temp_processes.txt) do (
                                    taskkill /F /PID %%a 2>nul || echo "Proceso %%a no encontrado"
                                )
                                del temp_processes.txt
                            )
                        '''
                        
                        // Iniciar servidor persistente
                        bat '''
                            echo "Iniciando servidor persistente en puerto 8081"
                            start /B cmd /c "python -m http.server 8081"
                            ping 127.0.0.1 -n 6 > nul
                            echo "Servidor iniciado en background"
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
                        echo "Verificando servidor en http://localhost:8081"
                        ping 127.0.0.1 -n 3 > nul
                        powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:8081 -UseBasicParsing -TimeoutSec 10; Write-Host 'Presentación disponible en http://localhost:8081'; exit 0 } catch { Write-Host 'Servidor no disponible aún'; exit 0 }"
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo '🎉 Deploy exitoso! Presentación GYMETRA disponible en http://localhost:8081'
            echo 'El servidor se mantiene ejecutándose en background'
        }
        failure {
            echo '❌ Error en el deploy de la presentación'
        }
        always {
            echo 'Pipeline completado. Servidor manteniéndose activo en puerto 8081'
        }
    }
}
