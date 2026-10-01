# GYMETR-Membership

> Servicio de planes, suscripciones y pagos. Es el único que decide si un socio tiene un permiso,
> y el único que cobra. Siembra además los planes de ejemplo al arrancar.

---

## Ubicación en la arquitectura

| Campo | Valor |
|-------|-------|
| **Carpeta** | `backend/GYMETR-Membership` |
| **Paquete raíz** | `com.Membership.GYMETRA` |
| **Puerto** | 8081 |
| **Spring Boot** | 3.5.5 |
| **Java** | 17 |
| **Documentación API** | springdoc 2.7.0 |
| **Consumidor de AWS** | Ninguno: el `pom.xml` no declara ninguna dependencia AWS |
| **Depende de** | Nada. No llama a ningún otro servicio. |
| **Consumido por** | `GYMETRA-Qr`, vía `GET /api/user-memberships/user/{userId}/permission/{permission}` |

---

## Responsabilidades (lo que SÍ hace)

- **Planes**: alta, edición, listado y borrado de `membership` (planes de pago).
- **Suscripciones**: alta, consulta, renovación, cancelación y confirmación de `user_membership`.
- **Pagos**: registro en `payment` a través de dos rutas distintas: la simplificada y la completa.
  Además, `PaymentController` usa `StripePaymentService` para crear y recuperar `PaymentIntent`
  reales en Stripe (`STRIPE_SECRET_KEY`); **no hay webhooks**.
- **Proxy de permisos**: responde si un usuario tiene un permiso concreto. Lo consume QR.
- **Semilla del sistema**: `DataInitializer` crea 3 planes de ejemplo al arrancar (60000 / 160000
  / 550000). Los roles `Admin` y `Client` los siembra `GYMETR-login` (ver `decisiones.md`).

---

## Fuera de alcance (lo que NO hace)

| No hace | Por qué no le corresponde |
|---------|---------------------------|
| Autenticar usuarios | La identidad es de `GYMETR-login` y Cognito |
| Crear o modificar usuarios | Esos datos viven en Login |
| Generar o validar códigos QR | Esos datos viven en QR |
| Registrar entradas al gimnasio | Esos datos viven en QR |
| Enviar correos fuera del flujo de pago | Solo `PaymentController` envía un aviso en línea con `EmailService` (`JavaMailSender`): no hay cola ni plantillas |
| Confirmar cobros con webhooks de Stripe | Solo se crean y recuperan `PaymentIntent`; no hay webhooks y la confirmación es manual (`POST /api/payments/confirm-payment`) |

---

## Controladores

| Controlador | Ruta base | Endpoints | Nota |
|-------------|-----------|-----------|------|
| `MembershipController` | `/api` | 9 | Planes y proxy |
| `UserMembershipController` | `/api/user-memberships` | 7 | Suscripciones |
| `DiagnosticController` | `/api/diagnostic` | 5 | **Diagnóstico de la base, expuesto a cualquier autenticado** |
| `PaymentController` | `/api/payments` | 3 | Pagos |
| `TableInspectorController` | `/api/inspector` | 1 | **Volcado de tablas, expuesto a cualquier autenticado** |
| **Total** | | **25** (2 públicos, 23 autenticados) | |

> `DiagnosticController` y `TableInspectorController` exponen el estado de la base de datos y el
> contenido de las tablas a **cualquier usuario con un token válido**, sin exigir rol
> administrativo. Es el punto de exposición más serio del sistema (R-16, R-18).

---

## Cómo ejecutarlo en local

### Requisitos

- JDK 17
- Maven 3.8 o superior
- PostgreSQL 15 con la base `gymdb` creada y el script aplicado
- La tabla `user` debe existir: este servicio no la crea

### Variables de entorno

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/gymdb
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=<tu contraseña>
```

> La clave de Stripe (`STRIPE_SECRET_KEY`) **sí se usa hoy**: `StripePaymentService` la lee para
> crear y recuperar `PaymentIntent` desde `PaymentController`. No hay webhooks implementados.

### Arranque

```bash
cd backend/GYMETR-Membership
mvn spring-boot:run
```

### Verificación

```bash
# Membresías disponibles: endpoint público
curl http://localhost:8081/api/memberships/available

# Suscripciones: exige token
curl -i http://localhost:8081/api/user-memberships
```

> **No hay endpoint de salud.** El `Jenkinsfile` consulta `/actuator/health` y este servicio
> devuelve 404, igual que Login y QR.

---

## Datos que siembra al arrancar

`DataInitializer` de este servicio inserta, **y solo si la tabla `membership` está vacía**:

| Dato | Origen | Nota |
|------|--------|------|
| 3 planes de ejemplo | `config/DataInitializer.java` | 60000 / 160000 / 550000, con precios que difieren de los del script (R-01) |

> **Los roles no los siembra este servicio.** El `DataInitializer` de `GYMETR-login` crea `Admin`
> y `Client` al arrancar (`config/DataInitializer.java`), y el script SQL los inserta antes con
> `INSERT INTO role ... ON CONFLICT (role_name) DO NOTHING`. El script siembra además otros 3
> planes distintos (29.99 / 49.99 / 299.99) con `ON CONFLICT DO NOTHING`.
>
> Ambas semillas están protegidas — `DataInitializer` comprueba `membershipRepository.findAll()`
> y el de Login comprueba `findByRoleName()` —, así que una segunda ejecución no falla por
> restricción de unicidad.

---

## Documentos de este servicio

| Documento | Contenido |
|-----------|-----------|
| [`modelo-de-datos.md`](modelo-de-datos.md) | Tablas `membership`, `user_membership`, `payment` |
| [`decisiones.md`](decisiones.md) | Doble ruta de pago, proxy de permisos, datos semilla |
| [`eventos.md`](eventos.md) | Publica y consume: hoy, ninguno |
| [`runbook.md`](runbook.md) | Qué hacer cuando falla |
