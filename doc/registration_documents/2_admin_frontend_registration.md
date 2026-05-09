# Documento de Registro de Software - GYMETRA Admin Frontend

## 1. Información General
*   **Nombre**: GYMETRA Admin Dashboard
*   **Versión**: 1.0.0
*   **Lenguaje**: TypeScript (Vue.js 3, Vite)
*   **Framework UI**: Ionic Framework

## 2. Descripción Funcional
Aplicación web diseñada para la administración y monitoreo operativo de los gimnasios GYMETRA. Permite a los empleados administrativos gestionar el ecosistema completo del gimnasio.

### Funciones Principales:
*   **Gestión de Usuarios y Roles**: Interfaz para crear, editar y asignar permisos a socios y personal.
*   **Administración de Planes**: Interfaz CRUD para la oferta comercial del gimnasio.
*   **Dashboard de Métricas**: Visualización de indicadores clave (KPIs) como ingresos mensuales y picos de asistencia.
*   **Monitor de Acceso**: Vista en tiempo real de los ingresos y salidas registrados por el sistema de QR.

## 3. Descripción Técnica
*   **Estado Global**: Uso de Composition API (Vue 3).
*   **Consumo de APIs**: Axios para comunicación con microservicios.
*   **Visualización**: Integración de librerías de gráficos para reportes.

## 4. Algoritmos Representativos
*   **Filtros Dinámicos**: Algoritmo para filtrar grandes volúmenes de usuarios y logs de acceso en el cliente sin recargar la página.
*   **Gestión de Sesión**: Lógica de almacenamiento seguro del JWT y redirección basada en roles de administrador.

## 5. Muestra de Código Fuente
```vue
<template>
  <ion-page>
    <ion-title>Panel de Administración</ion-title>
    <div v-for="user in users" :key="user.id">
      {{ user.firstName }} - {{ user.status }}
    </div>
  </ion-page>
</template>
```
