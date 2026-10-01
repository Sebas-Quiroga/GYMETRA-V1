# Directrices de API

> Convenciones de diseño de API que sigue GYMETRA, con ejemplos reales del código.

## Propósito

Una API consistente es más barata de consumir: cuando todos los endpoints se comportan
igual, el frontend puede tener un único cliente HTTP y no 64 casos especiales. Este
documento describe qué hace GYMETRA y qué le falta.

---

## 1. Convenciones que ya se cumplen

| Convención | Detalle | Ejemplo |
|------------|---------|---------|
| Prefijo `/api` | Todas las rutas empiezan por `/api` | `/api/users`, `/api/payments` |
| Sustantivos en plural | Los recursos se nombran en plural | `/api/memberships`, `/api/branches` |
| Verbos HTTP correctos | GET no muta, POST crea, PUT reemplaza, PATCH parcializa, DELETE borra | `PATCH /api/auth/users/{id}/status` |
| Subtipo de recurso como sufijo | Acciones que no son CRUD llevan un descriptor | `/create-payment-intent`, `/check-permission` |
| Entidades JPA como recurso | La respuesta es la entidad, no un DTO dedicado | `GET /api/memberships` devuelve `Membership[]` |
| Códigos de estado sentido | 200 para éxito, 404 para no encontrado, 400 para error de validación | Ver `ResponseEntity` en los controladores |
| Errores en JSON | Un manejador global traduce excepciones a JSON | ⚠️ El cuerpo **no es uniforme** entre servicios — ver §3.3 |

---

## 2. Lo que falta

### 🔴 2.1 Versionado de la API

Las rutas no llevan versión: no hay `/v1/memberships`, sino `/api/memberships`.

**Consecuencia:** cuando cambie el formato de una respuesta, no hay forma de ofrecer la
versión antigua y la nueva a la vez. Un cambio que rompa a un cliente obliga a coordinar el
despliegue del backend y del frontend en el mismo instante. Para un sistema en producción
con clientes que no se controlan al 100 % (por ejemplo, una app móvil ya instalada), eso
es un bloqueo.

**Recomendación:** adoptar `/api/v1/...` antes de que exista el primer cliente que no se
pueda actualizar.

### 🔴 2.2 Paginación

Ningún endpoint de listado pagina. `GET /api/payments/all` y `GET /api/access-log` devuelven
la tabla entera.

**Consecuencia:** el tamaño de la respuesta crece sin límite. `access_log` es la tabla que
más crece (una fila por cada entrada y salida). Con el volumen de un gimnasio activo, la
respuesta puede llegar a cientos de megabytes, agotar la memoria del contenedor y colgarse
el navegador.

**Recomendación:** parámetros `?page=0&size=20&sort=fecha,desc` en todos los listados, con
respuesta paginada estandarizada.

### 🟠 2.3 Filtros

Ningún endpoint acepta filtros. No se puede pedir "accesos del socio X en la última semana"
ni "pagos confirmados del último mes". El cliente tiene que traer todo y filtrar en el
navegador.

**Recomendación:** soportar filtros por campo y rango de fechas en los endpoints de
histórico.

### 🟠 2.4 DTOs en lugar de entidades

Los controladores devuelven las entidades JPA directamente. Eso tiene dos efectos
desagradables:

1. **Fuga de información**: cualquier campo nuevo de la entidad aparece automáticamente en
   la respuesta, sin revisión. Dos casos reales:

   - **`Payment` expone columnas duplicadas.** La entidad serializa los tres pares
     `amount`/`monto`, `payment_method`/`metodo_pago` y `payment_date`/`fecha_pago`: el
     mismo dato en dos versiones por campo, sincronizadas solo en `@PrePersist` (hallazgo
     H-02). Es un problema de modelo, no de credenciales: `Payment.java` no tiene ningún
     campo de contraseña.
   - **`user.password_hash` sale en el JSON hoy.** `GET /api/auth/users` devuelve la
     entidad `User` y el campo `passwordHash` no lleva `@JsonIgnore` (el único del
     archivo está en `userRoles`, `User.java:63`), así que se serializa en cada respuesta;
     no hace falta que cambie ningún serializer. El alcance es menor porque la columna
     está siempre a `NULL` (R-25), pero es el dato de una contraseña expuesto por la API.
2. **Acoplamiento**: el contrato de la API queda atado a la estructura de la base de datos.
   Renombrar una columna es un cambio incompatible en la API.

**Recomendación:** un DTO de entrada y uno de salida por operación, con mapper explícito.

