# Decisiones técnicas — GYMETR-Membership

> Decisiones de este servicio, con su motivo y su estado real en el código.

---

## [MEM-DEC-001] Cada dato de pago se guarda dos veces, en dos idiomas

| Campo | Valor |
|-------|-------|
| **Estado** | Error, pendiente de corrección |
| **Fecha** | 2026-09 |
| **Riesgo** | R-02 |

### Contexto

La entidad `Payment` declara, para cada dato relevante, dos campos:

| Español | Inglés |
|---------|--------|
| `monto` | `amount` |
| `metodo_pago` | `paymentMethod` |
| `fecha_pago` | `paymentDate` |
| `payment_status` | — (solo existe en inglés) |

Los cuatro en español están marcados `nullable = false`.

### Decisión tomada

Ninguna, en realidad: la duplicación parece accidental. No hay ningún documento que la justifique
ni ninguna lectura que use la pareja española.

### Consecuencias

| Consecuencia | Detalle |
|--------------|---------|
| `savePaymentSimplified()` falla | Rellena la pareja inglesa y omite `monto`, `metodo_pago` y `fecha_pago`, que además son NOT NULL |
| El comportamiento difiere por ambiente | Con `ddl-auto: update` las columnas españolas se crean y el insert funciona; con el script SQL no existen |
| Una ruta de pago sí funciona | `savePaymentComplete()` rellena todos los pares, por eso el endpoint completo funciona y el simplificado no |
| Historial con dos valores | Cuando ambos se rellenan, pueden divergir sin que nada lo detecte |

### Corrección

Dejar **una sola** nomenclatura. Si se conserva la española, hay que actualizar también el script
SQL, el mapeo de la entidad y el método que hoy falla.

---

## [MEM-DEC-002] La verificación de permisos se expone como proxy

| Campo | Valor |
|-------|-------|
| **Estado** | Vigente |
| **Fecha** | 2026-09 |

### Contexto

`GYMETRA-Qr` necesita saber si un socio puede entrar al gimnasio. La respuesta depende de
`user_membership`, que pertenece a este servicio.

### Decisión

En lugar de que QR lea la base de este servicio, se exponen dos endpoints de solo lectura:

```
GET /api/user-memberships/user/{userId}
GET /api/user-memberships/user/{userId}/permission/{permission}
```

La lista es la que usa el flujo de ingreso, pero **exige JWT** y QR la llama sin token:
devuelve 401 y QR lo interpreta como "sin membresía" (R-28). El de permisos sí está en
`permitAll()` (R-18) y es el que invoca `ExerciseController`.

### Consecuencias

**Favorables:**
- La frontera entre servicios se respeta en el camino de lectura.
- Este servicio conserva la autoridad sobre la regla de negocio.

**Adversas:**
- La llamada es síncrona y **sin timeout**: si Membership se cae, QR cuelga o deniega (R-12).
- El endpoint de permisos es **público**: permite enumerar quién tiene membresía sin autenticarse (R-18).
- No hay caché ni degradación: cada validación de acceso es un salto de red.

### Mejora pendiente

Añadir tiempo de espera, reintentos y un valor por defecto local en QR, de modo que una caída de
Membership no cierre el gimnasio.

---

## [MEM-DEC-003] Los planes se siembran desde dos fuentes distintas

| Campo | Valor |
|-------|-------|
| **Estado** | Vigente, con precios en conflicto |
| **Fecha** | 2026-09 |

### Contexto

Este servicio **no siembra roles**: su `DataInitializer` crea 3 planes de ejemplo (60000 / 160000
/ 550000) y solo si la tabla `membership` está vacía. Los roles `Admin` y `Client` los crea el
`DataInitializer` de `GYMETR-login` al arrancar, y el script SQL los inserta antes con
`ON CONFLICT (role_name) DO NOTHING`.

### Por qué es un problema

| Consecuencia | Detalle |
|--------------|---------|
| Los precios dependen de quién creó la base | Si la creó el script, el `DataInitializer` no llega a insertar nada y los planes son 29.99 / 49.99 / 299.99 |
| Dos orígenes sin fuente de verdad | No hay migración ni registro de qué semilla se aplicó en cada entorno |
| Conviven tres nombres de rol | `Admin`, `Client` y `User` (el que asigna Login al sincronizar), aunque este servicio ya no los crea |
| La responsabilidad se confunde | Los roles son territorio de `GYMETR-login`, no de la membresía |

### Acción pendiente

Elegir una única fuente de planes (script o `DataInitializer`) y dejar documentada la siembra de
roles en `GYMETR-login`, con un solo nombre de rol.

---

## [MEM-DEC-004] Dos endpoints de pago con contratos distintos

| Campo | Valor |
|-------|-------|
| **Estado** | Vigente, redundante |
| **Fecha** | 2026-09 |

| Endpoint | Método de servicio | Campos que rellena | Resultado |
|----------|--------------------|--------------------|-----------|
| `POST /api/payments` (simplificado) | `savePaymentSimplified` | Solo la pareja inglesa | **Falla** por las columnas NOT NULL (R-02) |
| Ruta completa | `savePaymentComplete` | Todos los pares | Funciona |

### Consecuencia

Dos formas de hacer lo mismo, con un contrato cada una, y una de ellas rota. Un consumidor que
elija la ruta simplificada falla sin aviso previo, porque el error aparece en tiempo de ejecución
y no al compilar.

### Acción pendiente

Dejar un solo endpoint de escritura de pagos.

---

## [MEM-DEC-005] `DiagnosticController` y `TableInspectorController` están en producción

| Campo | Valor |
|-------|-------|
| **Estado** | Decisión ausente, por tanto es un descuido |
| **Fecha** | 2026-09 |
| **Riesgo** | R-16, R-18 |

### Contexto

Este servicio incluye seis endpoints de diagnóstico e inspección que:

- Lista tablas, columnas, índices, claves foráneas y **conteos de filas**.
- Permite ejecutar consultas de lectura sobre **cualquier tabla**.

### Por qué no debería estar así

Su `SecurityConfig` termina en `anyRequest().authenticated()`, así que **cualquier socio con un
token válido** puede invocarlos. No exigen `@PreAuthorize` ni rol administrativo.

El resultado es que un socio autenticado puede leer el esquema completo y el contenido de
`user`, `payment` y `user_membership` de **todos los socios**, no solo de sí mismo. Es el punto de
exposición más serio del sistema.

### Acción pendiente

Eliminar ambos controladores del código de producción. Si hacen falta para desarrollo, moverlos
a un perfil de Spring que no se cargue en producción.

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`patrones-de-comunicacion.md`](../../patrones-de-comunicacion.md) | La llamada síncrona de QR a este servicio |
| [`R-02`](../../../15-control-proyecto/riesgos.md) | Columnas duplicadas de pago |
| [`R-16`](../../../15-control-proyecto/riesgos.md) | Autorización sin exigir rol |
| [`R-18`](../../../15-control-proyecto/riesgos.md) | Endpoints de diagnóstico sin restricción de rol |
| [`07-api/servicios-membership.md`](../../../07-api/contratos/openapi/gymetr-membership.yaml) | Los 25 endpoints de este servicio |
