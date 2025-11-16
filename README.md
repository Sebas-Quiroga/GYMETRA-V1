# 🏋️ Sistema de Gestión de Membresías de Gimnasio

## 📋 Descripción

Sistema distribuido para la gestión integral de membresías de gimnasio, desarrollado como proyecto académico para el curso de Sistemas Distribuidos. La solución incluye administración de usuarios, planes de membresía, pagos, control de acceso por QR y generación de reportes.

## 🎯 Objetivo del Proyecto

Desarrollar una plataforma robusta y escalable para la gestión de membresías de gimnasio que permita a los administradores gestionar usuarios, membresías y pagos de manera eficiente, y a los usuarios acceder a sus membresías mediante códigos QR, todo en una arquitectura distribuida que garantice alta disponibilidad y rendimiento.

### ✨ Características Principales

- 🔐 **Autenticación y Autorización** con JWT y roles (Administrador, Cliente)
- 👥 **Gestión de Usuarios** con registro, inicio de sesión y perfiles
- 💳 **Gestión de Membresías** (registro, renovación, suspensión)
- 💰 **Procesamiento de Pagos** con integración de pasarela externa
- 📱 **Control de Acceso por QR** para validación en tiempo real
- 📊 **Reportes y Análisis** para ingresos y asistencia
- 🏗️ **Arquitectura Distribuida** escalable y resiliente

## 🏗️ Arquitectura

### Servicios Backend
- **Servicio de Membresías**: Gestión de planes y membresías
- **Servicio de Control de Acceso**: Validación de QR y registro de accesos
- **Servicio de Pagos**: Procesamiento de pagos y conciliación

### Arquitectura Distribuida

La arquitectura distribuida permite la separación de responsabilidades en diferentes servicios backend que se comunican entre sí, asegurando escalabilidad, mantenibilidad y tolerancia a fallos. Cada servicio opera de manera independiente pero coordinada, utilizando una base de datos compartida para la persistencia de datos.

### Tecnologías Utilizadas

#### Backend
- **Framework**: Spring Boot 3.x
- **Seguridad**: Spring Security + JWT/OAuth2
- **Base de Datos**: PostgreSQL
- **Documentación**: OpenAPI/Swagger

#### Frontend
- **Admin Web**: Vue.js 3 + Ionic
- **App Móvil**: Ionic + Vue.js (híbrida)

#### Infraestructura
- **Contenedores**: Docker
- **Orquestación**: Docker Compose
- **CI/CD**: GitHub Actions
- **Nube**: AWS/GCP

## 📋 Metodología de Trabajo

El proyecto se desarrolla siguiendo la metodología Scrum, con sprints de dos semanas, reuniones diarias de stand-up, planificación de sprint y retrospectivas. Se utiliza JIRA para la gestión de tareas y backlog, y Git con GitFlow para el control de versiones.

## 📊 Gestión del Backlog

El backlog del producto se mantiene actualizado en JIRA, priorizando las historias de usuario según su valor y complejidad. Se realiza refinamiento del backlog en cada sprint para asegurar que las tareas estén bien definidas y estimadas.

## 🚀 Instalación y Configuración

### Prerrequisitos
- Java 17+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Git

### Puertos

- Frontend Admin: http://localhost:8101
- Frontend Usuario: http://localhost:8100
- Backend Login/Registro: http://localhost:8080
- Backend Membresías: http://localhost:8081
- Backend QR: http://localhost:8082
- Swagger API Login/Registro: http://localhost:8080/swagger-ui.html
- Swagger API Membresías: http://localhost:8081/swagger-ui.html
- Swagger API QR: http://localhost:8082/swagger-ui.html




## 📚 Documentación

### Estructura del Proyecto
```
GYMETRA-V1/
├── backend/
│   ├── GYMETR-Membership/  # Servicio de Membresías (puerto 8081)
│   ├── GYMETRA/            # Servicio base
│   └── GYMETRA - Qr/       # Servicio de Control de Acceso (puerto 8090)
├── frontend/
│   ├── admin-frontend/     # Frontend Admin (puerto 8101)
│   └── gymetra-frontend/   # Frontend Usuario (puerto 5173)
├── data/
│   └── Database-Setup/     # Scripts de base de datos
├── doc/                    # Documentación local
└── docker-compose.yml
```

### APIs Principales

#### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Refresco de token

#### Membresías
- `GET /api/memberships` - Listar planes
- `POST /api/memberships` - Crear membresía
- `PUT /api/memberships/{id}` - Actualizar membresía

#### Control de Acceso
- `POST /api/access/validate-qr` - Validar código QR
- `GET /api/access/history` - Historial de accesos

### Diagramas de Arquitectura
- [Diagrama de Clases](doc/diagrams/class/class.puml)
- [Diagrama de Despliegue](doc/diagrams/deploy/deploy.puml)
- [Diagrama ER](doc/diagrams/er/er.puml)
- [Diagrama de Paquetes](doc/diagrams/packeage/Packeage.puml)
- [Diagrama de Secuencia](doc/diagrams/secuence/Secuence.puml)
- [Diagrama de Casos de Uso](doc/diagrams/use_case/use_case.puml)

## 🔗 Enlaces

| Recurso | Descripción | Enlace |
|---------|-------------|--------|
| 📁 Repositorio Backend | Código fuente del backend | [GitHub](https://github.com/Sebas-Quiroga/GYMETRA_backend.git) |
| 📁 Repositorio Frontend | Código fuente del frontend | [GitHub](https://github.com/Sebas-Quiroga/GYMETRA-V1_frontend.git) |
| 📁 Repositorio Documentación | Documentación del proyecto | [GitHub](https://github.com/JJ0ta19/GYMETRA_docs.git) |
| 📁 Repositorio Trazabilidad | Trazabilidad del proyecto | [GitHub](https://github.com/Sebas-Quiroga/GYMETRA-V1.git) |
| 🎨 Diseño en Figma | Diseños de interfaz | [Figma](https://www.figma.com/design/6wvsYaVryxBWp2NIUM2zci/GYMETRA-PRIN?node-id=0-1&p=f&t=JSPiUM0bfykeal7f-0) |
| 📝 Tablero JIRA | Gestión de tareas y backlog | [JIRA](https://gymetra.atlassian.net/jira/software/projects/SCRUM/boards/1) |

**Nota**: Cada repositorio (backend, frontend, docs) está separado y contiene su propio Jenkinsfile y docker-compose.yml, excepto el repositorio de docs.

## 👥 Participantes

- **Jhon Jamez Nieto Perez** - Product Owner (PO)
- **Johan Sebastian Naranjo** - Desarrollador (DEV)
- **Juan Felipe Narvaez Amaya** - Control de Calidad (QA)

**Profesor**: Jesus Ariel Gonzalez Bonilla
**Institución**: Corporación Universitaria del Huila
**Curso**: Sistemas Distribuidos - 8th Semester

## 📄 Licencia

Este proyecto se desarrolla con fines académicos en la Corporación Universitaria del Huila.
