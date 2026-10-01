# Catálogo de microservicios

> **Empieza aquí.** Mapa, registro y matrices de GYMETRA. Si buscas "qué hace el servicio que
> devuelve el error 502", la respuesta está en esta página.

---

## Mapa de servicios

```
                        ┌──────────────────────┐
                        │     Socios (app)     │
                        └──────────┬───────────┘
                                   │
                        ┌──────────▼───────────┐
                        │   gymetra-frontend   │  Vue 3 + Ionic 8 + Capacitor
                        └──────────┬───────────┘
                                   │
   ┌───────────────────────────────┼───────────────────────────────┐
   │                               │                               │
┌──▼───────────────┐   ┌───────────▼────────────┐   ┌──────────────▼─────────┐
│  admin-frontend  │   │                         │   │                        │
│ Vue 3 + Ionic 7  │   │                         │   │                        │
└──┬───────────────┘   │                         │   │                        │
   │                   │                         │   │                        │
   │       ┌───────────▼──────────┐   ┌──────────▼─────────┐   ┌────────────┐
   ├──────▶│   GYMETR-login :8080 │   │GYMETR-Membership   │◀──┤ GYMETRA-Qr │
   │       │   usuarios y roles   │   │      :8081         │   │    :8090   │
   │       └──────────┬───────────┘   │  membresías y pagos │   └─────┬──────┘
   │                  │               └──────────┬──────────┘         │
   │                  │                          │                    │
   │                  │                    ┌─────▼────────────────────▼─────┐
   └──────────────────┴───────────────────▶│            gymdb                │
                                            │  PostgreSQL 15 · 12 tablas    │
                                            └───────────────────────────────┘

 (aws Cognito · Stripe · ExerciseDB · Spoonacular · MyMemory)
```

**Lectura del mapa:** la única dependencia entre servicios es `GYMETRA-Qr` → `GYMETR-Membership`,
y es síncrona. `GYMETR-login` no llama a nadie. Los tres leen y escriben la misma base.

---

## Registro de servicios

| # | Servicio | Puerto | Stack | Endpoints | Propiedad de datos | Estado |
|---|----------|--------|-------|-----------|--------------------|--------|
| 01 | `GYMETR-login` | 8080 | Spring Boot 3.2.0, Java 17 | 12 (0 públicos) | `user`, `role`, `user_role`, `password_reset_token` | Activo |
| 02 | `GYMETR-Membership` | 8081 | Spring Boot 3.5.5, Java 17 | 25 (2 públicos) | `membership`, `user_membership`, `payment` | Activo |
| 03 | `GYMETRA-Qr` | 8090 | Spring Boot 3.5.5, Java 17 | 27 (16 públicos) | `qr_access`, `access_log`, `branch`, `exercises`, `recipes` | Activo |
| — | `gymetra-frontend` | 8100 | Vue 3.3, Ionic 8, Vite 5.2, Capacitor 7 | — | — | Activo |
| — | `admin-frontend` | 8101 | Vue 3.3, Ionic 7, Vite 4.4 | — | — | Activo |
| | | | | **64 (18 públicos)** | | |

---

## Detalle por servicio

### 01 — `GYMETR-login`

| Campo | Valor |
|-------|-------|
| **Carpeta** | `backend/GYMETR-login` |
| **Paquete raíz** | `com.login.GYMETRA` |
| **Configuración** | `application.yml` (dev), `application-prod.properties` (prod) |
| **Documento OpenAPI** | [`07-api/contratos/openapi/gymetr-login.yaml`](../07-api/contratos/openapi/gymetr-login.yaml) |
| **Ficha completa** | [`servicios/01-gymetr-login/README.md`](servicios/01-gymetr-login/README.md) |
| **Consumidor de AWS** | Cognito (validación de JWT y sincronización de usuarios) |
| **Base de datos** | `gymdb`, tablas `user`, `role`, `user_role`, `password_reset_token` |
| **Se comunica con** | Nadie. Es el único servicio sin dependencias de otros. |

### 02 — `GYMETR-Membership`

| Campo | Valor |
|-------|-------|
| **Carpeta** | `backend/GYMETR-Membership` |
| **Paquete raíz** | `com.Membership.GYMETRA` |
| **Configuración** | `application.properties` |
| **Documento OpenAPI** | [`07-api/contratos/openapi/gymetr-membership.yaml`](../07-api/contratos/openapi/gymetr-membership.yaml) |
| **Ficha completa** | [`servicios/02-gymetr-membership/README.md`](servicios/02-gymetr-membership/README.md) |
| **Consumidor de AWS** | Cognito, Stripe (`stripe-java` declarado) |
| **Base de datos** | `gymdb`, tablas `membership`, `user_membership`, `payment` |
| **Se comunica con** | Nadie. Recibe llamadas de QR. |

