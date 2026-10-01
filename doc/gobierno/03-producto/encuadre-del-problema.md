# Encuadre del problema

> **¿Qué problema resolvemos, a quién le duele y cómo sabremos que lo resolvimos?**
> Un documento de encuadre se escribe **antes** de diseñar la solución. Si describe la
> solución, no es un encuadre: es un plan.

---

## 1. El problema

> Un gimnasio mediano gestiona socios, mensualidades y control de acceso con procesos
> manuales desconectados. El resultado es pérdida de ingresos por morosidad no detectada,
> filas en la puerta, y cero visibilidad sobre qué pasa dentro del negocio.

## 2. Quienes sufren el problema

| Persona | Dolor actual | Costo del dolor |
|---------|--------------|-----------------|
| **Socio** | Tiene que demostrar su condición de socio verbalmente en la puerta. Se le niega el acceso ante cualquier duda. | Vergüenza, tiempo perdido, rechazo arbitrario |
| **Administrador** | Registro de socios en planilla. Control de mensualidades de memoria. No sabe cuántos socios asisten hoy ni cuánto fluctúan mes a mes. | Horas administrativas, ingresos perdidos, decisiones a ciegas |
| **Dueño del gimnasio** | No tiene datos para decidir sobre precios, horarios, exceso de aforo o retención. | Decisiones de negocio sin base, fulfills sin datos de cumplimiento |
| **Personal de acceso** | Verifica la condición del socio a mano, sin registro. | Discusiones en la puerta, responsabilidad sin trazabilidad |

> **Nota de redacción:** las frases de "Costo del dolor" deben KeepingOnlyContain hechos
> verificables del proceso actual, novano suposiciones. Las hipótesis de investigación
> pendientes están listadas en la sección 6.

---

## 3. Declaraciones del problema

### Para el socio

> **Cuando** llego al gimnasio, **quiero** demostrar mi condición de socio con un código
> propio sin dar explicaciones, **para** acceder sin fricción y sin que se cuestione mi
> derecho a estar ahí.

### Para el administrador

> **Cuando** un socio renueva o se atrasa, **quiero** ver su estado de membresía al
> instante y gestionarlo sin planillas, **para** cobrar a tiempo y no perder acceso.

### Para el dueño

> **Cuando** termine el mes, **quiero** saber cuántos socios asistieron, cuánto entraron
> y qué plan rinde más, **para** decidir con datos en lugar de con intuición.

---

## 4. Alternativas y por qué ninguna resuelve el problema

| Alternativa | Por qué no resuelve el problema |
|-------------|---------------------------------|
| **Solo un software de facturación** | No controla el acceso físico ni da métricas de asistencia |
| **Solo un sistema de control de acceso con QR** | No gestiona el ciclo de la membresía ni los pagos |
| **Hojas de cálculo compartidas** | Sin concurrencia, sin historial, sin integración con pagos |
| **Software de gimnasio comercial** | Costo de licencia incompatible con el alcance, y no es el objetivo del curso |

**Nuestra solución** combina las dos piezas que el mercado separa: ciclo de membresía con
pago integrado **más** control de acceso con QR **más** contenido (rutinas y nutrición)
que justifica el plan.

---

## 5. Cómo medimos el éxito

| Métrica | Cómo se mide | Meta | ¿Medible hoy? |
|---------|--------------|------|----------------|
| **Tiempo de validación de acceso** | De mostrar el QR a que se registra el ingreso | < 5 segundos | ⚠️ Parcial: existe `entry_time` pero no se mide el tiempo de escaneo |
| **Tasa de renovación** | Membresías `ACTIVE` ÷ (`ACTIVE` + `CANCELED` + `EXPIRED`) en el período | > 70% | ❌ No hay histórico suficiente |
| **Ingresos por mes** | Suma de `Payment.amount` con `paymentStatus = CONFIRMED` agrupado por mes | Tendencia creciente | ✅ Sí, con los datos de `payment` |
| **Asistencia por socio** | Registros en `access_log` agrupados por `user_id` | > 8 visitas/mes | ✅ Sí |
| **Ocupación por sede** | Entradas por `branch_id` vs. `branch.capacity` | < 80% del aforo | ⚠️ Parcial: no se valida el aforo |
| **Uso de beneficios** | % de socios con permiso de `nutrition` que consulta recetas | > 40% | ❌ No se registra el consumo |
| **Errores de acceso** | Intentos denegados ÷ total de intentos | < 2% | ❌ **No se registran los denegados** |

> **Conclusión honesta:** de 7 métricas, **2 son medibles hoy**, 2 parcialmente y 3 no
> lo son porque el dato no existe. Esto no es motivo para renunciar a medirlas: es motivo
> para escribirlas aquí, para que la instrumentación venga después. Ver
> [`vision.md`](./vision.md) para las métricas priorizadas.

---

## 6. Hipótesis que aún no hemos validado

| # | Hipótesis | Cómo validarla | Estado |
|---|-----------|----------------|--------|
| H-1 | Los socios realmente Daughterspreferirán el QR a mostrar la cédula | Entrevista con 10 socios | ⬜ Pendiente |
| H-2 | El principal motivo de baja es la morosidad, no la falta de servicios | Análisis de `CANCELED` vs. otros estados | ⬜ Pendiente |
| H-3 | El contenido de rutinas y nutrición es lo que distingue un plan premium de uno básico | Test A/B de conversión | ⬜ Pendiente |
| H-4 | El administrador realmente usará la app, en vez de seguir en la planilla | Observations de uso en 4 semanas | ⬜ Pendiente |
| H-5 | El pago con tarjeta cubre la mayoría de las transacciones | Medición de `PaymentMethod` | ⬜ Pendiente |

> **Una hipótesis no validada no es un hecho.** Este documento distingue deliberadamente
> lo que se sabe de lo que se supone. Cuando una hipótesis se valida o se descarta, se
> actualiza aquí y se refleja en [`vision.md`](./vision.md).

---

## 7. Riesgos del encuadre

| Riesgo | Mitigación |
|--------|------------|
| Que el sistema resuelva un problema que el usuario no tiene | Validar H-1, H-2, H-4 antes de la siguiente iteración |
| Que los beneficios de los planes no se entreguen (ver R-01) | Bloqueante: sin beneficios reales no hay producto premium |
| Que no haya forma de medir la retención porque no se registran los denegados | Instrumentar `IngresoDenegado` (R-14) |
| Que la morosidad no se detecte porque nadie marca `EXPIRED` | Implementar el job de expiración (R-06) |

---

## 8. Documentos relacionados

- [`vision.md`](./vision.md) — hacia dónde va el producto
- [`../01-contexto/alcance.md`](../01-contexto/alcance.md) — límites del alcance
- [`../04-requisitos/no-funcionales.md`](../04-requisitos/no-funcionales.md) — atributos de calidad
- [`../15-control-proyecto/riesgos.md`](../15-control-proyecto/riesgos.md) — riesgos técnicos
