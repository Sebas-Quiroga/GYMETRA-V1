# Definición de Hecho (DoD — Definition of Done)

> Criterios que una Historia de Usuario debe cumplir **antes** de considerarse terminada.
> No hay historia "casi terminada".

## Principio

> Si algo no cumple esta definición, no está terminado. "Terminado" no es una opinión,
> es una lista de casillas verificadas.

---

## Criterios de terminación

### Código

- [ ] **Compila** sin errores ni advertencias nuevas.
- [ ] **Lint y formato** limpios en los archivos modificados.
- [ ] **Sin código muerto**: ni comentarios, ni imports, ni funciones sin uso.
- [ ] **Sin secretos** hardcodeados (ver [`reglas-de-seguridad.md`](./reglas-de-seguridad.md)).
- [ ] **Sin `print`/`System.out.println`/`console.log` olvidados** en producción.

### Pruebas

- [ ] **Pruebas unitarias** escritas para la lógica nueva o modificada, y en verde.
- [ ] **Cobertura ≥ 80%** en los archivos modificados.
- [ ] **Casos de error** probados, no solo el camino feliz.
- [ ] **Pruebas pasando** las tres: backend y ambos frontends.

> **Estado actual:** la cobertura real del proyecto es mínima — solo 2 de los 3 backends tienen
> una clase de prueba (`GYMETR-login` y `GYMETR-Membership`, `*ApplicationTests.java`), que
> verifica que el contexto de Spring carga; **`GYMETRA-Qr` no tiene ninguna**. No hay pruebas
> de negocio. Este criterio **no se cumple hoy** para ninguna HU y está registrado como R-04 en
> [`riesgos.md`](../15-control-proyecto/riesgos.md).

### Documentación

- [ ] **Documentación actualizada** según el tipo de cambio:

| Si el cambio… | Actualizar |
|---------------|------------|
| Añade o modifica un endpoint | Contrato OpenAPI en `07-api/contratos/openapi/` |
| Cambia un modelo de datos | `06-datos/modelo-de-datos.md` y el `data-model.md` del servicio |
| Añade o cambia una entidad, regla o evento de negocio | `02-dominio/` |
| Toma una decisión de arquitectura | ADR nuevo en `05-arquitectura/decisiones/registros/` |
| Añade un microservicio | `09-microservicios/catalogo-de-servicios.md` |
| Cambia un flujo de usuario | `12-ux-ui/mapa-de-navegacion.md` |
| Cambia el pipeline o un entorno | `10-devops/` |

- [ ] **Diagramas** actualizados si cambió un flujo o una estructura.
- [ ] **Comentarios en el código** explican el por qué, no el qué.

### Revisión

- [ ] **PR revisado** por al menos una persona.
- [ ] **Sin conflictos** con `develop`.
- [ ] **Conventional Commit** correcto.
- [ ] **HU trazada**: existe una relación explícita entre la HU, el código y las pruebas.

---

## Verificación de la cobertura

Backend (por microservicio):

```bash
cd backend/GYMETR-login
./mvnw test
./mvnw jacoco:report
```

Frontend:

```bash
cd frontend/admin-frontend
npm run test:unit -- --coverage
```

> **Nota:** ninguno de los tres backends tiene el plugin `jacoco` declarado en su
> `pom.xml` actualmente. Hay que añadirlo para que el comando funcione. Registrado en
> [`11-calidad/README.md`](../11-calidad/README.md).

---

## Checklist de PR

```markdown
## Definición de Hecho — HU-XXX

- [ ] Compila sin errores
- [ ] Lint limpio
- [ ] Sin secretos en el código
- [ ] Pruebas unitarias escritas y en verde
- [ ] Cobertura ≥ 80% en archivos modificados
- [ ] Casos de error probados
- [ ] Documentación actualizada (marcar los que apliquen)
- [ ] PR con al menos una aprobación
- [ ] Conventional Commit correcto
```

---

## Anti-patrones

| Lo que se ve | Por qué está mal |
|--------------|------------------|
| «Lo dejo para el siguiente sprint» | La HU no está terminada; está abandonada a medias |
| «Actualizo el doc después del merge» | El documento nunca se actualiza |
| Pruebas que solo verifican que no hay excepción | No prueban comportamiento, prueban que el método no explota |
| Subir directamente a `main` | Rompe el flujo de revisión y el trazabilidad |
| Ampliar el alcance dentro de la HU | La HU debe caber en el sprint o se divide |
