# 🛠️ Configuración de Variables de Entorno - Admin Frontend

Este documento explica cómo configurar las variables de entorno necesarias para el funcionamiento del frontend de administración.

## 📁 Archivos de Entorno

### `.env.example`
- **Propósito**: Archivo de ejemplo que se sube a Git
- **Contenido**: Valores genéricos y placeholders
- **Uso**: Copiar para crear archivos locales

### `.env.development`
- **Propósito**: Configuración para desarrollo local
- **Contenido**: Valores reales para localhost
- **Uso**: Desarrollo diario, NO subir a Git

## 🚀 Configuración Inicial

1. **Copiar archivo de ejemplo**:
   ```bash
   cp .env.example .env.development
   ```

2. **Editar `.env.development`** con los valores reales.

## 📋 Variables Requeridas

### Puerto del Servidor
```env
VITE_PORT=8101
```
- Puerto donde corre el servidor de desarrollo de Vite
- Valor por defecto: 8101

### URLs de Backends
```env
VITE_API_URL_LOGIN=http://localhost:8080/api
VITE_API_URL_MEMBERSHIP=http://localhost:8081/api
VITE_API_URL_QR=http://localhost:8090/api
```
- URLs completas de los servicios backend
- Para desarrollo local, usar `localhost`
- Para producción, usar URLs absolutas del despliegue

### Configuración de AWS Cognito
```env
VITE_COGNITO_REGION=us-east-2
VITE_COGNITO_USER_POOL_ID=us-east-2_ckSy7zPAt
VITE_COGNITO_CLIENT_ID=3gnvfec5v6tfp32u634mq645ll
```
- Región de AWS donde está el User Pool
- ID del User Pool de Cognito
- Client ID de la aplicación en Cognito

## 🔧 Uso en el Código

Las variables se acceden mediante `import.meta.env`:

```typescript
// Ejemplo de uso
const apiUrl = import.meta.env.VITE_API_URL_LOGIN;
const cognitoRegion = import.meta.env.VITE_COGNITO_REGION;
```

## ⚠️ Consideraciones de Seguridad

- **Nunca subir `.env.development` a Git**
- **Usar `.env.example` como template**
- **Las credenciales reales deben mantenerse seguras**
- **Para producción, usar variables de entorno del servidor**

## 🐛 Solución de Problemas

### Error: "Variable no definida"
- Verificar que el archivo `.env.development` existe
- Reiniciar el servidor de desarrollo (`npm run dev`)
- Verificar que las variables empiecen con `VITE_`

### Error de conexión a backend
- Verificar que los backends estén corriendo en los puertos correctos
- Comprobar las URLs en las variables de entorno
- Revisar logs del navegador para errores de CORS

## 📞 Soporte

Si tienes problemas con la configuración, consulta:
- Documentación principal en la raíz del proyecto
- Equipo de desarrollo