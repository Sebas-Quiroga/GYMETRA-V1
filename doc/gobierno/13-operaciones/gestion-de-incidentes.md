# Gestión de incidentes

> Qué hacer cuando algo falla. Escrito para el equipo pequeño que mantiene GYMETRA, sin
> herramientas de guardia ni rotación formal: el procedimiento tiene que ser ejecutable por una
> persona sola.

---

## Premisa

No hay sistema de gestión de incidentes, ni canal de guardia, nirotación de responsables. Por eso
este documento define un procedimiento ligero: **una persona, un canal, una hoja de registro**.

---

## Severidad

| Nivel | Criterio | Ejemplo en GYMETRA | Tiempo de respuesta |
|-------|----------|--------------------|---------------------|
| **S1 · Crítico** | El sistema no sirve para su propósito | Ningún socio puede entrar al gimnasio | 15 minutos |
| **S2 · Alto** | Una función central falla, hay alternativa parcial | Los pagos no se pueden completar | 1 hora |
| **S3 · Medio** | Función secundaria caída o degradada | El plan de nutrición no carga | 4 horas |
| **S4 · Bajo** | Molestia sin bloqueo | Un icono mal alineado en el panel | Próxima iteración |

### Los incidentes que ya han ocurrido o pueden ocurrir

| Severidad probable | Incidente | Riesgo |
|--------------------|-----------|--------|
| S1 | Membership caído: los accesos se deniegan a todos | R-28 |
| S1 | Base de datos inaccesible: los tres servicios caen | R-12 |
| S2 | Pagos fallan por campos `NOT NULL` | R-02 |
| S2 | Despliegue con credenciales incorrectas | R-15 |
| S2 | `docker volume prune` borra datos del pipeline | — |
| S3 | Cuota de Spoonacular agotada: no hay planes de nutrición | R-27 |
| S3 | Sincronización con Cognito falla | R-21 |
| S3 | La aplicación móvil no apunta a la red correcta | — |
| S3 | JDBC sin timeout: un fallo de red cuelga los servicios | — |

> **El primero de la lista es el más grave del sistema.** Membership es la dependencia de la que
> depende la entrada al gimnasio, y su caída no degrada: bloquea. Sin timeout configurado en el
> cliente, además, el síntoma puede ser un congelamiento en lugar de un error.

---

## Roles

Con un equipo pequeño, el rol se asigna por persona según el incidente, no por cargo fijo.

| Rol | Quién | Responsabilidad |
|-----|-------|-----------------|
| **Responsable** | Quien detecta | Coordina, no ejecuta: decide qué hacer y cuándo escalar |
| **Ejecutor** | Una persona técnica | Aplica el cambio, con el responsable informante |
| **Comunicador** | Quien avisa a los afectados | Escribe a socios y personal del gimnasio |

> En un equipo de una persona, los tres roles recaen en la misma, y el procedimiento sigue
> siendo válido.

---

## Procedimiento

### 1. Detectar

Fuentes de detección, todas laxes hoy:

| Fuente | Fiable |
|--------|--------|
| Queja de un socio | Sí |
| Queja del personal del gimnasio | Sí |
| Revisión de `docker-compose logs` | Sí |
| Métrica o alerta | No: no existen |
| Health check del pipeline | No: devuelve 404 y siempre pasa |

### 2. Clasificar

Determinar el nivel con la tabla de severidad, y responder tres preguntas:

1. ¿A cuántos socios afecta?
2. ¿Hay una función alternativa?
3. ¿Es un fallo de configuración, de código o de third party?

### 3. Contener

Objetivo: reducir el daño, no arreglar. En este orden:

| Acción | Cuándo |
|--------|--------|
| Reiniciar el servicio afectado | Fallo de proceso, base bien |
| Revertir el último despliegue | El fallo empezó tras un despliegue |
| Bloquear la función afectada en la interfaz | Evitar que el socio intente algo roto |
| Activar mantenimiento en la pantalla afectada | S1 o S2 sin alternativa |
| Apagar el servicio caído | S1 sin valor operativo: no es peor que dejarlo caído |

> Para S1 hay que elegir rápido entre dos opciones igual de malas: reiniciar o restaurar. **Reiniciar
> primero**, porque es reversible y rápido. Si el servicio no arranca, el siguiente paso es
> revisar la base de datos.

### 4. Diagnosticar

Herramientas disponibles, en orden de uso:

```bash
# 1. Estado de los contenedores
docker-compose ps

# 2. Logs del servicio sospechoso (el compose solo define database, backend y frontend;
#    Membership y QR se ejecutan fuera del compose)
docker-compose logs -f --tail=200 backend

# 3. Estado de la base de datos
docker-compose exec database psql -U postgres -c "\l"
docker-compose exec database psql -U postgres -d gymdb -c 'SELECT count(*) FROM "user";'

# 4. Comprobar si un servicio responde
curl -i http://localhost:8080/api/auth/...
curl -i http://localhost:8081/api/user-memberships/...
```

