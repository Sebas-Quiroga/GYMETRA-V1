# Reglas de seguridad del código

> Reglas obligatorias para escribir código en GYMETRA. Aplican a los tres
> microservicios Spring Boot y a las dos aplicaciones Vue 3.

## Principio rector

> **El código nunca contiene secretos. La configuración contiene secretos. El
> entorno contiene configuración.**

Un valor que aparece como *valor por defecto* en un archivo versionado no es un default
seguro: es una credencial publicada.

---

## 1. Secretos

### Regla

Todo valor sensible se lee de una variable de entorno, y su valor por defecto está **vacío**.

```properties
# ✅ Correcto — sin valor por defecto
stripe.secret.key=${STRIPE_SECRET_KEY:}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:}

# ❌ Prohibido — el valor por defecto es la credencial real
rapidapi.exercise.key=${RAPIDAPI_EXERCISE_KEY:c9c5ed51...}
spoonacular.api.key=${SPOONACULAR_API_KEY:3a5d9c62...}
```

### Por qué importa

Un default vacío hace que la aplicación **falle al arrancar** si falta la variable: el
error aparece en desarrollo, antes de que exista el riesgo.

Un default con la clave real hace que la aplicación **arranque en todas partes**,
incluyendo producción, usando una credencial que:

1. está en el historial de Git de forma permanente,
2. es legible por cualquiera con acceso al repositorio (incluso solo lectura),
3. sobrevive a cualquier intento posterior de "limpiarla" del archivo.

### Qué hacer si un secreto ya está versionado

Eliminar la línea **no es suficiente**. El valor permanece en el historial. La secuencia
correcta es:

1. **Revocar y rotar** la credencial en el proveedor (RapidAPI, Spoonacular, AWS, Stripe).
2. Eliminar el valor por defecto y dejar la variable vacía.
3. Documentar el incidente en [`politica-de-seguridad.md`](./politica-de-seguridad.md).
4. Si la política de la institución lo exige, reescribir el historial (`git filter-repo`).
   Ojo: reescribir historia invalida clones existentes y requiere coordinación con el equipo.

---

## 2. Datos personales

GYMETRA maneja datos personales de socios: nombre, identificación, correo, teléfono y foto.

### Regla

| Dato | Tratamiento permitido |
|------|----------------------|
| Contraseñas | Solo hash **BCrypt**. Nunca en texto plano, nunca en logs, nunca reversible. |
| JWT | Firmado, con expiración corta. El refresh token nunca viaja en la URL. |
| Identificación, email, teléfono | No se imprimen en logs en nivel `INFO` o superior. |
| Fotos (URL) | Se almacenan como referencia, no como binario en base de datos. |
| Datos de tarjeta | **Nunca** pasan por GYMETRA. Van directo a Stripe (tokenización). |

### Regla de logging

Los loggers de SQL con nivel `TRACE` imprimen los valores de los parámetros de binding.
Eso significa que un `SELECT * FROM "user"` con TRACE activo **imprime emails,
identificaciones y hashes de contraseña** en la consola.

```properties
# ❌ Prohibido en cualquier perfil que no sea una sesión local aislada
spring.jpa.show-sql=true
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
logging.level.org.hibernate.type.descriptor.sql.BasicExtractor=TRACE

# ✅ Correcto
spring.jpa.show-sql=false
logging.level.org.hibernate.SQL=WARN
```

> **Estado actual:** los tres servicios tienen el bloque `TRACE` activo por defecto — en
> Membership y QR en `application.properties`, en GYMETR-login en `application.yml`. Debe
> moverse a un perfil `local` y apagarse en `prod`. Ver hallazgo #5 en el
> [README de esta sección](./README.md).

---

## 3. Control de acceso (CORS y autorización)

### Regla

- **Nunca** `@CrossOrigin(origins = "*")` en un endpoint que toque datos de socios.
- Los orígenes permitidos se declaran **por variable de entorno**, no hardcodeados.
- `allowCredentials = true` exige listas de orígenes **explícitas**: el comodín es
  rechazado por el navegador cuando hay credenciales, así que `*` + `allowCredentials`
  es una configuración rota, no una configuración permisiva.
