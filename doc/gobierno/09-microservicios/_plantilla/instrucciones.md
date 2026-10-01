# Plantilla de ficha de servicio

> Cómo se documenta un servicio nuevo. Copia `_plantilla/servicio/` a `09-microservicios/servicios/NN-<nombre>/`
> y sustituye los marcadores `<...>`.

---

## Estructura

```
09-microservicios/
├── README.md                              Índice y mapa de servicios
├── catalogo-de-servicios.md               Matriz de comunicación y propiedad de datos
├── reglas-de-frontera.md                  Qué puede hacer cada servicio
├── patrones-de-comunicacion.md            Patrones de comunicación y eventos
└── servicios/
    ├── 01-<servicio-a>/
    │   ├── README.md                      Identidad, responsabilidades, cómo ejecutarlo
    │   ├── modelo-de-datos.md             Tablas que posee, con sus problemas
    │   ├── decisiones.md                  Decisiones técnicas con motivo y estado
    │   ├── eventos.md                     Qué publica y consume, con su especificación
    │   └── runbook.md                     Qué hacer cuando falla
    ├── 02-<servicio-b>/
    └── 03-<servicio-c>/
```

---

## Reglas para escribir una ficha

### 1. El código es la fuente de verdad

| Se escribe | No se escribe |
|------------|---------------|
| Lo que el código hace hoy | Lo que el código debería hacer |
| La ruta real del endpoint | La ruta imaginaria |
| La versión real de la dependencia | Una versión actualizada "porque sí" |
| "No hay timeout definido" | "Con timeout" si no existe |

Si el comportamiento esperado y el implementado coinciden, se documenta el implementado. Si no
coinciden, se documenta el implementado y se anota la brecha en
[`15-control-proyecto/riesgos.md`](../../15-control-proyecto/riesgos.md).

### 2. Los marcadores se sustituyen todos

Antes de dar por buena una ficha, comprobar que no queda ningún `<...>`:

```powershell
Select-String -Path "09-microservicios/servicios/**/*.md" -Pattern '<[A-Z_]+>'
```

### 3. Los datos son verificables

| Dato | Cómo se verifica |
|------|------------------|
| Número de endpoints | Contar anotaciones `@GetMapping`, `@PostMapping`, `@PutMapping`, `@PatchMapping`, `@DeleteMapping` |
| Tablas de un servicio | Las entidades del paquete `entity` del servicio |
| Versión de Spring Boot | El `pom.xml` |
| Puerto | `application.properties` o `application.yml` |
| Claves foráneas | `data/Database-Setup/database_ Initial.sql` |

### 4. Las correlaciones se comprueban

Cada enlace relativo debe resolver. Desde una ficha de servicio:

| Destino | Ruta relativa |
|---------|---------------|
| Otra sección de gobierno | `../../../<seccion>/<archivo>.md` |
| Riesgos | `../../../15-control-proyecto/riesgos.md` |
| Otro servicio | `../<NN-servicio>/<archivo>.md` |

---

## Checklist antes de dar por cerrada una ficha

- [ ] `README.md` con ubicación, responsabilidades, controladores y ejecución local
- [ ] `modelo-de-datos.md` con todas las tablas del servicio y sus inconsistencias
- [ ] `decisiones.md` con al menos una decisión por cada intención real de diseño
- [ ] `eventos.md` que dice claramente si publica o consume eventos
- [ ] `runbook.md` con verificación de salud, alertas y procedimientos
- [ ] Sin marcadores `<...>` pendientes
- [ ] Sin caracteres corruptos ni texto en otro idioma
- [ ] Enlaces relativos verificados
- [ ] Riesgos citados existentes en el registro
- [ ] [`catalogo-de-servicios.md`](../catalogo-de-servicios.md) actualizado con el servicio nuevo
- [ ] [`reglas-de-frontera.md`](../reglas-de-frontera.md) actualizado
- [ ] [`README.md`](../README.md) actualizado

---

## Ejemplo mínimo de decisión

Una decisión es válida cuando responde tres preguntas:

1. **¿Qué problema resolvió?** Sin contexto, la decisión no se puede evaluar.
2. **¿Qué se hubiera pagado a cambio?** El coste explícito es lo que permite revertirla.
3. **¿Sigue vigente?** Si el código ya no la aplica, se marca como revertida.

Sin las tres, es una descripción, no una decisión.
