# Runbook — GYMETRA-Qr

> Qué hacer cuando `GYMETRA-Qr` falla. El caso más importante no es su propia caída, sino la de
> `GYMETR-Membership`: QR deja de admitir socios y el gimnasio se paraliza.

---

## 1. Información rápida

| Campo | Valor |
|-------|-------|
| **Servicio** | `GYMETRA-Qr` |
| **Puerto** | 8090 |
| **Paquete** | `com.GYMETRA.GYMETRA` (subpaquete `qr`) |
| **Base de datos** | `gymdb` (compartida) |
| **Tablas** | `qr_access`, `access_log`, `branch`, `exercises`, `recipes` |
| **Spring Boot** | 3.5.5 |
| **Depende de** | `GYMETR-Membership` en 8081 |
| **Contenedor** | No está en `docker-compose.yml`: **no hay imagen para este servicio** |
| **Documentación** | http://localhost:8090/swagger-ui.html |

> **Este servicio no está en el `docker-compose.yml`.** El compose solo define `database`,
> `backend` (que construye `GYMETR-login` y publica el 8080) y `frontend`. QR se ejecuta
> manualmente o con su propio pipeline, lo que significa que un despliegue de compose solo deja
> el 8080 actualizado: ni el 8090 ni el 8081 de Membership (que tampoco está en el compose) se
> actualizan con él (R-17).

---

## 2. Verificar que el servicio está sano

```bash
# ¿Responde el puerto?
curl -i http://localhost:8090/swagger-ui.html
```

```bash
# ¿La seguridad responde correctamente? (debe devolver 401)
curl -i http://localhost:8090/api/access-log
```

```bash
# ¿Ve a Membership? Esta es la comprobación que de verdad importa.
# El permiso real es "training" o "nutrition"; el endpoint exige JWT → 401 sin token
curl -i http://localhost:8090/api/memberships-proxy/1/check-permission/training

# La misma comprobación saltando a Membership (ruta pública, sin token)
curl -i http://localhost:8081/api/user-memberships/user/1/permission/training
```

| Resultado | Significado |
|-----------|-------------|
| `200` en Swagger | Proceso vivo |
| `401` en endpoint protegido | Proceso vivo y seguridad cargada |
| `200` con `false` en `check-permission` | QR capturó la excepción: no distingue caída de Membership de falta de permiso |
| `502` en `GET /api/memberships-proxy/{userId}` | QR vivo, Membership caído |
| Sin respuesta | Membership caído o sin timeout: la petición queda colgada |

---

## 3. Alertas frecuentes y qué hacer

### Alerta: no se puede validar el acceso (el gimnasio no admite socios)

Esta es **la** alerta crítica del sistema. La causa no está en QR, sino en Membership.

```bash
# 1. Verificar Membership directamente (la ruta de permisos es pública)
curl -i http://localhost:8081/swagger-ui.html
curl -i "http://localhost:8081/api/user-memberships/user/1/permission/training"

# 2. Verificar el cliente de QR (exige JWT)
curl -i "http://localhost:8090/api/memberships-proxy/1/check-permission/training"

# 3. Ver la ruta que realmente usa el ingreso (exige JWT en Membership → 401 esperado)
curl -i "http://localhost:8081/api/user-memberships/user/1"

# 4. Logs: QR y Membership corren en local, cada uno en su terminal de `mvn spring-boot:run`
# (el `backend` del compose es GYMETR-login, no sirve para diagnosticar esta alerta)
```

| Diagnóstico | Causa | Acción |
|-------------|-------|--------|
| Membership no responde en 8081 | Servicio caído | Levantar Membership: sección 4 |
| El permiso responde `false` con membresía vigente | Estado distinto de `ACTIVE` o QR marcado `inactive` | Verificar `user_membership`, sección 4.2 |
| La ruta de la llamada de ingreso devuelve `401` | QR envía la petición sin token (R-28) | Corregir la autenticación entre servicios |
| La petición se queda colgada | Sin timeout configurado | Interrumpir y tratar como caída de Membership (R-12) |

### Alerta: Spoonacular o el traductor fallan

**Síntoma:** los endpoints de nutrición o traducción devuelven error, pero el acceso al gimnasio
sigue funcionando.

```bash
# QR no está en compose: buscar en la copia de logs del proceso local (sección 5.1)
grep -B2 -A30 'Spoonacular\|spoonacular\|MyMemory\|mymemory' gymetra-qr.log
```

