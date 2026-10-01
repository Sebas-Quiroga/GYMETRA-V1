# 08 — Diagramas UML

> **¿Qué es esto?** La vista del sistema de un vistazo. Un diagrama vale más que un párrafo de
> descripción, pero solo si está al día. Un diagrama desactualizado es peor que no tener ninguno.

---

## La regla del diagrama

**Un diagrama se dibuja cuando el texto se vuelve insuficiente, y se actualiza el mismo día que
cambia el código.** En GYMETRA los diagramas son el mapa de referencia del equipo: cuando alguien
pregunta "cómo entra un socio al gimnasio", la respuesta es un enlace a un diagrama, no una
explicación de cinco minutos.

Tres reglas que este proyecto respeta:

1. **Todo diagrama tiene fuente.** Nada de imágenes pegadas sin el archivo que las genera.
2. **Todo diagrama dice de dónde sale la información.** Cada diagrama de este repositorio es una
   representación del código real, verificado contra él.
3. **Un diagrama por propósito.** Un diagrama que intenta mostrar todo no muestra nada.

---

## Tipos de diagrama por propósito

### Para arquitectura (recomendado)

| Nivel | Diagrama | Pregunta que responde |
|-------|----------|-----------------------|
| C4-Nivel 1 | Contexto | ¿Qué sistemas externos interactúan con GYMETRA y quién es el usuario? |
| C4-Nivel 2 | Contenedor | ¿Qué aplicaciones y qué dependencias externas hay dentro? |
| C4-Nivel 3 | Componente | ¿Qué hay dentro de un contenedor? |
| C4-Nivel 4 | Código | ¿Qué clases hay dentro de un componente? |

### Para datos

| Diagrama | Pregunta que responde |
|----------|-----------------------|
| Entidad-relación (DER) | ¿Qué tablas hay y cómo se relacionan? |
| Modelo de dominio | ¿Qué conceptos existen y qué reglas los gobiernan? |

### Para comportamiento

| Diagrama | Pregunta que responde |
|----------|-----------------------|
| Casos de uso | ¿Qué puede hacer cada actor? |
| Secuencia | ¿En qué orden viajan los mensajes en una operación? |
| Estados | ¿En qué estados puede estar una entidad y cómo transiciona? |

---

## Herramientas recomendadas

| Herramienta | Cuándo usarla | Estado en este repositorio |
|-------------|---------------|----------------------------|
| **PlantUML** | Diagramas que viven junto al código (`.puml`) | Fuentes en [`diagramas/fuente/`](diagramas/fuente/) |
| **Mermaid** | Diagramas que GitHub renderiza nativamente, en Markdown | Documentación de contratos en `07-api/` |
| **Draw.io / Lucidchart** | Bocetos rápidos de UX | No se usa; ver [`12-ux-ui/`](../12-ux-ui/README.md) |
| **Exportado a PNG** | Diagramas para presentaciones y PDFs | [`diagramas/exportados/`](diagramas/exportados/) |

> **Nota sobre los exportados:** los once PNG de `diagramas/exportados/` se han generado desde las
> nueve fuentes de [`diagramas/fuente/`](diagramas/fuente/) con PlantUML 1.2026.8 sobre JDK 17, sin
> errores de sintaxis. `03-diagrama-secuencia.puml` contiene tres diagramas, por eso produce tres
> PNG. Cuando cambie el código, se regenera el PNG y se sube también la fuente: un PNG sin fuente
> actualizada se considera un documento obsoleto.

---

## Estructura de carpetas

```
08-uml/
├── README.md                  ← este archivo
├── indice-de-diagramas.md     ← registro de todos los diagramas y su propósito
└── diagramas/
    ├── fuente/                ← archivos .puml y .mmd (editables, versionados)
    └── exportados/            ← PNG generados, para documentación y presentaciones
```

### `indice-de-diagramas.md`
Registro de todos los diagramas del proyecto: qué es, quién lo consume y cuándo se actualizó.
Empieza por ahí para saber qué existe antes de crear uno nuevo.

---

## Diagramas disponibles

| # | Diagrama | Tipo | Archivo |
|---|----------|------|---------|
| 01 | Diagrama de clases | Comportamiento / modelo | [`01-diagrama-clases.png`](diagramas/exportados/01-diagrama-clases.png) |
| 02 | Diagrama entidad-relación | Datos | [`02-diagrama-entidad-relacion.png`](diagramas/exportados/02-diagrama-entidad-relacion.png) |
| 03 | Diagrama de secuencia | Comportamiento | [`03-diagrama-secuencia.png`](diagramas/exportados/03-diagrama-secuencia.png) |
| 04 | Diagrama de casos de uso | Comportamiento | [`04-diagrama-casos-de-uso.png`](diagramas/exportados/04-diagrama-casos-de-uso.png) |
| 05 | Diagrama de despliegue | Infraestructura | [`05-diagrama-despliegue.png`](diagramas/exportados/05-diagrama-despliegue.png) |
| 06 | Diagrama de paquetes | Arquitectura | [`06-diagrama-paquetes.png`](diagramas/exportados/06-diagrama-paquetes.png) |
| — | C4 Nivel 1 — Contexto | Arquitectura | [`c4-contexto.png`](diagramas/exportados/c4-contexto.png) |
| — | C4 Nivel 2 — Contenedor | Arquitectura | [`c4-contenedor.png`](diagramas/exportados/c4-contenedor.png) |
| — | Estados de la membresía | Comportamiento | [`estados-membresia.png`](diagramas/exportados/estados-membresia.png) |
| 03b | Secuencia B — Registro y primer inicio de sesión | Comportamiento | [`03-diagrama-secuencia_001.png`](diagramas/exportados/03-diagrama-secuencia_001.png) |
| 03c | Secuencia C — Sincronización del catálogo | Comportamiento | [`03-diagrama-secuencia_002.png`](diagramas/exportados/03-diagrama-secuencia_002.png) |

---

## Correlaciones con otras secciones

| Sección | Relación |
|---------|----------|
| [`05-arquitectura/`](../05-arquitectura/README.md) | Decisiones estructurales y diagramas C4 |
| [`06-datos/`](../06-datos/README.md) | El DER se contrasta con el modelo de datos real |
| [`02-dominio/`](../02-dominio/README.md) | Reglas de negocio que los diagramas de comportamiento ilustran |
| [`07-api/`](../07-api/README.md) | Los diagramas de secuencia muestran el orden de las llamadas |
| [`12-ux-ui/`](../12-ux-ui/README.md) | Los casos de uso tienen un correlativo en pantallas |
| [`13-operaciones/`](../13-operaciones/README.md) | El diagrama de despliegue muestra qué se monitorea |
