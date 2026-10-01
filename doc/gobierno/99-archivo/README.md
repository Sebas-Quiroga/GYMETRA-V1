# 99 · Archivo

> Documentos que ya no están activos pero se conservan por contexto histórico. **No se borra
> nada: se archiva.**

---

## Por qué conservar documentos obsoletos

| Motivo | Ejemplo en GYMETRA |
|--------|--------------------|
| Una decisión rechazada evita repetir la discusión | Por qué se descartó Kafka, cuando el sistema no lo usa |
| Un documento sustituido muestra la evolución | El diseño hexagonal que describe una estructura que el código no tiene |
| El historial explica el presente | Saber que el compose nunca incluyó Membership explica el despliegue manual |

> La tercera fila es la más útil. Varias preguntas de este repositorio tienen respuesta en el
> propio código, y un documento archivado explica por qué el código llegó a ese estado.

---

## Estructura

```
99-archivo/
├── decisiones-descartadas/   Propuestas y decisiones que no prosperaron
└── documentos-obsoletos/     Documentos reemplazados por otros
```

Ambas carpetas existen y están vacías, porque **todavía no se ha archivado nada**. Esa es la
situación real: la documentación de GYMETRA es reciente y ningún documento ha quedado obsoleto.

> Una carpeta vacía no es un fallo. Significa que el proceso de archivo existe antes de necesitarse,
> que es exactamente lo que se busca.

---

## Cómo archivar un documento

### Paso 1: marcar el archivo

Añadir al principio del documento:

```markdown
> ⚠️ **ARCHIVADO — 2026-03-14**
> Reemplazado por: [`06-datos/modelo-de-datos.md`](../06-datos/modelo-de-datos.md)
> Motivo: el esquema se documentó directamente en el diccionario de datos.
```

El archivo conserva su contenido original sin modificar. Lo único que se añade es la cabecera.

### Paso 2: mover a la carpeta correcta

| Tipo de documento | Carpeta |
|-------------------|---------|
| ADR o propuesta que no se adoptó | `decisiones-descartadas/` |
| Documento sustituido por otro vigente | `documentos-obsoletos/` |

### Paso 3: corregir los enlaces entrantes

Buscar quién enlaza al documento movido y actualizar cada referencia. Es el paso que más se olvida
y el único que rompe la navegación:

```bash
# Buscar referencias al documentos movido
grep -rl "nombre-del-documento.md" doc/gobierno/
```

### Paso 4: dejarlo listado aquí

Añadir una entrada en la tabla de la sección de abajo. Un documento archivado que no está
registrado es un documento perdido.

---

## Reglas de archivo

| Regla | Motivo |
|-------|--------|
| Nunca se borra un documento | El valor está en el historial |
| Solo se archiva lo que está **reemplazado** | Lo que solo está equivocado se corrige |
| Se archiva con fecha | Sin fecha, el archivo no dice cuándo dejó de ser verdad |
| Se documenta el motivo | Sin motivo, nadie puede decidir si reutilizar la idea |
| Los enlaces entrantes se corrigen | Un enlace roto es peor que un documento archivado |
| Lo archivado no se actualiza | Un archivo es una foto del pasado, no un documento vivo |

---

## Documentos archivados

| Documento | Fecha de archivo | Reemplazado por | Motivo |
|-----------|------------------|-----------------|--------|
| — | — | — | — |

> Sin entradas. Cuando se archive el primer documento, esta tabla deja de estar vacía.

---

## Candidatos naturales

Documentos que, si alguna vez existieron o se crearan, serían candidatos a archivo. No se archiva
nada que no exista.

| Documento hypothetical | Carpeta | Motivo |
|------------------------|---------|--------|
| Propuesta de arquitectura hexagonal completa | `documentos-obsoletos/` | El código no la implementa; la versión vigente lo reconoce en [`05-arquitectura/`](../05-arquitectura/README.md) |
| Diseño de eventos de dominio | `documentos-obsoletos/` | El modelo de eventos no se implementó; la versión vigente lo dice en [`02-dominio/eventos-de-dominio.md`](../02-dominio/eventos-de-dominio.md) |
| Propuesta de Kafka o broker de mensajes | `decisiones-descartadas/` | Nunca se evaluó; el sistema es REST síncrono |

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`05-arquitectura/decisiones/`](../05-arquitectura/decisiones/README.md) | ADRs vigentes |
| [`15-control-proyecto/riesgos.md`](../15-control-proyecto/riesgos.md) | Riesgos conocidos, equivalente activo del archivo |
| [`00-gobernanza/reglas-de-documentacion.md`](../00-gobernanza/reglas-de-documentacion.md) | Reglas de escritura y ciclo de vida |
