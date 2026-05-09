# Guía de Instalación y Configuración - GYMETRA

Esta guía describe los pasos necesarios para desplegar la plataforma GYMETRA en un entorno local de desarrollo.

## Prerrequisitos
*   **Docker** y **Docker Compose** (recomendado).
*   **Java 17** (si se ejecuta sin Docker).
*   **Node.js 18+** (si se ejecuta sin Docker).
*   **PostgreSQL 14+**.

## 1. Clonar el Repositorio
```bash
git clone https://github.com/Sebas-Quiroga/GYMETRA-V1.git
cd GYMETRA-V1
```

## 2. Configuración de Variables de Entorno
Cree archivos `.env` basados en los ejemplos proporcionados en cada directorio de servicio.
Principales variables:
*   `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
*   `COGNITO_ISSUER`, `COGNITO_CLIENT_ID`
*   `STRIPE_API_KEY`

## 3. Despliegue con Docker Compose
El método más sencillo es utilizar el archivo `docker-compose.yml` en la raíz:
```bash
docker-compose up -d
```
Esto levantará:
*   Base de Datos PostgreSQL.
*   Servicio de Login (Puerto 8080).
*   Servicio de Membresías (Puerto 8081).
*   Servicio de QR (Puerto 8082).
*   Frontend Usuario (Puerto 8100).
*   Frontend Admin (Puerto 8101).

## 4. Inicialización de la Base de Datos
Ejecute los scripts ubicados en `data/Database-Setup/`:
1.  `database_Initial.sql`: Crea la estructura de tablas.
2.  `test_data.sql`: Carga datos de prueba iniciales.

## 5. Acceso a las Aplicaciones
*   **Frontend Usuario**: `http://localhost:8100`
*   **Frontend Administrador**: `http://localhost:8101`
*   **Documentación API (Swagger)**: `http://localhost:8080/swagger-ui.html`
