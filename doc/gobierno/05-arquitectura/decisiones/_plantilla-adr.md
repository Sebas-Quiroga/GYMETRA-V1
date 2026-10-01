# Plantilla de ADR

> Copia este archivo a `registros/` como `ADR-NNN-titulo-corto.md`.

---

# ADR-NNN — Título de la decisión

| Campo | Valor |
|-------|-------|
| **ID** | ADR-NNN |
| **Título** | <!-- Una frase: qué se decidió --> |
| **Fecha** | YYYY-MM-DD |
| **Estado** | Proposed / Accepted / Deprecated / Superseded by ADR-XXX |
| **Decisor** | <!-- Quién tomó la decisión --> |
| **Revisado por** | <!-- Quiénes revisaron antes de aceptar --> |
| **Reemplaza** | <!-- ADR-NNN, si aplica --> |
| **Reemplazado por** | <!-- ADR-NNN, si aplica --> |
| **Impacto** | Bajo / Medio / Alto |

---

## 1. Contexto

<!-- ¿Cuál es el problema? ¿Qué restricciones existen? ¿Qué hay en juego?
     Escribe solo hechos. No justifiques todavía la solución. -->

**Restricciones:**

- <!-- Ejemplo: no hay presupuesto para un gestor de identidad de pago -->
- <!-- Ejemplo: el equipo tiene 3 personas -->

**Factores técnicos:**

- <!-- Ejemplo: las consultas de negocio necesitan transacciones -->

---

## 2. Decisión

<!-- ¿Qué decidimos hacer? En presente de indicativo.
     Si hay sub-decisiones, numéralas. -->

**Alternativas consideradas:**

| Alternativa | Ventajas | Desventajas | ¿Por qué se descartó? |
|-------------|----------|--------------|------------------------|
| <!-- Opción A --> | | | |
| <!-- Opción B --> | | | |
| <!-- Opción C (elegida) --> | | | |

**Fundamento:**

<!-- ¿Por qué esta opción y no las otras? Una o dos frases. -->

---

## 3. Consecuencias

### Positivas

- <!-- Qué ganamos -->
- <!-- Qué ganamos -->

### Negativas

- <!-- ⚠️ Sin esto el ADR está incompleto -->
- <!-- ⚠️ -->

### Neutras

- <!-- Efectos secundarios que no son ni buenos ni malos -->

---

## 4. Alternativas para el futuro

<!-- Si en algún momento conviene revisar esta decisión, ¿bajo qué condición?
     Ejemplo: "revisar si el volumen supera 10 GB de datos de Landlord". -->

---

## 5. Estado de implementación

| Aspecto | Estado |
|---------|--------|
| ¿Está implementado? | Sí / Parcial / No |
| ¿Desde cuándo? | YYYY-MM |
| ¿Dónde? | <!-- rutas de archivos o servicios --> |

---

## Documentos relacionados

- <!-- Otros ADRs relacionados -->
- <!-- Documentación afectada por esta decisión -->

---

## Registro de cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| YYYY-MM-DD | Creado | |
| YYYY-MM-DD | Cambiado de Proposed a Accepted | |
