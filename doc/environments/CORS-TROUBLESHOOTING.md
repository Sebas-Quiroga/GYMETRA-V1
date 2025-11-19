# 🔧 Solución de Problemas CORS con Dev Tunnels

## ❌ Error Común

```
Access to XMLHttpRequest at 'https://xxxx-8080.use.devtunnels.ms/api/auth/login' 
from origin 'https://xxxx-8100.use.devtunnels.ms' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔍 Pasos de Diagnóstico

### 1. Verificar que el Backend Esté Corriendo

**En tu terminal, verifica que el backend esté activo:**

```bash
# Verificar que el backend responda en localhost
curl http://localhost:8080/api/auth/login
# O visita: http://localhost:8080/swagger-ui.html
```

**Si el backend no responde:**
- Reinicia el backend
- Verifica que no haya errores en los logs
- Asegúrate de que el puerto 8080 no esté ocupado por otro proceso

### 2. Verificar que el Túnel del Backend Esté Activo

**En VS Code:**
1. Abre la **Vista de Puertos** (`Ctrl+Shift+P` → `Ports: Focus on Ports View`)
2. Verifica que el puerto **8080** esté en la lista
3. Verifica que esté configurado como **"Public"** (no "Private")
4. Deberías ver un enlace como: `https://xxxx-8080.use.devtunnels.ms`

**Si el túnel no está activo:**
- Haz clic derecho en el puerto 8080
- Selecciona **"Port Visibility"** → **"Public"**
- Espera a que VS Code genere el enlace público

### 3. Probar el Backend Directamente a Través del Túnel

**Abre el enlace del túnel del backend en tu navegador:**
```
https://xxxx-8080.use.devtunnels.ms/swagger-ui.html
```

**Si no carga:**
- El backend no está corriendo
- El túnel no está configurado correctamente
- Hay un problema de red/firewall

### 4. Verificar la Configuración de CORS

**El backend debe tener configurado CORS para permitir:**
- ✅ Túneles de dev tunnels: `*.use.devtunnels.ms`
- ✅ El origen específico del frontend

**Verifica en `SecurityConfig.java`:**
```java
configuration.addAllowedOriginPattern("https://*.use.devtunnels.ms");
configuration.addAllowedOriginPattern("http://*.use.devtunnels.ms");
```

### 5. Reiniciar el Backend Después de Cambios

**IMPORTANTE:** Después de cambiar la configuración de CORS, **DEBES reiniciar el backend** para que los cambios surtan efecto.

**Pasos:**
1. Detén el backend (Ctrl+C en la terminal)
2. Recompila el proyecto (si es necesario)
3. Inicia el backend nuevamente
4. Espera a que inicie completamente
5. Verifica que esté corriendo en `http://localhost:8080`

### 6. Verificar los Headers CORS en la Respuesta

**Abre las herramientas de desarrollador (F12) → Pestaña Network:**
1. Intenta hacer login
2. Busca la petición a `/api/auth/login`
3. Haz clic en la petición
4. Ve a la pestaña **"Headers"**
5. Busca en **"Response Headers"**:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Credentials`
   - `Access-Control-Allow-Methods`

**Si no aparecen estos headers:**
- El backend no está enviando los headers CORS
- La configuración de CORS no se está aplicando
- El backend necesita ser reiniciado

## ✅ Soluciones Comunes

### Solución 1: Reiniciar el Backend

```bash
# Detener el backend
Ctrl+C

# Reiniciar (dependiendo de cómo lo ejecutes)
# Si usas Maven:
cd backend/GYMETR-login
./mvnw spring-boot:run

# O si usas un script:
./run-backend.bat
```

### Solución 2: Verificar que el Túnel Esté Público

1. En VS Code, abre la vista de Puertos
2. Busca el puerto 8080
3. Si dice "Private", cambia a "Public"
4. Espera a que se genere el nuevo enlace

### Solución 3: Limpiar Cache del Navegador

1. Abre las herramientas de desarrollador (F12)
2. Clic derecho en el botón de recargar
3. Selecciona **"Vaciar caché y volver a cargar de forma forzada"**

### Solución 4: Verificar que el Backend Esté Accesible

**Prueba acceder directamente al backend a través del túnel:**

```bash
# En tu navegador o con curl:
curl https://xxxx-8080.use.devtunnels.ms/api/auth/login
```

**Si no responde:**
- El backend no está corriendo
- El túnel no está configurado correctamente
- Hay un problema de firewall

## 🔄 Checklist Completo

Antes de reportar un problema, verifica:

- [ ] El backend está corriendo en `localhost:8080`
- [ ] El túnel del puerto 8080 está configurado como **"Public"** en VS Code
- [ ] Puedes acceder a `https://xxxx-8080.use.devtunnels.ms/swagger-ui.html`
- [ ] El backend fue reiniciado después de cambiar la configuración de CORS
- [ ] Los headers CORS aparecen en la respuesta (ver Network tab)
- [ ] El frontend está usando la URL correcta del backend (verifica en la consola)
- [ ] No hay errores en la consola del backend

## 📝 Notas Importantes

1. **Los cambios en CORS requieren reiniciar el backend** - No se aplican en caliente
2. **El túnel debe ser "Public"** - Los túneles privados no funcionan para compartir
3. **El backend debe estar corriendo** - El túnel solo redirige, no inicia el backend
4. **Los túneles pueden cambiar** - Si reinicias VS Code, los enlaces pueden cambiar

## 🆘 Si Nada Funciona

1. **Verifica los logs del backend** - Puede haber errores que impiden que CORS funcione
2. **Prueba con localhost primero** - Si funciona en localhost pero no en el túnel, el problema es del túnel
3. **Verifica la versión de Spring Boot** - Algunas versiones tienen comportamientos diferentes con CORS
4. **Revisa el firewall** - Puede estar bloqueando las conexiones

