# 🏋️‍♂️ Sistema de Gestión de Membresías de Gimnasio (GYMETRA)

## 📄 Descripción

Sistema distribuido para la gestión integral de membresías de gimnasio, desarrollado como proyecto académico para el curso de Sistemas Distribuidos. La solución incluye administración de usuarios, planes de membresía, pagos, control de acceso por QR, recetas nutricionales, catálogo de ejercicios y generación de reportes.

## 🎯 Objetivo del Proyecto

Desarrollar una plataforma robusta y escalable para la gestión de membresías de gimnasio que permita a los administradores gestionar usuarios, membresías y pagos de manera eficiente, y a los usuarios acceder a sus membresías mediante códigos QR, todo en una arquitectura distribuida que garantice alta disponibilidad y rendimiento.

### 🌟 Características Principales

- 🔐 **Autenticación y Autorización** con JWT, AWS Cognito y roles (Administrador, Cliente)
- 👥 **Gestión de Usuarios** con registro, inicio de sesión y perfiles
- 💳 **Gestión de Membresías** (registro, renovación, suspensión)
- 💰 **Procesamiento de Pagos** con integración de Stripe
- 📱 **Control de Acceso por QR** para validación en tiempo real
- 🥗 **Nutrición y Ejercicios** Sincronización con APIs de terceros (Spoonacular, RapidAPI)
- 📊 **Reportes y Análisis** para ingresos y asistencia
- 🏛️ **Arquitectura Distribuida** escalable y resiliente

## 🏛️ Arquitectura

### Servicios Backend
- **GYMETR-login (Puerto 8080)**: Servicio base de identidad.
- **GYMETR-Membership (Puerto 8081)**: Gestión de planes, membresías y pagos.
- **GYMETRA - Qr (Puerto 8090)**: Validación de QR, registro de accesos, ejercicios y nutrición.

### Tecnologías Utilizadas
- **Backend**: Spring Boot 3.x, Spring Security (OAuth2), PostgreSQL, Swagger.
- **Frontend**: Vue.js 3 + Ionic (Admin y Cliente App).
- **Infraestructura**: Docker, AWS Cognito.

---

## 🚀 Instalación y Configuración (Para Desarrolladores)

### Prerrequisitos Globales
- **Java 17+** (y Maven)
- **Node.js 18+**
- **PostgreSQL 14+**
- **Cuenta de AWS** (Configuración de Cognito User Pool)
- **Cuenta de Stripe** (Para la pasarela de pagos)

### 1. Configuración de Variables de Entorno (`.env`)
Por seguridad, el proyecto **no contiene credenciales quemadas en el código**. Cada microservicio (backend) y aplicación frontend cuenta con un archivo `.env.example`.

Para desplegar el proyecto, debes ir a la raíz de cada carpeta y crear tu archivo de configuración:

**Backends (`backend/`)**:
1. Entra a `backend/GYMETR-login`, copia el `.env.example` y renómbralo a `.env.development` (o `.env`). Rellena tus datos de DB y AWS Cognito.
2. Entra a `backend/GYMETR-Membership`, copia el `.env.example` y renómbralo a `.env.development`. Rellena tus datos de DB, AWS Cognito, SMTP y Stripe.
3. Entra a `backend/GYMETRA - Qr`, copia el `.env.example` y renómbralo a `.env.development`. Rellena tus datos de DB, AWS Cognito, y las APIs de Spoonacular/RapidAPI.

**Frontends (`frontend/`)**:
1. Entra a `frontend/admin-frontend`, copia el `.env.example` y renómbralo a `.env.development`.
2. Entra a `frontend/gymetra-frontend`, copia el `.env.example` y renómbralo a `.env.development`. Asegúrate de poner tu Public Key de Stripe.

### 2. Base de Datos
- Levanta tu instancia de PostgreSQL.
- Crea una base de datos llamada `gymdb` (`CREATE DATABASE gymdb;`). Las tablas se generarán automáticamente por Hibernate.

### 3. Ejecución de los Backends
En terminales separadas, navega a cada backend e inicialos:
```bash
cd backend/GYMETR-login
./mvnw spring-boot:run

cd backend/GYMETR-Membership
./mvnw spring-boot:run

cd "backend/GYMETRA - Qr"
./mvnw spring-boot:run
```

### 4. Ejecución de los Frontends
En terminales separadas, navega a cada frontend:
```bash
# Admin Web
cd frontend/admin-frontend
npm install
npm run dev

# Cliente App
cd frontend/gymetra-frontend
npm install
npm run dev
```

---

## 🔗 Puertos y Accesos Rápidos

- **Frontend Admin**: `http://localhost:8101` (Puerto puede variar en tu Vite)
- **Frontend Usuario**: `http://localhost:8100` (Puerto puede variar en tu Vite)
- **Backend Auth**: `http://localhost:8080`
- **Backend Membresías**: `http://localhost:8081`
- **Backend QR**: `http://localhost:8090`

**Documentación API (Swagger):**
- [Swagger Auth](http://localhost:8080/swagger-ui.html)
- [Swagger Membresías](http://localhost:8081/swagger-ui.html)
- [Swagger QR](http://localhost:8090/swagger-ui.html)

## 👥 Equipo y Participantes
- **Jhon Jamez Nieto Perez** - Product Owner (PO)
- **Johan Sebastian Naranjo** - Desarrollador (DEV)
- **Juan Felipe Narvaez Amaya** - Control de Calidad (QA)

**Profesor**: Jesus Ariel Gonzalez Bonilla  
**Institución**: Corporación Universitaria del Huila  
**Curso**: Sistemas Distribuidos - 8th Semester  
