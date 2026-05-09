# Documento de Registro de Software - GYMETRA

Este documento contiene la información técnica y funcional necesaria para el registro de propiedad intelectual y derechos de autor del software GYMETRA.

## 1. Información General del Programa
*   **Nombre del Software**: GYMETRA
*   **Versión**: 1.0.0
*   **Año de Creación**: 2024
*   **Lenguajes de Programación**: Java (Spring Boot), TypeScript (Vue.js/Ionic), SQL (PostgreSQL).
*   **Entorno de Operación**: Sistemas distribuidos, arquitectura de microservicios, despliegue mediante contenedores Docker.

## 2. Descripción de Funcionalidades
GYMETRA es un sistema integral para la gestión de gimnasios y centros deportivos. Sus funciones principales incluyen:
1.  **Gestión de Identidades**: Registro, autenticación y autorización de usuarios mediante AWS Cognito.
2.  **Gestión de Membresías**: Administración de planes, vigencias y suscripciones de socios.
3.  **Pasarela de Pagos**: Procesamiento de transacciones financieras mediante la integración con Stripe.
4.  **Control de Acceso**: Generación y validación de códigos QR dinámicos para el ingreso a sedes físicas.
5.  **Seguimiento Deportivo**: Módulos de rutinas de ejercicio y planes nutricionales personalizados.
6.  **Métricas Administrativas**: Visualización de datos de ingresos, aforo y asistencia.

## 3. Descripción Técnica y Arquitectura
El software utiliza una arquitectura de microservicios distribuida:
*   **Servicio de Login**: Maneja la lógica de usuarios y sincronización con proveedores de identidad externos.
*   **Servicio de Membresías**: Gestiona la lógica de negocio de los planes y la integración con la pasarela de pagos.
*   **Servicio de QR y Acceso**: Encargado de la lógica de generación de códigos temporales y validación en tiempo real.

### Diagrama de Arquitectura (Conceptual)
El sistema se comunica mediante APIs RESTful y utiliza una base de datos relacional PostgreSQL para la persistencia. La seguridad se garantiza mediante tokens JWT (JSON Web Tokens).

## 4. Descripción de Algoritmos Principales
### Algoritmo de Generación de QR
El sistema genera un código QR basado en una cadena que concatena el ID del usuario, un UUID único y una marca de tiempo, codificada en Base64.
```
Funcion GenerarQR(userId):
    uuid = GenerarUUID()
    timestamp = ObtenerTiempoActual()
    cadena = userId + ":" + uuid + ":" + timestamp
    retornar CodificarBase64(cadena)
```

### Algoritmo de Validación de Membresía
```
Funcion ValidarAcceso(userId):
    membresia = ObtenerMembresiaActiva(userId)
    Si membresia existe Y membresia.fechaFin > Hoy:
        Retornar "ACCESO PERMITIDO"
    Sino:
        Retornar "ACCESO DENEGADO"
```

## 5. Muestra de Código Fuente (Controlador de Acceso)
```java
@PostMapping("/validate-qr")
public ResponseEntity<?> validateQr(@RequestBody String qrCode) {
    Optional<QrAccess> access = qrAccessService.validate(qrCode);
    if (access.isPresent()) {
        accessLogService.log(access.get().getUserId(), "ENTRY");
        return ResponseEntity.ok("Validado");
    }
    return ResponseEntity.status(403).body("Invalido");
}
```

## 6. Manual de Instalación (Resumen)
1.  Clonar repositorio.
2.  Configurar variables de entorno (`.env`).
3.  Ejecutar `docker-compose up`.
4.  Ejecutar scripts SQL de inicialización.

## 7. Autores y Titularidad
*   **Autores**: Jhon Jamez Nieto Perez, Johan Sebastian Naranjo, Juan Felipe Narvaez Amaya.
*   **Institución**: Corporación Universitaria del Huila.