Para Membership caído, la comprobación que decide todo:

```bash
# ¿Está vivo el servicio, o es la base de datos?
# Membership no está en el compose: se comprueba por HTTP desde el host
# (no hay Actuator, se usa un endpoint real)
curl -i http://localhost:8081/api/user-memberships/user/1/permission/access_gym
```

| Resultado | Diagnóstico | Acción |
|-----------|------------|--------|
| Sin respuesta | Proceso caído | Reiniciar el contenedor |
| Error 500 con excepción de conexión | Base de datos inaccesible | Revisar credenciales, R-12 |
| Error 500 con excepción de consulta | Tabla o columna inexistente | Revisar esquema |
| Respuesta 200 | Membership vive: el fallo está en QR | Diagnosticar el cliente proxy |

### 5. Corregir

Preferir siempre la corrección más pequeña que funcione:

| Tipo | Ejemplo |
|------|---------|
| Configuración | Credencial de base de datos correcta |
| Despliegue | Revertir al commit anterior |
| Código | Corrección puntual, con prueba |
| Contención | Función deshabilitada hasta poder arreglarla bien |

> **Cambiar código durante un S1 es mala idea salvo que sea la única salida.** El sistema no tiene
> pruebas, así que un cambio en caliente no tiene red de seguridad. Revertir es más seguro que
>parchear a ciegas.

### 6. Comunicar

Plantillas mínimas, en español y sin tecnicismos:

**S1 — durante**
> GYMETRA tiene dificultades para registrar los accesos al gimnasio. El equipo ya está
> trabajando en ello. Disculen las molestias.

**S1 — resuelto**
> El acceso al gimnasio vuelve a funcionar con normalidad. Gracias por su paciencia.

**S2 — durante**
> Las renovaciones de membresía no se están procesando. El equipo lo está solucionando; no hace
> falta repetir el pago.

**S3 — durante**
> El plan de nutrición no se puede cargar temporalmente. Los demás servicios funcionan con
> normalidad.

### 7. Cerrar y registrar

Una línea por incidente, con estos campos:

```markdown
## 2026-03-14 · S1 · Accesos denegados a todos los socios

- **Síntoma**: los QR devuelven "sin acceso" para socios con membresía vigente.
- **Alcance**: 100 % de los socios, todas las sucursales.
- **Causa**: el contenedor de Membership no arrancaba por una credencial incorrecta.
- **Duración**: 42 minutos.
- **Resolución**: credencial corregida y contenedor reiniciado.
- **Detección**: queja de un socio a los 18 minutos.
- **Prevention**: añadir Actuator para detectar la caída sin esperar una queja.
```

> La última línea es la más importante. Sin ella, los mismos incidentes vuelven a ocurrir.

---

## Errores a evitar

| Error | Por qué es un error |
|-------|--------------------|
| Reiniciar todo a la vez | Se pierde la evidencia de cuál era el servicio con fallo |
| Borrar logs antes de leerlos | Se pierde la causa |
| Cambiar base de datos sin copia | Sin transacciones, y la base es común a los tres servicios: R-12 |
| Corregir en producción sin prueba | No hay red de seguridad: 0 pruebas de negocio |
| No avisar a los socios | Se imaginan que el sistema está caído |
| No escribir el parte | El incidente se repite en seis meses |

---

## Lo mínimo que hay que montar

En orden de prioridad:

| # | Acción | Esfuerzo | Beneficio |
|---|--------|----------|-----------|
| 1 | Canal de comunicación único para incidentes | Muy bajo | Fin de la ambigüedad |
| 2 | Plantillas de comunicación listas | Muy bajo | Avisar en minutos |
| 3 | Fichero `INCIDENTES.md` con el formato de la sección 7 | Muy bajo | Memoria del equipo |
| 4 | Actuator en los tres servicios | Bajo | Detectar sin esperar una queja |
| 5 | Alerta de caída | Medio | Detectar sin mirar nada |
| 6 | Copia de base de datos antes de tocar el esquema | Bajo | Poder revertir |
| 7 | Runbooks por servicio | Bajo | Responder sin improvisar |

Los puntos 1, 2 y 3 no cuestan nada y ya eliminan la mayor parte del problema. Son los primeros.

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`observabilidad.md`](observabilidad.md) | Qué alertas dispararían este procedimiento |
| [`09-microservicios/servicios/*/runbook.md`](../09-microservicios/README.md) | Runbooks por servicio |
| [`10-devops/README.md`](../10-devops/README.md) | Reinicio y despliegue |
| [`15-control-proyecto/riesgos.md`](../15-control-proyecto/riesgos.md) | Riesgos con incidente asociado |
