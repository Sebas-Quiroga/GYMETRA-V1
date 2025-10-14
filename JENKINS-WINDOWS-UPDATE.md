# 🔧 Jenkinsfile para Windows - Notas de Actualización

## ✅ Cambios Realizados

El Jenkinsfile ha sido actualizado para funcionar correctamente en **Jenkins corriendo en Windows**. Los cambios principales son:

### 🔄 Cambios de Comandos

| Antes (Linux) | Ahora (Windows) | Propósito |
|---------------|-----------------|-----------|
| `sh 'command'` | `bat 'command'` | Ejecución de comandos |
| `sleep 30` | `timeout /t 30 /nobreak` | Esperar 30 segundos |
| `curl -f url` | `powershell Invoke-WebRequest` | Verificar URLs |
| `netstat -tuln` | `netstat -an` | Ver puertos |
| `$(date)` | `%date% %time%` | Fecha y hora |
| `${VAR}` | `%VAR%` | Variables de entorno |

### 🏥 Health Checks Mejorados

- Se usa PowerShell para verificar URLs HTTP de manera más robusta
- Mejor manejo de errores y timeouts
- Mensajes más claros sobre el estado de los servicios

### 📋 Comandos de Limpieza

- Uso de `||` para continuar si los comandos fallan
- Comandos de Docker adaptados para Windows
- Mejor manejo de errores

## 🚀 Cómo Usar

1. **Hacer commit y push** del Jenkinsfile actualizado
2. **Ejecutar el pipeline** en Jenkins
3. **Verificar** que todos los stages se ejecuten correctamente

## 🔍 Troubleshooting Windows

### Problema: PowerShell no disponible
**Solución**: Verificar que PowerShell esté en PATH o usar comandos CMD alternativos

### Problema: Docker no reconocido
**Solución**: Verificar que Docker Desktop esté instalado y corriendo en Windows

### Problema: Variables de entorno no se expanden
**Solución**: Usar `%VAR%` en lugar de `$VAR` o `${VAR}`

---
*Actualizado para Jenkins en Windows - Septiembre 2025*