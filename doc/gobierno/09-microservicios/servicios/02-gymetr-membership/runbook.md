# Runbook — GYMETR-Membership

> Qué hacer cuando `GYMETR-Membership` falla. Es el servicio que decide la vigencia de las
> suscripciones: si cae, QR deja de admitir socios. Aquí está lo esencial para contenerlo.

---

## 1. Información rápida

| Campo | Valor |
|-------|-------|
| **Servicio** | `GYMETR-Membership` |
| **Puerto** | 8081 |
| **Paquete** | `com.Membership.GYMETRA` |
| **Base de datos** | `gymdb` (compartida) |
| **Tablas** | `membership`, `user_membership`, `payment` |
| **Spring Boot** | 3.5.5 |
| **Contenedor** | **No está en `docker-compose.yml`**: se arranca en local con `mvn spring-boot:run` |
| **Documentación** | http://localhost:8081/swagger-ui.html (sin autenticación) |

---

## 2. Verificar que el servicio está sano

```bash
# ¿Responde el puerto?
curl -i http://localhost:8081/swagger-ui.html
```

Respuesta esperada: 200 o redirección.

```bash
# ¿La seguridad responde correctamente? (debe devolver 401)
curl -i http://localhost:8081/api/user-memberships
```

| Resultado | Significado |
|-----------|-------------|
| `200` en Swagger | Proceso vivo |
| `401` en endpoint protegido | Proceso vivo y Spring Security cargado: correcto |
| `500` al arrancar | Configuración o esquema incorrectos |
| Sin respuesta | Servicio caído |

```bash
# Logs del servicio. No hay `docker-compose logs` para él: el `backend` del compose es
# GYMETR-login (8080), no este servicio. Arrancar dejando copia de la salida (sección 5.1):
tail -n 100 gymetr-membership.log
```

> **No hay endpoint de salud.** `/actuator/health` devuelve 404, igual que los otros servicios.
> No confiar en el health check del `Jenkinsfile`.

---

## 3. Alertas frecuentes y qué hacer

### Alerta: QR rechaza a todos los socios

**Causa más probable:** `GYMETR-Membership` está caído o responde lento, y el `RestTemplate` de
QR (bean en `SecurityConfig`) no tiene timeout: la petición se cuelga sin respuesta.

```bash
# Ruta que exige JWT (401 sin token): es la que usa el flujo de ingreso
curl -i http://localhost:8081/api/user-memberships/user/1

# Ruta pública: la que realmente invoca el permiso desde QR
curl -i http://localhost:8081/api/user-memberships/user/1/permission/training
```

La segunda debe devolver `200` con `true` o `false` sin token. Si Membership no responde, el
acceso falla por completo (R-12) y el QR queda `inactive` (R-28).

**Mitigación temporal:** hasta que se añadan timeout y fallback, subir el servicio es la única
opción. El camino correcto a medio plazo es que QR guarde la última respuesta en caché.

### Alerta: los pagos fallan (simplificados)

**Síntoma:** el endpoint simplificado devuelve `500` en el insert de `payment`.

**Causa:** las columnas `monto`, `metodo_pago` y `fecha_pago` son `NOT NULL` en la entidad y
`savePaymentSimplified()` no las rellena (R-02).

```bash
# En la copia de logs del proceso local (sección 2)
grep -B2 -A40 'payment\|monto\|not-null' gymetr-membership.log
```

**Acción inmediata:**
1. Usar el endpoint **completo** de `PaymentController` en lugar del simplificado.
2. **No parchear** asignando valores falsos (`0` o `null`): empeoraría el dato.
3. Registrar el riesgo R-02 como abierto hasta que se corrija la entidad.

**Corrección de fondo:** eliminar las columnas duplicadas en español.

### Alerta: DiagnosticController/TableInspectorController expone datos

**Síntoma:** un usuario con token genérico puede ver el esquema y los datos de todos los socios.

**Causa:** ambos controladores están activos y no exigen rol (R-18).

**Acción inmediata (contención):**
- Desplegar una versión sin esos controladores.
- Si no es posible, denegar temporalmente todos los tokens de usuarios no administrativos hasta
  parchear la seguridad.

**Acción de fondo:** moverlos a un perfil `dev-only` y añadir `@PreAuthorize("hasRole('ADMIN')")`.

### Alerta: la membresía vencida sigue dando acceso

**Causa:** no existe un proceso programado que marque `status = 'EXPIRED'` ni que publique
`membership.expired` (R-06).

```sql
-- Ver suscripciones vencidas pero activas
SELECT id, user_id, end_date, status
FROM user_membership
WHERE end_date < NOW() AND status = 'ACTIVE'
ORDER BY end_date;
```

**Acción temporal:**
1. Actualizar `status = 'EXPIRED'` para esas filas.
2. Comunicar a RRHH que el proceso automático no existe.

**Acción de fondo:** implementar el scheduler diario.

### Alerta: al arrancar falla por esquema

**Síntoma:** `Failed to initialize bean ...` con violación de esquema, o `validate` falla.

**Causa:** la entidad `Payment` espera columnas que no existen con el script SQL, pero sí con
`ddl-auto: update`. En producción con `validate`, el arranque falla.

