# Runbook — <NOMBRE>

> Qué hacer cuando `<NOMBRE>` falla a las 3 de la mañana. Los pasos están escritos para que alguien
> que no conoce el servicio pueda ejecutarlos sin preguntar.

---

## 1. Información rápida

| Campo | Valor |
|-------|-------|
| **Servicio** | `<NOMBRE>` |
| **Puerto** | `<PUERTO>` |
| **Paquete** | `<PAQUETE>` |
| **Base de datos** | `<BASE>` |
| **Tablas** | `<TABLAS>` |
| **Spring Boot** | `<VERSIÓN>` |
| **Contenedor** | `<SERVICIO EN COMPOSE>` o "No está en docker-compose.yml" |
| **Documentación** | `http://localhost:<PUERTO>/swagger-ui.html` |

---

## 2. Verificar que el servicio está sano

```bash
# ¿Responde el puerto?
curl -i http://localhost:<PUERTO>/swagger-ui.html
```

```bash
# ¿La seguridad responde correctamente? (debe devolver 401)
curl -i http://localhost:<PUERTO>/api/<ruta-protegida>
```

| Resultado | Significado |
|-----------|-------------|
| `200` en Swagger | El proceso está vivo |
| `401` en endpoint protegido | Proceso vivo y seguridad cargada: correcto |
| `500` al arrancar | Fallo de configuración o de esquema |
| Sin respuesta | El proceso no está escuchando |

> Si el servicio no incluye `spring-boot-starter-actuator`, `/actuator/health` devuelve 404 y el
> health check del pipeline no confirma nada. Anotarlo aquí si aplica.

---

## 3. Alertas frecuentes y qué hacer

### Alerta: <SÍNTOMA OBSERVABLE>

**Causa más probable:** <CAUSA VERIFICADA EN CÓDIGO>

```bash
# Comando de diagnóstico
<COMANDO>
```

| Diagnóstico | Causa | Acción |
|-------------|-------|--------|
| <HALLAZGO> | <CAUSA> | <ACCIÓN> |

---

## 4. Procedimientos por componente

### 4.1 Base de datos

```bash
docker exec -it <CONTENEDOR_DB> psql -U postgres -d <BASE> -c "SELECT 1;"
```

### 4.2 <OTRO COMPONENTE>

```bash
<COMANDOS>
```

---

## 5. Operaciones de mantenimiento

### 5.1 Reiniciar

```bash
docker-compose restart <SERVICIO>
docker-compose logs -f <SERVICIO>
```

### 5.2 Despliegue

```bash
git checkout <commit>
docker-compose build --progress=plain <SERVICIO>
docker-compose up -d <SERVICIO>
docker-compose logs --tail=50 <SERVICIO>
```

> Verificar manualmente después de desplegar: no confiar solo en el pipeline verde.

### 5.3 Revertir

```bash
git log --oneline -5
docker image tag <IMAGEN>:<commit-anterior> <IMAGEN>:latest
docker-compose up -d <SERVICIO>
```

> Revertir el código no revierte los cambios de base de datos.

---

## 6. Contención durante un incidente

| Opción | Viabilidad | Nota |
|--------|------------|------|
| <OPCIÓN> | <VIABLE / NO EXISTE> | <NOTA> |

---

## 7. Checklist posterior a un incidente

- [ ] ¿Se identificó la causa raíz?
- [ ] ¿Se corrigió la causa o solo el síntoma?
- [ ] ¿Hay una prueba que habría detectado este fallo? Si no, se escribe.
- [ ] ¿El fallo corresponde a un riesgo ya registrado? Se actualiza su estado.
- [ ] ¿Corresponde a un riesgo nuevo? Se registra con su número y su responsable.
- [ ] ¿Se revisó el impacto en los datos? ¿Quedó historial incompleto?
- [ ] ¿Se documentó el incidente para quien no estaba presente?

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`13-operaciones/observabilidad.md`](../../../13-operaciones/observabilidad.md) | Qué debería medirse |
| [`13-operaciones/gestion-de-incidentes.md`](../../../13-operaciones/gestion-de-incidentes.md) | Severidad y roles |
| [`10-devops/entornos.md`](../../../10-devops/entornos.md) | Variables por ambiente |
| [`R-NN`](../../../15-control-proyecto/riesgos.md) | Riesgo asociado |
