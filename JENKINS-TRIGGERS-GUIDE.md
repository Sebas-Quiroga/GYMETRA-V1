# 🎯 Guía Rápida - Configuración de Triggers Jenkins

## ✅ Configuración de Build Triggers

### En la sección "Build Triggers" de Jenkins:

```
☑️ GitHub hook trigger for GITScm polling
   └── (Solo marcar la casilla, sin configuración adicional)

☑️ Consultar repositorio (SCM)  
   └── Schedule: H/5 * * * *

❌ Build when a change is pushed to GitLab
   └── (NO marcar - tu repo está en GitHub)

❌ Construir tras otros proyectos
   └── (NO marcar - no hay dependencias)

❌ Ejecutar periódicamente
   └── (NO marcar - no necesitas builds sin cambios)

❌ Lanzar ejecuciones remotas
   └── (NO marcar - no necesitas triggers externos)
```

## 🔄 Cómo Funcionan los Triggers Configurados

### 1. GitHub hook trigger for GITScm polling
- **Cuándo se activa**: Cuando haces `git push` a la rama `develop`
- **Tiempo de respuesta**: Inmediato (segundos)
- **Requisito**: Webhook configurado en GitHub

### 2. Consultar repositorio (SCM) - Schedule: H/5 * * * *
- **Cuándo se activa**: Cada 5 minutos revisa si hay cambios
- **Propósito**: Backup por si el webhook falla
- **Tiempo de respuesta**: Máximo 5 minutos

## 🌐 Configuración del Webhook en GitHub

Para que el primer trigger funcione, necesitas configurar el webhook:

1. **En GitHub**: Ve a tu repositorio → Settings → Webhooks
2. **Add webhook**:
   - **Payload URL**: `http://tu-servidor-jenkins:9050/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: "Just the push event"
   - **Active**: ☑️

## 📊 Flujo de Despliegue Automático

```
📝 Código en develop
    ↓
🔄 git push origin develop  
    ↓
🌐 GitHub envía webhook
    ↓  
⚡ Jenkins recibe trigger
    ↓
🏗️ Inicia pipeline automáticamente
    ↓
🐳 Docker build & deploy
    ↓
✅ Aplicación en localhost:8080 y localhost:8100
```

## 🔍 Verificación de Configuración

### Después de configurar, verifica:

1. **Build Triggers están correctos**: 
   - Solo 2 triggers marcados como se muestra arriba

2. **Webhook funciona**:
   - Haz un cambio pequeño en develop
   - Push el cambio
   - Jenkins debe iniciar build automáticamente

3. **Polling funciona**:
   - Si el webhook falla, Jenkins revisará cada 5 minutos

## 🚨 Troubleshooting de Triggers

### Problema: Jenkins no se ejecuta automáticamente
**Verificar**:
1. Webhook URL está correcto en GitHub
2. Jenkins es accesible desde internet (para webhooks)
3. Triggers están habilitados correctamente

### Problema: Muchos builds innecesarios
**Causa**: Triggers incorrectos activados
**Solución**: Desactivar triggers no necesarios como se muestra arriba

---
*Guía específica para GYMETRA-V1 en rama develop*