### 🟠 2.5 Códigos de error consistentes

Los errores devuelven texto en `message`, pero no hay un **código** estable que el cliente
pueda usar para tomar decisiones. El frontend tiene que interpretar cadenas en español o en
inglés, lo que se rompe en cuanto alguien cambia un mensaje.

**Recomendación:** un campo `code` con valores estables tipo `MEMBERSHIP_NOT_FOUND`,
`PAYMENT_FAILED`, `QR_EXPIRED`, y `message` solo para el usuario.

### 🟡 2.6 Idempotencia

No hay ninguna protección de idempotencia. `POST /api/payments/confirm-payment` y
`POST /api/exercises/sync/force` no son idempotentes: llamarlos dos veces cobra o resincroniza
dos veces.

**Recomendación:** aceptar una clave de idempotencia (`Idempotency-Key`) en operaciones de
pago, como ya hace Stripe.

### 🟡 2.7 Límite de tasa (rate limiting)

No hay ningún control de frecuencia. Combinado con `/api/exercises/**` público, cualquiera
puede bombardear el servicio o agotar las cuotas de las APIs externas. Ver R-19.

---

## 3. Patrones de respuesta

### 3.1 Éxito con entidad

```java
@GetMapping("/memberships")
public List<Membership> listMemberships() { ... }
// → 200, cuerpo: [ { "membershipId": 1, "planName": "Mensual", ... } ]
```

### 3.2 Éxito con texto plano

```java
@DeleteMapping("/users/{userId}")
public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
    return deleted
        ? ResponseEntity.ok("Usuario eliminado exitosamente")
        : ResponseEntity.notFound().build();
}
// → 200, cuerpo: "Usuario eliminado exitosamente"
```

> ⚠️ Devolver texto plano en un `200` de borrado es raro: lo habitual sería `204 No Content`
> sin cuerpo. No es un error grave, pero es inconsistente con el resto.

### 3.3 Error

El formato **intencionado** en los contratos OpenAPI es:

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Membresía no encontrada",
  "path": "/api/memberships/999",
  "timestamp": "2026-09-20T10:30:00"
}
```

**El código real no lo cumple de forma uniforme:**

| Servicio | Cuerpo que devuelve | Dónde |
|----------|---------------------|-------|
| GYMETR-Membership | `{timestamp, status, error, message}` — **sin `path`** | `exception/GlobalExceptionHandler.java` (solo 500) |
| GYMETRA-Qr | `{timestamp, status, error, message}` — **sin `path`** | `exception/GlobalExceptionHandler.java` (solo 500) |
| GYMETR-login | `{success: false, message}` en los 400 | `controller/GlobalExceptionHandler.java` |

`path` aparece únicamente en la respuesta por defecto de Spring (`/error`), no en los
manejadores. Componentes compartidos y divergencias:
[`contratos/openapi/_compartido.yaml`](./contratos/openapi/_compartido.yaml).

---

## 4. Cómo documentar una API nueva

Antes de escribir un endpoint:

1. **Define el recurso** en singular, y la ruta en plural.
2. **Decide el código de estado** para cada caso: éxito, no encontrado, validación,
   conflicto, error del servidor.
3. **Escribe el DTO de entrada y salida** (o justifica por qué reutilizas la entidad).
4. **Añade el código de error** estable para cada fallo de negocio.
5. **Actualiza el contrato OpenAPI** en `contratos/openapi/`.
6. **Añade la historia de usuario** y su entrada en la matriz de trazabilidad.

---

## 5. Checklist de un endpoint nuevo

- [ ] Ruta bajo `/api`, recurso en plural
- [ ] Verbo HTTP acorde a la operación
- [ ] Código de estado correcto para cada caso
- [ ] Requiere autenticación (y rol, si aplica)
- [ ] DTO de entrada y salida
- [ ] Códigos de error estables
- [ ] Documentado en el contrato OpenAPI
- [ ] Historia de usuario actualizada
- [ ] Matriz de trazabilidad actualizada

---

## Documentos relacionados

- [`README.md`](./README.md) — inventario de endpoints
- [`autenticacion-y-autorizacion.md`](./autenticacion-y-autorizacion.md) — JWT y roles
- [`../04-requisitos/matriz-de-trazabilidad.md`](../04-requisitos/matriz-de-trazabilidad.md) — trazabilidad
- [`../00-gobernanza/reglas-de-seguridad.md`](../00-gobernanza/reglas-de-seguridad.md) — reglas de seguridad
