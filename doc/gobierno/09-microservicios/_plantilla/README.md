# Plantilla — <NOMBRE DEL SERVICIO>

> **Copia esta carpeta** para documentar un servicio nuevo.
> Renómbrala a `NN-nombre-servicio` (ej.: `06-informe-service`) dentro de
> `09-microservicios/servicios/`.
> Rellena cada archivo y **borra estas instrucciones** cuando el documento esté completo.
>
> Reglas de escritura y checklist de cierre: [`instrucciones.md`](./instrucciones.md).

---

## Responsabilidad

> [Una sola frase: qué hace este servicio y de qué datos es dueño autoritativo.]

**Ejemplo:** "Gestiona la identidad de los socios, los roles y la sincronización con AWS Cognito;
es el dueño autoritativo de la tabla `user` y `role`."

---

## Ubicación en la arquitectura

| Campo | Valor |
|-------|-------|
| Número en el catálogo | [01, 02, 03...] |
| Puerto local | [8080, 8081, 8090...] |
| Carpeta | `backend/<CARPETA>` |
| Paquete raíz | `com.<paquete>` |
| Motor de BD | [PostgreSQL / — ] |
| Estado | [En desarrollo / En producción / Obsoleto] |

---

## Cómo ejecutarlo en local

```bash
# Requisitos
# - JDK 17 y Maven 3.8 o superior
# - PostgreSQL 15 con la base creada (ver 10-devops/configuracion-local.md)

cd backend/<CARPETA>
./mvnw spring-boot:run

# Verificación
curl http://localhost:<PUERTO>/v3/api-docs
```

---

## Endpoints principales

> [Lista breve de los endpoints más importantes. El contrato completo vive en
> `07-api/contratos/openapi/<nombre-servicio>.yaml`]

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/...` | ... |
| POST | `/api/...` | ... |

---

## Archivos de esta carpeta

| Archivo | Contenido | Obligatorio |
|---------|-----------|-------------|
| [`servicio/README.md`](./servicio/README.md) | Ficha del servicio: responsabilidad, ubicación, ejecución | ⭐ Desde el sprint 1 |
| [`servicio/modelo-de-datos.md`](./servicio/modelo-de-datos.md) | Tablas que posee, con tipos y problemas | ⭐ Antes de crear migraciones |
| [`servicio/eventos.md`](./servicio/eventos.md) | Eventos que publica y consume | ⭐ Si publica o consume eventos |
| [`servicio/decisiones.md`](./servicio/decisiones.md) | Decisiones técnicas internas (miniADR) | 🔵 Recomendado |
| [`servicio/runbook.md`](./servicio/runbook.md) | Operación en producción | ⭐ Antes del primer despliegue a staging |
| [`instrucciones.md`](./instrucciones.md) | Reglas de escritura y checklist de cierre | — |

**Contrato API:** si el servicio expone endpoints REST, copia
[`07-api/contratos/openapi/_plantilla-servicio.yaml`](../../07-api/contratos/openapi/_plantilla-servicio.yaml)
a `07-api/contratos/openapi/<nombre-servicio>.yaml`.

---

## Cómo añadir un servicio nuevo

1. Copia `_plantilla/servicio/` → `09-microservicios/servicios/NN-<nombre>/`
2. Actualiza [`../catalogo-de-servicios.md`](../catalogo-de-servicios.md) con la nueva entrada
3. Actualiza [`../reglas-de-frontera.md`](../reglas-de-frontera.md) con sus límites
4. Copia `_plantilla-servicio.yaml` → `07-api/contratos/openapi/<nombre-servicio>.yaml`
5. Abre un PR con al menos el `README.md` y el contrato API esbozado