| Causa | Acción |
|-------|--------|
| Clave inválida o ausente | Revisar `spoonacular.api.key` y `VITE_SPOONACULAR_API_KEY` |
| Cuota superada | Esperar al reinicio de cuota; añadir caché (R-27) |
| MyMemory caído | Degradar devolviendo el texto original en inglés |
| Timeout de red hacia la API externa | Añadir timeout al cliente; hoy no está configurado |

> Estas APIs son **no críticas**: si Spoonacular falla, los socios no pueden ver recetas, pero sí
> entrar al gimnasio. Prioridad menor que la caída de Membership.

### Alerta: los QR no validan aunque el socio tenga membresía

```bash
# 1. ¿Tiene suscripción activa?
docker exec -it gymetra_database psql -U postgres -d gymdb -c \
  "SELECT id, user_id, membership_id, end_date, status FROM user_membership WHERE user_id = 1;"

# 2. ¿El QR está activo y no expirado?
docker exec -it gymetra_database psql -U postgres -d gymdb -c \
  "SELECT qr_id, user_id, status, generated_at FROM qr_access WHERE user_id = 1;"
```

| Hallazgo | Causa probable |
|----------|----------------|
| `status` sigue en `ACTIVE` con `end_date` pasada | No hay proceso de expiración (R-06) |
| `status = 'inactive'` | QR invalidado; hay que emitir uno nuevo |
| `generated_at` con más de 12 horas | El QR caducó: la expiración se calcula desde `generated_at` (no existe `expires_at`) |
| No hay filas en `qr_access` | El QR nunca se generó |

### Alerta: las traducciones o los textos de ejercicios salen a medias

**Causa:** la caché de traducciones no está implementada y MyMemory se llama en cada petición.
Con volumen alto se alcanza el límite (R-27).

**Acción:** activar caché de traducciones o limitar las peticiones por minuto.

---

## 4. Procedimientos por componente

### 4.1 Levantar Membership cuando está caído

```bash
# Membership no está en el compose: `docker-compose ps` solo mostrará database,
# backend (GYMETR-login) y frontend. No hay contenedor ni logs de docker-compose para él.

# 1. ¿Responde en 8081?
curl -i http://localhost:8081/swagger-ui.html

# 2. Pararlo: Ctrl+C en la terminal de `mvn spring-boot:run`
# 3. Relanzarlo desde la raíz del repositorio, con copia de la salida
mvn -f backend/GYMETR-Membership spring-boot:run 2>&1 | tee gymetr-membership.log

# Logs de Membership en vivo
tail -f gymetr-membership.log
```

Si Membership no arranca por esquema (por ejemplo, `validate` falla contra una base creada por
script):

```bash
grep -B2 -A40 'validate\|schema' gymetr-membership.log
```

La causa más frecuente: la entidad `Payment` espera columnas español que el script SQL no crea. La
solución es alinear script y entidad, no añadir columnas duplicadas.

### 4.2 Verificar la membresía de un socio

```bash
docker exec -it gymetra_database psql -U postgres -d gymdb <<'SQL'
SELECT u.user_id, u.email, u.status AS usuario,
       um.id AS suscripcion, um.end_date, um.status AS estado_suscripcion
FROM "user" u
LEFT JOIN user_membership um ON um.user_id = u.user_id
WHERE u.email = 'socio@correo.com';
SQL
```

### 4.3 Marcar suscripciones vencidas (mitigación manual de R-06)

```bash
docker exec -it gymetra_database psql -U postgres -d gymdb <<'SQL'
-- Ver primero cuántas hay
SELECT count(*) FROM user_membership
WHERE end_date < NOW() AND status = 'ACTIVE';

-- Actualizar
UPDATE user_membership
SET status = 'EXPIRED'
WHERE end_date < NOW() AND status = 'ACTIVE';
SQL
```

> Ejecutar primero el `SELECT`. La actualización afecta a todas las suscripciones y no hay
> vuelta atrás sin un respaldo previo.

### 4.4 Invalidar los QR de un socio suspendido

```bash
docker exec -it gymetra_database psql -U postgres -d gymdb <<'SQL'
UPDATE qr_access SET status = 'inactive'
WHERE user_id = (SELECT user_id FROM "user" WHERE email = 'socio@correo.com');
SQL
```

Esto mitiga R-23, pero **no lo resuelve**: la suspensión en `GYMETR-login` no llama a Cognito ni a
este servicio, así que el socio puede volver a entrar por otra vía.

### 4.5 Consultar el historial de accesos

