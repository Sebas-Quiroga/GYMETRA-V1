# Definición de Listo (DoR — Definition of Ready)

> Criterios que una Historia de Usuario debe cumplir **antes** de entrar al sprint.
> Si una HU no está lista, no se desarrolla: se clarifies primero.

## Principio

> Una HU no Lista es una HU mal estimada. El costo de descubrir ambigüedad
> durante el desarrollo lo paga el equipo entero en la fecha de entrega.

---

## Criterios de Listo

Una HU puede pasar a un sprint cuando **todos** estos puntos se cumplen:

### Alcance y valor

- [ ] **Usuario y necesidad** identificados: quién la pide y qué problema resuelve.
- [ ] **Criterios de aceptación** escritos, verificables y sin ambigüedad.
- [ ] **Fuera de alcance** explícito: qué NO hace la HU.
- [ ] **Prioridad** asignada por el Product Owner.

### Dependencias

- [ ] **Servicios consumidores** identificados (ver [`mapa-de-dependencias.md`](../09-microservicios/catalogo-de-servicios.md)).
- [ ] **Contrato API** definido si expone o consume endpoints nuevos.
- [ ] **Dependencias externas** verificadas (Stripe, Cognito, Spoonacular, RapidAPI).
- [ ] **Dependencias de datos** resueltas: la tabla o entidad que necesita ya existe.

### Diseño

- [ ] **Modelo de datos** diseñado si la HU crea o modifica entidades.
- [ ] **Diagramas** actualizados si la HU cambia un flujo de negocio.
- [ ] **Migración de datos** identificada, si aplica.

### Operabilidad

- [ ] **Casos de error** identificados: qué pasa si falla una dependencia externa.
- [ ] **Métrica o señal** definida para saber si la HU funcionó.
- [ ] **Plan de pruebas** claro: al menos unitarias, y de integración si toca BD o red.

### Conocimiento

- [ ] **Criterios de aceptación entendidos** por quien va a implementar.
- [ ] **Dependencias técnicas** documentadas.

---

## Checklist rápido

```markdown
## Definición de Listo — HU-XXX

- [ ] Usuario y necesidad identificados
- [ ] Criterios de aceptación verificables
- [ ] Fuera de alcance definido
- [ ] Sin dependencias bloqueantes
- [ ] Contrato API definido (si aplica)
- [ ] Modelo de datos diseñado (si aplica)
- [ ] Casos de error identificados
- [ ] Estimado por el equipo
```

---

## Excepciones

Una HU **no lista** puede entrar al sprint únicamente si:

1. El PO lo justifica explícitamente por riesgo de entrega, y
2. Se registra el alcance de la deuda técnica que genera en
   [`15-control-proyecto/riesgos.md`](../15-control-proyecto/riesgos.md).

La excepción es la norma, no el atajo. Un sprint con más de dos HUs no listas arrastra
el compromiso de entrega del sprint completo.
