# Mapa de navegación

> Las rutas de los dos frontends, quién puede llegar a cada una y qué hay que corregir. Los nombres
> de ruta están leídos de los archivos `src/router/index.ts`.

---

## Aplicación del socio — 10 rutas

| Ruta | Vista | Propósito | Acceso |
|------|-------|-----------|--------|
| `/` | — | Punto de entrada; redirige siempre a `/home` | Público |
| `/home` | `HomePage` | Inicio del socio | Autenticado |
| `/Pasarelapago` | `PasarelaPago` | Pago de una suscripción | Sin protección |
| `/login` | `LoginPage` | Inicio de sesión con Cognito | Público |
| `/register` | `RegisterPage` | Alta con verificación por código | Público |
| `/perfil` | `PerfilPage` | Datos del socio y foto | Sin protección |
| `/Planes` | `PlanesPage` | Catálogo de planes | Sin protección |
| `/qr` | `QrPage` | Código QR de acceso | Sin protección |
| `/nutrition-plan` | `NutritionPlanView` | Plan de nutrición | Autenticado |
| `/rutinas` | `RutinasView` | Rutinas de entrenamiento | Autenticado |

### El recorrido natural

```
/register  →  /home  →  /Planes  →  /Pasarelapago  →  /qr  →  /rutinas, /nutrition-plan, /perfil
```

### Problemas de las rutas

| Problema | Detalle | Consecuencia |
|----------|---------|--------------|
| Mayúsculas mezcladas | `/Pasarelapago`, `/Planes` | En un sistema de archivos sensible a mayúsculas, una ruta mal escrita da 404; complica enlazar y buscar |
| Español e inglés mezclados | `/Pasarelapago` y `/nutrition-plan` | Inconsistente para cualquier persona nueva |
| Sin nombre canónico | `/Planes` y `/home` | Son sustantivos sueltos, no acciones ni recursos |
| Ausencia de alias estables | No hay `/planes` en minúsculas | Un enlace externo a `/Planes` no puede corregirse sin romperlo |

> Estas rutas no son un error de funcionamiento: la navegación funciona. Son una deuda de
> mantenibilidad, y barato de corregir ahora, caro después.

---

## Panel de administración — 13 rutas

| Ruta | Vista | Propósito | Acceso |
|------|-------|-----------|--------|
| `/` | — | Redirige al panel o al login | Público |
| `/login` | `LoginAdminPage` | Inicio de sesión del administrador | Público |
| `/admin` | `layouts/AdminLayout.vue` | Resumen y gestión de socios | Administrador |
| `/adminpanel` | `AdminPage` | Panel principal | Administrador |
| `/adminmetricas` | `MetricasPage` | Métricas y gráficos | Administrador |
| `/adminpagos` | `PagosPage` | Gestión de pagos, con exportación | Administrador |
| `/adminadduser` | `AddUserPage` | Alta manual de usuario | Administrador |
| `/adminedituser/:userId` | `EditUserPage` | Edición de un socio | Administrador |
| `/adminreportes` | `ReportesPage` | Informes, con exportación a PDF y Excel | Administrador |
| `/adminroles` | `RolesPage` | Listado de roles | Administrador |
| `/adminaddrole` | `AddRolePage` | Alta de rol | Administrador |
| `/admineditrole/:roleId` | `EditRolePage` | Edición de rol | Administrador |
| `/:pathMatch*` | — | Cualquier ruta desconocida | — |

### El recorrido natural

```
/login  →  /adminpanel  →  /admin  →  /adminedituser/:userId
                                    →  /adminmetricas
                                    →  /adminpagos
                                    →  /adminreportes
                                    →  /adminroles  →  /adminaddrole, /admineditrole/:roleId
```

### La barra lateral

`AdminSidebar.vue`, con 654 líneas, es el componente que sostiene la navegación del panel. Puntos a
destacar:

| Aspecto | Estado |
|---------|--------|
| Ancho expandido | `--admin-sidebar-width: 280px` |
| Ancho colapsado | `--admin-sidebar-collapsed-width: 80px` |
| Transición | `--admin-transition: all 0.22s ease` |
| Capas | `--z-sidebar: 900`, `--z-modal: 1200` |
| Rutas de edición | Con parámetro: `/adminedituser/:userId`, `/admineditrole/:roleId` |
| Estado activo | No verificable sin revisar el componente; no hay dato documentado |

> La barra lateral concentra su estructura, sus estilos y su lógica en un solo archivo de 654
> líneas. Es el componente que más se beneficiaría de una división entre datos de navegación y
> presentación.

---

## Dos observaciones sobre la protección de rutas

### 1. El panel depende por completo del backend

Las rutas marcadas como "Administrador" en la tabla anterior lo están **por intención**. La
verificación real ocurre en los tres `SecurityConfig` del backend, que terminan en:

```java
.anyRequest().authenticated()
```

**Ningún controlador exige rol `Admin`.** Es decir: un socio con un token válido puede navegar a
`/adminpagos` y ver la pantalla, y lo que le devuelva cada llamada es lo que impide que vea los
datos. Con `DiagnosticController` y `TableInspectorController` expuestos, lo que ve es bastante
(R-16, R-18).

### 2. El guard del frontend no sustituye a la autorización del backend

Que el enrutador del cliente rechace una ruta es una medida de comodidad, no de seguridad. Un `curl` no
pasa por el enrutador. La autorización tiene que estar en el servidor, y hoy no lo está.

---