```bash
# En la copia de logs del proceso local (sección 2)
grep -B2 -A40 'validate\|hibernate\|schema' gymetr-membership.log
```

**Acción:** comprobar qué columnas de `payment` existen en la base de producción y alinear el
script con la entidad **o** corregir la entidad para que coincida con el script. **No añadir
las columnas españolas** para parchear: hay que eliminar la duplicación.

---

## 4. Procedimientos por componente

### 4.1 Base de datos

```bash
# Verificar la base responde
docker exec -it gymetra_database psql -U postgres -d gymdb -c "SELECT 1;"

# Comprobar el estado de las tres tablas
docker exec -it gymetra_database psql -U postgres -d gymdb <<'SQL'
SELECT 'membership' t, count(*) FROM membership
UNION ALL
SELECT 'user_membership', count(*) FROM user_membership
UNION ALL
SELECT 'payment', count(*) FROM payment;
SQL

# Buscar pagos con columnas duplicadas problemáticas (si existen)
docker exec -it gymetra_database psql -U postgres -d gymdb \
  -c "\d payment"
```

### 4.2 Comprobar la llamada QR → Membership

```bash
# Ruta pública que sí invoca QR (debe responder sin token)
curl -s "http://localhost:8081/api/user-memberships/user/1/permission/training"

# Ruta que exige JWT: comprueba si Membership está filtrando (401 esperado sin token)
curl -s -i "http://localhost:8081/api/user-memberships/user/1"

# El proxy vive en QR (8090) y también exige JWT: nadie lo invoca desde el producto
curl -s -i "http://localhost:8090/api/memberships-proxy/1/check-permission/training"
```

---

## 5. Operaciones de mantenimiento

### 5.1 Reiniciar

```bash
# El servicio corre en local (no hay contenedor): Ctrl+C en la terminal de
# `mvn spring-boot:run` para pararlo, y desde la raíz del repositorio:
mvn -f backend/GYMETR-Membership spring-boot:run 2>&1 | tee gymetr-membership.log

# Ver la copia de logs en vivo
tail -f gymetr-membership.log
```

### 5.2 Despliegue de corrección

```bash
git checkout <commit-corregido>
mvn -f backend/GYMETR-Membership clean package -DskipTests
# Volver a arrancar (sección 5.1)
```

> Al desplegar, **verificar manualmente** que el servicio responde en 8081. No confiar en el
> pipeline: el Jenkinsfile construye solo 2 de 5 proyectos y su health check es inválido.

### 5.3 Revertir

```bash
git log --oneline -5
git checkout <commit-anterior>
mvn -f backend/GYMETR-Membership clean package -DskipTests
# Volver a arrancar (sección 5.1)
```

Recordatorio: revertir código no revierte cambios de datos ni esquema con `ddl-auto: update`.

---

## 6. Contención ante caída masiva

Si `GYMETR-Membership` no se puede levantar y el gimnasio debe seguir funcionando **mientras se
repara**:

1. **Aceptar el riesgo conscientemente.** Hoy no hay fallback.
2. **Comunicarse con recepción.** Explicar que el sistema está en modo degradado.
3. **Considerar habilitar una caché en QR.** Si QR cacheó el último resultado válido por
   `userId` y `TTL` razonable, puede conceder acceso durante un tiempo limitado. **Esta caché no
   existe** hoy, pero es la única mitigación técnica posible.
4. **No modificar la base directamente** para marcar todas las membresías como activas: eso deja
   registro falso para auditoría.

**Importante:** la mitigación de caché debe diseñarse con cuidado para no permitir que una
membresía vencida siga activa indefinidamente.

---

## 7. Checklist posterior a un incidente

- [ ] ¿Se identificó la causa raíz?
- [ ] ¿Se corrigió la causa o solo el síntoma?
- [ ] ¿Hay una prueba que habría detectado este fallo?
- [ ] ¿El fallo corresponde a un riesgo ya registrado? Se actualiza su estado.
- [ ] ¿Corresponde a un riesgo nuevo? Se registra con su número y su responsable.
- [ ] ¿Quedó el historial de pagos completo e inalterado?
- [ ] ¿El tiempo de detección y resolución quedó registrado
- [ ] ¿Se documentó la mitigación aplicada para futuros incidentes?

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`13-operaciones/observabilidad.md`](../../../13-operaciones/observabilidad.md) | Qué debería medirse |
| [`13-operaciones/gestion-de-incidentes.md`](../../../13-operaciones/gestion-de-incidentes.md) | Severidad y roles |
| [`patrones-de-comunicacion.md`](../../patrones-de-comunicacion.md) | La llamada síncrona QR → Membership |
| [`R-02`](../../../15-control-proyecto/riesgos.md) | Pago incompleto |
| [`R-06`](../../../15-control-proyecto/riesgos.md) | Membresía expirada con acceso |
| [`R-12`](../../../15-control-proyecto/riesgos.md) | Base compartida y dependencia crítica |
| [`R-18`](../../../15-control-proyecto/riesgos.md) | Endpoints de diagnóstico sin restricción de rol |