```bash
docker exec -it gymetra_database psql -U postgres -d gymdb <<'SQL'
SELECT al.event_ts, u.email, b.name AS sucursal, al.entry_time, al.exit_time, al.result
FROM access_log al
JOIN "user" u ON u.user_id = al.user_id
LEFT JOIN branch b ON b.branch_id = al.branch_id
WHERE al.event_ts > NOW() - INTERVAL '24 hours'
ORDER BY al.event_ts DESC
LIMIT 50;
SQL
```

> No hay ningún índice sobre `event_ts`, así que esta consulta recorre la tabla completa.

---

## 5. Operaciones de mantenimiento

### 5.1 Reiniciar QR

```bash
# Si se ejecuta manualmente: Ctrl+C para pararlo y volver a arrancar
# desde la raíz del repositorio, dejando copia de la salida
mvn -f "backend/GYMETRA - Qr" spring-boot:run 2>&1 | tee gymetra-qr.log

# Ver la copia de logs en vivo
tail -f gymetra-qr.log

# Si se ejecuta como servicio del sistema (ajustar al caso)
sudo systemctl restart gymetra-qr
sudo journalctl -u gymetra-qr -f
```

> QR no está en el compose, así que **no hay un procedimiento estándar de despliegue**. Antes de
> publicar una versión nueva hay que confirmar que el 8090 corresponde al código esperado.

### 5.2 Desplegar

```bash
cd "backend/GYMETRA - Qr"
mvn clean package -DskipTests

# Ejecutar el jar
java -jar target/*.jar
```

> La ruta contiene un espacio. Citarla siempre entre comillas.

### 5.3 Revertir

```bash
git log --oneline -5
# Cambiar al commit anterior y reconstruir
git checkout <commit-anterior>
cd "backend/GYMETRA - Qr"
mvn clean package -DskipTests
```

Recordatorio: revertir código no revierte datos. Con `ddl-auto: update` en desarrollo, una versión
anterior puede fallar contra un esquema ya alterado.

---

## 6. Contención cuando Membership no se puede levantar

Si Membership está caído y el gimnasio debe admitir socios **mientras se repara**:

| Opción | Viabilidad hoy | Nota |
|--------|----------------|------|
| Marcar todas las membresías como activas en la base | ⚠️ Solo como último recurso | Deja registro falso y viola R-06 mientras dure |
| Caché de la última decisión válida en QR | ❌ No existe | Sería la mitigación correcta, requiere desarrollo |
| Validar el QR sin consultar la membresía | ❌ No existe | Abriría la puerta a socios no autorizados |
| Operar en modo manual | ✅ Siempre posible | recepción registra los accesos a mano |

**Recomendación:** hasta que exista la caché, la opción realista es avisar a recepción y operar
de forma manual o aplicar la actualización manual de suscripciones vencidas de la sección 4.3.

---

## 7. Checklist posterior a un incidente

- [ ] ¿Se identificó la causa raíz: QR, Membership o una API externa?
- [ ] ¿Se corrigió la causa o solo el síntoma?
- [ ] ¿Hubo socios a los que se les denegó el acceso indebidamente? ¿Se compensó?
- [ ] ¿Quedó registro de los accesos durante la incidencia?
- [ ] ¿Hay una prueba que habría detectado este fallo?
- [ ] ¿El fallo corresponde a un riesgo ya registrado? Se actualizó su estado.
- [ ] ¿Corresponde a un riesgo nuevo? Se registra con su número y su responsable.
- [ ] ¿Se evaluó si hacía falta un timeout o un fallback para evitar la repetición?

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`02-gymetr-membership/runbook.md`](../02-gymetr-membership/runbook.md) | Runbook del servicio del que depende QR |
| [`patrones-de-comunicacion.md`](../../patrones-de-comunicacion.md) | Configuración de la llamada síncrona |
| [`13-operaciones/observabilidad.md`](../../../13-operaciones/observabilidad.md) | Qué debería medirse |
| [`13-operaciones/gestion-de-incidentes.md`](../../../13-operaciones/gestion-de-incidentes.md) | Severidad y roles |
| [`R-06`](../../../15-control-proyecto/riesgos.md) | Membresía expirada con acceso |
| [`R-12`](../../../15-control-proyecto/riesgos.md) | Dependencia crítica sin timeout |
| [`R-14`](../../../15-control-proyecto/riesgos.md) | Accesos denegados sin registrar |
| [`R-27`](../../../15-control-proyecto/riesgos.md) | Cuota de APIs externas |