- Todo endpoint que no esté en la lista de `permitAll()` requiere `authenticated()`.

### Referencia de la configuración actual

Los tres servicios comparten el mismo patrón de CORS, con una diferencia que conviene
unificar:

```java
// GYMETR-login y GYMETR-Membership
config.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));

// GYMETRA-Qr — añade túneles de desarrollo
config.setAllowedOriginPatterns(List.of(
    "http://localhost:*", "http://127.0.0.1:*",
    "https://*.ngrok-free.dev", "http://*.ngrok-free.dev"
));
```

> **Decisión pendiente:** los orígenes de `ngrok` permiten que **cualquier persona con un
> túnel de ngrok** llame a la API de producción desde el navegador. Se recomienda
> restringirlos al perfil `local` y a un subdominio propio de tunnels en lugar del
> comodín `*.ngrok-free.dev`.

---

## 4. Autenticación y autorización

### Regla

- AWS Cognito es la **única** fuente de verdad de identidad. Cada microservicio valida el
  JWT como *resource server* (firma + emisor + audiencia), sin emitir tokens.
- Los microservicios **no** confían en los headers de rol que envía el frontend. Los roles
  se leen del claim `cognito:groups` del token verificado.
- El servicio de membresías expone la verificación de permisos
  (`/api/user-memberships/user/{id}/permission/{permiso}`) en `permitAll()` porque el
  servicio QR lo consume **sin** propagar credenciales. Esto es un punto ciego: cualquiera
  que conozca un `userId` puede consultar el estado de su membresía. Ver
  [ADR-006](../05-arquitectura/decisiones/registros/ADR-006-proxy-validacion-membresia.md).

---

## 5. Integraciones de terceros

GYMETRA integra seis proveedores externos. Cada uno maneja claves distintas:

| Proveedor | Dónde se usa | Clave |
|-----------|--------------|-------|
| AWS Cognito | Autenticación en los 3 backends y ambos frontends | `COGNITO_ISSUER_URI`, `COGNITO_CLIENT_ID`, `COGNITO_JWKS_URI`, `VITE_COGNITO_*` |
| Stripe | Pagos en `GYMETR-Membership` | `STRIPE_SECRET_KEY` (backend), `VITE_STRIPE_PUBLIC_KEY` (frontend) |
| RapidAPI / ExerciseDB | Catálogo de ejercicios en `GYMETRA-Qr` | `RAPIDAPI_EXERCISE_KEY` |
| Spoonacular | Recetas en `GYMETRA-Qr` | `SPOONACULAR_API_KEY` |
| MyMemory | Traducción de términos al español en `GYMETRA-Qr` | Sin clave, cuota pública |
| SMTP (Gmail) | Notificaciones en login y Membership | `SPRING_MAIL_*` |

### Regla

- Las claves se inyectan por entorno. Ver regla 1.
- Los servicios que llaman a APIs de terceros manejan el fallo de forma **degradada**:
  si Spoonacular falla, el usuario ve un mensaje, no un error 500. Esto ya está
  implementado en `ExerciseSyncService`, `NutritionSyncService` y `TranslationService`.
- Los datos descargados de terceros se **copian a la base de datos local** en el arranque.
  GYMETRA no consulta Spoonacular ni ExerciseDB en cada petición: la lógica de negocio
  depende de la base local, no de la disponibilidad del tercero.

---

## 6. Checklist de seguridad antes de abrir un PR

- [ ] ¿Algún valor sensible quedó hardcodeado? (buscar: `key=`, `secret`, `password`, `123456`)
- [ ] ¿El endpoint nuevo requiere autenticación o está en `permitAll()` **a propósito**?
- [ ] ¿Se añadió información personal a un log?
- [ ] ¿El `SELECT` o el DTO que expongo devuelve más campos de los necesarios?
- [ ] ¿El endpoint nuevo acepta entrada del usuario sin validar?
- [ ] ¿La llamada a un tercero maneja el fallo sin propagar la excepción?