### 03 — `GYMETRA-Qr`

| Campo | Valor |
|-------|-------|
| **Carpeta** | `backend/GYMETRA - Qr` |
| **Paquete raíz** | `com.GYMETRA.GYMETRA` (subpaquete `qr`) |
| **Configuración** | `application.properties` |
| **Documento OpenAPI** | [`07-api/contratos/openapi/gymetra-qr.yaml`](../07-api/contratos/openapi/gymetra-qr.yaml) |
| **Ficha completa** | [`servicios/03-gymetra-qr/README.md`](servicios/03-gymetra-qr/README.md) |
| **Consumidor de AWS** | Cognito, ExerciseDB (RapidAPI), Spoonacular, MyMemory |
| **Base de datos** | `gymdb`, tablas `qr_access`, `access_log`, `branch`, `exercises`, `recipes` |
| **Se comunica con** | `GYMETR-Membership` vía `GET /api/user-memberships/user/{userId}` (ingreso) y `.../permission/{permission}` (ejercicios) |

---

## Matriz de comunicación entre servicios

| Origen → Destino | Mecanismo | Operaciones | Acoplamiento |
|------------------|-----------|-------------|-------------|
| `gymetra-frontend` → login | REST | `/api/auth/**` (12) | Débil, por token |
| `gymetra-frontend` → membership | REST | `/api/**` (25) | Débil, por token |
| `gymetra-frontend` → qr | REST | `/api/**` (27) | Débil, por token |
| `admin-frontend` → login | REST | `/api/**` | Débil, por token |
| `admin-frontend` → membership | REST | `/api/**` | Débil, por token |
| `admin-frontend` → qr | REST | `/api/**` | Débil, por token |
| **QR → Membership** | **REST síncrono** | **2 endpoints** | **Fuerte: si Membership cae, no hay acceso** |
| login → Cognito | REST | Validación de JWT, sync de usuarios | Externo |
| QR → ExerciseDB | REST | Sincronización de catálogo | Externo, con cuota |
| QR → Spoonacular | REST | Recetas y planes | Externo, con cuota |
| QR → MyMemory | REST | Traducción | Externo, con cuota |
| Membership → Stripe | REST | `PaymentIntent.create` y `PaymentIntent.retrieve` vía `stripe-java` 22.19.0 (sin webhooks) | Externo, en uso |

> **Punto único de falla:** la validación de acceso depende de una llamada síncrona a
> `GYMETR-Membership` sin circuit breaker ni valor por defecto. Si Membership no responde, el
> ingreso al gimnasio se deniega aunque la membresía sea válida.

---

## Matriz de propiedad de datos

| Tabla | Servicio dueño | Leída además por | Escrita además por |
|-------|----------------|------------------|--------------------|
| `user` | login | qr (`UserMin`, solo lectura) | — |
| `role` | login | — | — |
| `user_role` | login | — | — |
| `password_reset_token` | login | — | — |
| `membership` | membership | — | — |
| `user_membership` | membership | qr (vía REST) | — |
| `payment` | membership | — | — |
| `qr_access` | qr | — | — |
| `access_log` | qr | — | — |
| `branch` | qr | — | — |
| `exercises` | qr | — | — |
| `recipes` | qr | — | — |

> En la práctica, los tres servicios tienen permisos `postgres` completos sobre `gymdb`, así que
> la propiedad es una convención de papel, no una restricción técnica. La separación real
> pendiente está en [R-12](../15-control-proyecto/riesgos.md).

---

## Cómo agregar un servicio nuevo

1. Crear la carpeta `servicios/NN-nombre-del-servicio/` con los cinco documentos.
2. Asignar el siguiente número. **No reutilizar** números de servicios retirados.
3. Registrar el servicio en este catálogo: número, puerto, endpoints y tablas que posee.
4. Declarar sus dependencias en la matriz de comunicación.
5. Actualizar [`05-arquitectura/`](../05-arquitectura/README.md) con el nuevo nodo del diagrama.
6. Registrar las decisiones tomadas en `decisiones.md` de la ficha del servicio.
7. Añadir su contrato OpenAPI en [`07-api/contratos/openapi/`](../07-api/contratos/openapi/).

---

## Correlaciones

| Sección | Relación |
|---------|----------|
| [`05-arquitectura/`](../05-arquitectura/README.md) | Visión general, C4 y decisiones estructurales |
| [`06-datos/`](../06-datos/README.md) | Detalle columnar de las 12 tablas |
| [`07-api/`](../07-api/README.md) | Contratos y autenticación |
| [`10-devops/`](../10-devops/README.md) | Entornos y despliegue |
| [`13-operaciones/`](../13-operaciones/README.md) | Runbooks e incidentes |
