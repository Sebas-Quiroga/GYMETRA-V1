# Reglas de frontera entre servicios

> Qué puede hacer cada servicio y qué no. Una frontera clara es lo que permite que tres personas
> trabajen en paralelo sin pisarse.

---

## Por qué este documento existe

GYMETRA tiene tres servicios separados **por código pero no por datos**: los tres apuntan a
`gymdb` con el mismo usuario de base de datos. Eso hace que las fronteras sean una convención
acordada, no una barrera técnica. Este documento fija esa convención para que quede escrita y
revisable.

Ver [ADR-002](../05-arquitectura/decisiones/registros/ADR-002-base-datos-compartida.md) para el
registro de esa decisión y [R-12](../15-control-proyecto/riesgos.md) para su riesgo.

---

## Frontera por servicio

### `GYMETR-login` (01)

| Puede hacer | No puede hacer |
|-------------|----------------|
| Crear, leer, actualizar y borrar filas de `user` y `role` | Decidir si una membresía está vigente |
| Asignar roles en `user_role` | Escribir en `membership`, `user_membership` o `payment` |
| Sincronizar usuarios con Cognito | Registrar accesos al gimnasio |
| Emitir su propio evento si algún día se crea | Modificar `qr_access` o `access_log` |

### `GYMETR-Membership` (02)

| Puede hacer | No puede hacer |
|-------------|----------------|
| Administrar planes en `membership` | Autenticar o autorizar por sí mismo |
| Administrar suscripciones en `user_membership` | Crear o modificar usuarios |
| Registrar pagos en `payment` | Generar o validar códigos QR |
| Responder si un usuario tiene un permiso | Escribir en tablas de QR o de sedes |

### `GYMETRA-Qr` (03)

| Puede hacer | No puede hacer |
|-------------|----------------|
| Generar y validar `qr_access` | Conceder acceso sin preguntar a Membership |
| Registrar entradas y salidas en `access_log` | Marcar una membresía como `EXPIRED` |
| Administrar `branch`, `exercises` y `recipes` | Crear ni cobrar membresías |
| Consumir Spoonacular, ExerciseDB y MyMemory | Hablar con Cognito para administration de usuarios |

---

## Reglas que se aplican a todos

1. **Ningún servicio lee las tablas de otro directamente.** Se llama por REST. Hay dos
   excepciones documentadas: `GYMETRA-Qr` → `GYMETR-Membership` vía REST, que lo cumple; y
   `GYMETRA-Qr` leyendo `user` directamente con `UserMin`/`UserMinRepository` (solo lectura, la
   usa `QrAccessController` para resolver el `user_id`). La violación actual es que los tres
   podrían leer todo porque comparten usuario de base de datos.

2. **Las escrituras son exclusivas del dueño de la tabla.** Si otro servicio necesita cambiarla,
   se pide un endpoint al dueño. Nunca se escribe en la tabla de otro "porque es más rápido".

3. **Nada de borrado físico de datos que son historial.** `user`, `user_membership` y
   `payment` contienen historial que un informe necesita años después. Se usa baja lógica.

4. **Las claves de terceros no salen del backend.** Ningún servicio expone una clave de API
   externa en una respuesta. El frontend consume a través del backend, nunca a Spoonacular ni a
   RapidAPI directamente (ver R-09).

5. **Un servicio no conoce la base de datos de otro.** Hoy los tres conocen `gymdb` completa.
   El objetivo es que cada usuario de base de datos solo pueda tocar las tablas de su servicio.

6. **Toda llamada entre servicios tiene tiempo de espera y respuesta por defecto.** Hoy
   `GYMETRA-Qr` llama a Membership sin ninguno de los dos: si Membership se cae, el gimnasio
   deja de admitir socios.

---

## Inventario de violaciones actuales

| Regla | Estado | Evidencia | Riesgo |
|-------|--------|-----------|--------|
| 1. No leer tablas ajenas | ❌ Violada | Los tres servicios comparten el usuario `postgres` | R-12 |
| 2. Escrituras exclusivas del dueño | ⚠️ Parcial | `GYMETRA-Qr` lee `user_membership` vía REST, pero cualquier servicio puede escribir en cualquier tabla | R-12 |
| 3. Nada de borrado físico | ❌ Violada | `DELETE /api/auth/users/{userId}` con `ON DELETE CASCADE` | R-22 |
| 4. Claves de terceros en el backend | ⚠️ Parcial | `spoonacular.api.key` y `rapidapi.exercise.key` están en `application.properties` con valor por defecto; el frontend además intenta leer una clave de Spoonacular | R-09, R-15 |
| 5. Un servicio, sus tablas | ❌ Violada | Un solo usuario de base de datos para los tres servicios | R-12 |
| 6. Timeout y respuesta por defecto | ❌ Violada | El `RestTemplate` de QR (bean en `SecurityConfig`) no define timeout ni fallback | R-12, R-27 |

---

## Cómo hacer cumplir las reglas

Las reglas 1, 2 y 5 se aplican con permisos de base de datos, no con disciplina:

```sql
-- Un usuario por servicio, con acceso solo a sus tablas
CREATE USER gymetra_login WITH PASSWORD '...';
GRANT SELECT, INSERT, UPDATE, DELETE ON user, role, user_role TO gymetra_login;
GRANT USAGE ON SCHEMA public TO gymetra_login;

-- El servicio de membresías no debe poder tocar qr_access
REVOKE ALL ON qr_access FROM gymetra_membresias;
```

La regla 6 se aplica en el cliente HTTP:

```java
// En el bean RestTemplate de QR (SecurityConfig), con timeouts explícitos
RestClient.builder()
    .baseUrl(app.services.membership-url)
    .requestFactory(ClientHttpRequestFactoryBuilder
        .withDefaults()
        .build(ClientHttpRequestFactorySettings.defaults()
            .withConnectTimeout(Duration.ofSeconds(2))
            .withReadTimeout(Duration.ofSeconds(3))))
    .build();
```

Y el fallback: si Membership no responde, el registro de `access_log` debe decidir con la última
membresía conocida en caché local, en lugar de denegar el acceso.

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`catalogo-de-servicios.md`](catalogo-de-servicios.md) | Matriz de comunicación y propiedad de datos |
| [`patrones-de-comunicacion.md`](patrones-de-comunicacion.md) | Cómo se implementan estas reglas en el código |
| [`ADR-002`](../05-arquitectura/decisiones/registros/ADR-002-base-datos-compartida.md) | Por qué se comparten la base |
| [`R-12`](../15-control-proyecto/riesgos.md) | Riesgo de la base compartida |
