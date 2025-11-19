# 🌐 Guía de Configuración de Dev Tunnels (Túneles Públicos)

Esta guía explica cómo configurar y usar los túneles públicos de VS Code para compartir tu aplicación local con otros usuarios a través de internet.

## 📋 Requisitos Previos

- Visual Studio Code con la extensión de Remote Development instalada
- Los servicios deben estar corriendo localmente en los puertos configurados

## 🚀 Configuración de Túneles

### Paso 1: Configurar el Túnel del Backend (Puerto 8080)

**IMPORTANTE**: Para que las peticiones funcionen correctamente, necesitas hacer forward del puerto del backend también.

1. Abre la **Vista de Puertos** en VS Code:
   - Presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
   - Escribe: `Ports: Focus on Ports View`
   - O haz clic en el ícono de "Ports" en la barra inferior

2. **Hacer Forward del Puerto 8080:**
   - En la lista de puertos, busca el puerto **8080** (o agrégalo manualmente)
   - Haz clic derecho en el puerto 8080
   - Selecciona **"Port Visibility"** → **"Public"**
   - VS Code generará un enlace público, por ejemplo:
     ```
     https://xxxx-8080.use.devtunnels.ms
     ```

3. **Anota el enlace del túnel del backend** - Lo necesitarás para verificar que todo funcione correctamente.

### Paso 2: Verificar los Túneles Configurados

Deberías tener los siguientes túneles públicos activos:

- **Frontend Principal (8100)**: `https://xxxx-8100.use.devtunnels.ms`
- **Admin Frontend (8101)**: `https://xxxx-8101.use.devtunnels.ms`
- **Backend API (8080)**: `https://xxxx-8080.use.devtunnels.ms` ⚠️ **REQUERIDO**

### Paso 3: Verificar que el Backend Esté Corriendo

Asegúrate de que tu backend esté corriendo localmente en el puerto 8080:

```bash
# Verificar que el backend esté activo
curl http://localhost:8080/api/health
# O visita en tu navegador: http://localhost:8080/swagger-ui.html
```

## 🔧 Cómo Funciona la Detección Automática

El código ha sido actualizado para detectar automáticamente si estás accediendo a través de un túnel público:

### Frontend (gymetra-frontend y admin-frontend)

1. **Detección Automática**: El código detecta si `window.location.hostname` contiene `devtunnels.ms` o `vscode-cdn.net`

2. **Construcción de URLs**: Si detecta un túnel, construye automáticamente la URL del backend basándose en el mismo dominio base:
   - Frontend: `https://xxxx-8100.use.devtunnels.ms`
   - Backend: `https://xxxx-8080.use.devtunnels.ms` (mismo dominio, puerto diferente)

3. **Fallback a Localhost**: Si no detecta un túnel, usa `http://localhost:8080` por defecto

### Backend (CORS)

El backend ha sido configurado para permitir peticiones desde:
- Dominios de dev tunnels: `*.use.devtunnels.ms` y `*.vscode-cdn.net`
- Localhost en todos los puertos configurados
- Cualquier dominio HTTP/HTTPS (patrones generales)

## ✅ Verificación

### 1. Verificar que los Túneles Estén Activos

En VS Code, en la vista de Puertos, deberías ver:
- ✅ Puerto 8100 - **Public** (Frontend)
- ✅ Puerto 8101 - **Public** (Admin Frontend)
- ✅ Puerto 8080 - **Public** (Backend) ⚠️ **CRÍTICO**

### 2. Probar el Frontend

1. Abre el enlace del túnel del frontend en tu navegador:
   ```
   https://xxxx-8100.use.devtunnels.ms
   ```

2. Abre la **Consola del Navegador** (F12 → Console)

3. Verifica que las URLs del backend se construyan correctamente:
   - Deberías ver en los logs URLs como: `https://xxxx-8080.use.devtunnels.ms/api/...`
   - NO deberías ver `http://localhost:8080` si estás en un túnel

### 3. Probar una Petición al Backend

En la consola del navegador, ejecuta:

```javascript
fetch('https://xxxx-8080.use.devtunnels.ms/api/auth/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

Si funciona, deberías ver una respuesta del backend.

## 🔍 Solución de Problemas

### Error: "Failed to fetch" o "CORS error"

**Causa**: El backend no está accesible a través del túnel o CORS no está configurado correctamente.

**Solución**:
1. Verifica que el puerto 8080 esté configurado como **Public** en VS Code
2. Verifica que el backend esté corriendo localmente
3. Revisa la consola del navegador para ver qué URL está intentando usar
4. Asegúrate de que el formato del túnel del backend sea: `https://xxxx-8080.use.devtunnels.ms`

### Las URLs del backend siguen siendo localhost

**Causa**: El código no está detectando correctamente el túnel.

**Solución**:
1. Verifica que estés accediendo a través del túnel público (no localhost)
2. Revisa la consola del navegador - deberías ver logs de las URLs construidas
3. Verifica que `window.location.hostname` contenga `devtunnels.ms`

### El túnel del backend tiene un formato diferente

**Causa**: VS Code puede generar túneles con formatos ligeramente diferentes.

**Solución**:
1. Si el formato es diferente, puedes configurar manualmente la URL del backend usando una variable de entorno:
   - Crea un archivo `.env` en `frontend/gymetra-frontend/`:
     ```
     VITE_API_HOST=https://tu-tunel-backend.use.devtunnels.ms
     ```
   - O en `frontend/admin-frontend/`:
     ```
     VITE_API_URL=https://tu-tunel-backend.use.devtunnels.ms/api
     ```

### El backend responde pero hay errores de autenticación

**Causa**: Los tokens JWT pueden tener problemas con dominios diferentes.

**Solución**:
1. Verifica que `allowCredentials: true` esté configurado en CORS
2. Asegúrate de que las cookies/tokens se estén enviando correctamente
3. Revisa los headers de las peticiones en la pestaña Network del navegador

## 📝 Notas Importantes

1. **Seguridad**: Los túneles públicos son temporales y expiran cuando cierras VS Code. No uses esto en producción.

2. **Rendimiento**: Los túneles públicos pueden tener latencia adicional comparado con localhost.

3. **Puerto del Backend**: Es **CRÍTICO** que el puerto 8080 esté configurado como túnel público para que las peticiones funcionen.

4. **Variables de Entorno**: Puedes usar variables de entorno para override manual si es necesario:
   - `VITE_API_HOST`: Para el host base del API
   - `VITE_API_URL`: Para la URL completa del API (admin-frontend)
   - `VITE_API_BASE_URL`: Para la URL base del API de membresías

## 🔗 Enlaces Útiles

- [Documentación oficial de VS Code Port Forwarding](https://code.visualstudio.com/docs/remote/port-forwarding)
- [VS Code Dev Tunnels](https://code.visualstudio.com/docs/remote/tunnels)