## Rutas de la API que la interfaz consume

| Frontend | Variable | Servicio | Ruta base |
|----------|----------|----------|-----------|
| Socio | `VITE_API_URL_LOGIN` | `GYMETR-login` | `http://localhost:8080/api` |
| Socio | `VITE_API_URL_MEMBERSHIP` | `GYMETR-Membership` | `http://localhost:8081/api` |
| Socio | `VITE_API_URL_QR` | `GYMETRA-Qr` | `http://localhost:8090/api` |
| Admin | Las mismas tres | Los tres servicios | Igual |
| Raíz del repo | `VITE_API_URL` | — | **Variable muerta**: no la consume ningún frontend |

> Las variables del `.env` de cada frontend apuntan a `localhost`, lo que funciona en desarrollo
> pero **no dentro de un contenedor**: el `Dockerfile` del frontend no copia ningún `.env`. La
> `VITE_API_URL` de la raíz (`http://backend:8080` en `.env.production`) tampoco se usa:
> `grep import.meta.env.VITE_API_URL[^_]` devuelve 0 coincidencias. Las únicas variables que el
> código lee son `VITE_API_URL_LOGIN`, `VITE_API_URL_MEMBERSHIP` y `VITE_API_URL_QR`.
> El `admin-frontend` no tiene equivalente en el compose.

---

## Inconsistencias de nomenclatura en las rutas

| Patrón | Ejemplos | Problema |
|--------|----------|----------|
| Sustantivo Spanish capitalizado | `/Planes`, `/Pasarelapago` | Ni coherencia de idioma ni de mayúsculas |
| Prefijo + sustantivo en minúsculas | `/adminadduser`, `/adminpagos` | Sin separador: `adminadduser` se lee de una vez |
| Recurso con parámetro | `/adminedituser/:userId` | El verbo va en la ruta, no en la acción |
| Inglés sin prefijo | `/nutrition-plan`, `/rutinas` | Mezcla de idiomas en la misma aplicación |
| CamelCase en camelCase | `/home`, `/login` | Correcto, pero inconsistente con lo anterior |

### Convención recomendada

Seguir el patrón que ya usan las rutas de detalle, pero de forma consistente:

| Actual | Propuesta |
|--------|----------|
| `/Planes` | `/planes` |
| `/Pasarelapago` | `/planes/:id/pago` |
| `/nutrition-plan` | `/nutripcion/plan` |
| `/rutinas` | `/rutinas` (sin cambios) |
| `/adminadduser` | `/admin/usuarios/nuevo` |
| `/adminedituser/:userId` | `/admin/usuarios/:id` |
| `/adminpagos` | `/admin/pagos` |
| `/adminaddrole` | `/admin/roles/nuevo` |
| `/admineditrole/:roleId` | `/admin/roles/:id` |

Con una redirección de la ruta antigua a la nueva, para no romper enlaces guardados.

---

## Puntos de fricción del recorrido

| Momento | Fricción | Causa |
|---------|----------|-------|
| Entrar por `/` | La primera pantalla depende de a dónde redirija | La ruta raíz no define contenido propio |
| Registrarse | Verificación por código, registro de 540 líneas, el punto más largo del flujo | Sin componente reutilizable |
| Ver `/qr` | Depende de que el backend de QR esté arriba | Si QR no responde, no hay código |
| Pagar | `PasarelaPago` con Stripe; si el pago falla por R-02, el socio no puede suscribirse | R-02 |
| Entrar al gimnasio | Dos saltos de red: QR → Membership, sin timeout | R-12 |
| Ver el plan de nutrición | Depende de Spoonacular; si falla la cuota, la pantalla queda vacía | R-27 |
| Administrar usuarios | El panel no protege nada en el servidor | R-16, R-18 |

> **Cinco de los siete puntos de fricción son riesgos ya registrados.** Son la misma lista de
> problemas vista desde la interfaz.

---

## Mapa de navegación consolidado

```
                     ┌─────────────────────────┐
                     │   Cognito (autenticación)│
                     └────────────┬────────────┘
                                  │
              ┌───────────────────┴───────────────────┐
              │                                       │
     ┌────────▼────────┐                    ┌─────────▼────────┐
     │  App del socio  │                    │  Panel de admin  │
     │  (10 rutas)     │                    │  (13 rutas)      │
     └────────┬────────┘                    └─────────┬────────┘
              │                                       │
    ┌─────────┼──────────┬──────────┐        ┌────────┼─────────┬──────────┐
    ▼         ▼          ▼          ▼        ▼        ▼         ▼          ▼
 /register  /home      /Planes   /qr    /admin  /métricas  /pagos   /reportes
    │         │          │         │      │        │         │         │
    │         ▼          ▼         │      └────────┴─────────┴─────────┘
    │      /rutinas  /Pasarelapago│
    │      /nutrition-plan        │
    │      /perfil                │
    └────────┴─────────────────────┘
              │
              ▼  (llamadas REST a 8080, 8081, 8090)
```

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`sistema-de-diseno.md`](sistema-de-diseno.md) | Tokens y componentes que sostienen estas pantallas |
| [`07-api/`](../07-api/README.md) | Endpoints que consume cada ruta |
| [`10-devops/entornos.md`](../10-devops/entornos.md) | Variables que apuntan a los servicios |
| [`08-uml/`](../08-uml/README.md) | Diagrama de casos de uso |
| [`R-16`](../15-control-proyecto/riesgos.md) | Autorización solo por autenticado |
