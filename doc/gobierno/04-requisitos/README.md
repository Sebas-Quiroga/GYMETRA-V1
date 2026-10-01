# 04 — Requisitos

> **¿Qué debe hacer el sistema?** Los requisitos funcionales y no funcionales de
> GYMETRA, su trazabilidad y la plantilla para escribir nuevas historias.

## Requisitos vs. implementación

> Un requisito describe **lo que el sistema debe hacer**, no **cómo lo hace**. Si el
> requisito dice "Spring Boot", ya no es un requisito: es una decisión de arquitectura, y
> esa decisión vive en un ADR.
>
> La prueba: si puedes cambiar la tecnología y el requisito sigue siendo verdad, es un
> buen requisito.

---

## Documentos de esta sección

| Documento | Contenido |
|-----------|-----------|
| [`historias-de-usuario.md`](./historias-de-usuario.md) | Historias de usuario con criterios de aceptación |
| [`no-funcionales.md`](./no-funcionales.md) | Requisitos no funcionales con métricas medibles |
| [`matriz-de-trazabilidad.md`](./matriz-de-trazabilidad.md) | Qué requisito cubre cada endpoint |
| [`_plantilla-hu.md`](./_plantilla-hu.md) | Plantilla para escribir una HU nueva |

---

## Resumen de los requisitos

| Tipo | Cantidad | IDs |
|------|----------|-----|
| **Funcionales (RF)** | 10 | RF-01 … RF-10 |
| **No funcionales (RNF)** | 8 | RNF-01 … RNF-08 |
| **Historias de usuario** | 24 | HU-001 … HU-024 |

---

## Cobertura de la implementación

| Requisito | Estado | Nota |
|-----------|--------|------|
| RF-01 Gestión de usuarios | ✅ Implementado | `GYMETR-login` — CRUD completo |
| RF-02 Autenticación y autorización | ✅ Implementado | Cognito + JWT + roles |
| RF-03 Planes de membresía | ✅ Implementado | `MembershipController` — CRUD completo |
| RF-04 Adquisición y pago | ✅ Implementado | Stripe + `PaymentController` |
| RF-05 Generación de QR | ✅ Implementado | `QrAccessController` |
| RF-06 Validación de QR | ⚠️ Parcial | Valida, pero un fallo de red deniega en silencio |
| RF-07 Historial de accesos | ⚠️ Parcial | Registra, pero **no registra los denegados** (R-14) |
| RF-08 Rutinas de ejercicio | 🔴 Bloqueado | **Los planes no conceden beneficios** (R-01) |
| RF-09 Planes de nutrición | 🔴 Bloqueado | **Los planes no conceden beneficios** (R-01) |
| RF-10 Dashboard de métricas | ⚠️ Parcial | Hay vista de métricas; no hay cálculo de retención ni ocupación |

> **Dos requisitos de nueve están bloqueados por una única causa.** R-01 es la deuda
> técnica más costosa del proyecto en términos de valor: un plan premium que no entrega
> beneficios es un descuento, no un producto.

---

## Preguntas que esta sección debe responder

- ¿Qué debe hacer el sistema, punto por punto?
- ¿Cómo verificamos que lo hace?
- ¿Qué atributos de calidad debe cumplir?
- ¿Qué requisito cubre cada endpoint?
- ¿Qué requisito **no** está cubierto todavía?
