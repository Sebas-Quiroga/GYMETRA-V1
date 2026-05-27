# Documento de Registro de Software - GYMETRA Client Frontend

## 1. Información General
*   **Nombre**: GYMETRA User App
*   **Versión**: 1.0.0
*   **Lenguaje**: TypeScript (Vue.js 3, Vite)
*   **Framework UI**: Ionic Framework (Híbrido)

## 2. Descripción Funcional
Aplicación orientada al socio final, accesible desde dispositivos móviles y web. Enfocada en la experiencia del usuario y el acceso simplificado a los servicios del gimnasio.

### Funciones Principales:
*   **Generador de QR**: Generación dinámica de códigos de acceso basados en el estado de la membresía.
*   **Gestión de Planes**: Visualización de catálogo y compra de membresías mediante pasarela.
*   **Rutinas y Nutrición**: Visualización de contenidos personalizados según el nivel del socio.
*   **Perfil de Usuario**: Consulta de vigencia de membresía y datos personales.

## 3. Descripción Técnica
*   **Responsividad**: Diseño adaptable para móviles (Ionic Components).
*   **PWA Ready**: Configuración para ser instalado como aplicación web progresiva.
*   **Seguridad**: Manejo de autenticación delegada a Cognito.

## 4. Algoritmos Representativos
*   **Refresco de QR**: Lógica para re-generar el código QR cada vez que el usuario ingresa a la vista o después de un periodo de expiración local.
*   **Cálculo de Vigencia**: Algoritmo visual para mostrar el progreso de la membresía (días restantes).

## 5. Muestra de Código Fuente
```typescript
const generateAccessQR = () => {
  const token = localStorage.getItem('token');
  // Lógica para solicitar y renderizar el QR desde el servicio
  renderQR(token);
}
```
