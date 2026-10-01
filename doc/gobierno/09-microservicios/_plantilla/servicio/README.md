# Servicio — <NOMBRE>

> <Una o dos frases: qué hace este servicio y por qué existe.>

---

## Ubicación en la arquitectura

| Campo | Valor |
|-------|-------|
| **Carpeta** | `backend/<CARPETA>` |
| **Paquete raíz** | `com.<paquete>` |
| **Puerto** | <PUERTO> |
| **Spring Boot** | <VERSIÓN> |
| **Java** | 17 |
| **Documentación API** | springdoc <VERSIÓN> |
| **Depende de** | <NINGUNO, o lista de servicios y puertos> |
| **Consumido por** | <lista de servicios o frontends> |

---

## Responsabilidades (lo que SÍ hace)

- <RESPONSABILIDAD 1>
- <RESPONSABILIDAD 2>
- <RESPONSABILIDAD 3>

---

## Fuera de alcance (lo que NO hace)

| No hace | Por qué no le corresponde |
|---------|---------------------------|
| <TAREA> | <RAZÓN CONCRETA, con el servicio dueño> |

---

## Controladores

| Controlador | Ruta base | Endpoints |
|-------------|-----------|-----------|
| `<Clase>` | `/api` | N |
| **Total** | | **N** (N públicos, N autenticados) |

---

## Cómo ejecutarlo en local

### Requisitos

- JDK 17
- Maven 3.8 o superior
- PostgreSQL 15 con la base `<BASE>` creada
- <OTRAS DEPENDENCIAS>

### Variables de entorno

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/<BASE>
export SPRING_DATASOURCE_USERNAME=<usuario>
export SPRING_DATASOURCE_PASSWORD=<contraseña>
```

### Arranque

```bash
cd backend/<CARPETA>
mvn spring-boot:run
```

### Verificación

```bash
# Endpoint público
curl http://localhost:<PUERTO>/api/<ruta-publica>

# Endpoint protegido: debe devolver 401
curl -i http://localhost:<PUERTO>/api/<ruta-protegida>
```

---

## Documentos de este servicio

| Documento | Contenido |
|-----------|-----------|
| [`modelo-de-datos.md`](./modelo-de-datos.md) | Tablas que posee |
| [`decisiones.md`](./decisiones.md) | Decisiones técnicas con su motivo y estado |
| [`eventos.md`](./eventos.md) | Eventos que publica y consume |
| [`runbook.md`](./runbook.md) | Qué hacer cuando falla |
