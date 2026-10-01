# Registro de riesgos

> Los riesgos no mitigados se convierten en problemas. Este registro permite anticiparlos en
> lugar de reaccionar a ellos.
>
> **Todos los riesgos de esta tabla están verificados contra el código fuente.** Cada entrada
> cita el archivo donde el problema es observable. No hay riesgos hipotéticos: si está aquí, se
> comprobó que el defecto existe.
>
> Revisar y actualizar en cada retrospectiva o ante un cambio significativo del proyecto.

---

## 1. Cómo leer este registro

| Campo | Significado |
|-------|-------------|
| **Probabilidad** | Alta / Media / Baja — qué tan fácil es que ocurra |
| **Impacto** | Alto / Medio / Bajo — cuánto daña si ocurre |
| **Nivel** | Crítico / Alto / Medio / Bajo — juicio del registro sobre probabilidad e impacto |
| **Estrategia** | Evitar / Mitigar / Transferir / Aceptar |
| **Disparador** | Señal de alarma que avisa de que el riesgo se está materializando |

**Estrategias de respuesta:**

- **Evitar:** cambiar el plan para que el riesgo no pueda ocurrir.
- **Mitigar:** reducir la probabilidad o el impacto.
- **Transferir:** pasar el riesgo a otro (proveedor, contrato, seguro).
- **Aceptar:** reconocer el riesgo y tener un plan de contingencia.

> **Sobre los responsables:** la columna *Responsable* designa un **rol**, no una persona,
> porque el equipo no tiene asignados responsables nominales. Conviene asignar nombres propios:
> un riesgo sin nadie a quién encargar se queda sin vigilar.

---

## 2. Matriz de probabilidad × impacto

```
IMPACTO
  │
  │ ALTO  │ —          │ R-16, R-23     │ R-01, R-05, R-06,  │
  │       │            │                │ R-11, R-12, R-13,  │
  │       │            │                │ R-19, R-22, R-24,  │
  │       │            │                │ R-28               │
  │───────│────────────│────────────────│────────────────────│
  │ MEDIO │ R-26       │ R-02, R-03,    │ R-04, R-14, R-15,  │
  │       │            │ R-07, R-08,    │ R-17               │
  │       │            │ R-18, R-21,    │                    │
  │       │            │ R-27           │                    │
  │───────│────────────│────────────────│────────────────────│
  │ BAJO  │ R-10, R-25 │ —              │ R-09, R-20         │
  └───────┴────────────┴────────────────┴────────────────────┘
               BAJA          MEDIA               ALTA
                          PROBABILIDAD
```

**Lectura de la matriz:** la casilla de impacto alto y probabilidad baja está vacía: ningún riesgo
del registro cae en esa combinación. La esquina superior derecha —impacto alto y probabilidad
alta— concentra 10 de los 28 riesgos y es la que exige acción inmediata. **La casilla no fija el
nivel ni la estrategia**: ambos se leen en la ficha de cada riesgo (§4). Por ejemplo, esa misma
casilla reúne seis 🔴 Crítico con estrategia *Evitar* (R-01, R-06, R-12, R-19, R-22, R-28) y
cuatro 🔴 Alto con estrategia *Mitigar* (R-05, R-11, R-13, R-24).

---

## 3. Resumen de riesgos

| ID | Riesgo | Nivel | Estrategia | Responsable |
|----|--------|-------|------------|-------------|
| **R-01** | Los planes no conceden beneficios | 🔴 Crítico | Evitar | Producto |
| **R-06** | Las membresías vencidas nunca se marcan `EXPIRED` | 🔴 Crítico | Evitar | Backend |
| **R-12** | Los tres servicios comparten la base de datos | 🔴 Crítico | Evitar | Arquitectura |
| **R-19** | Endpoint público que borra el catálogo de ejercicios | 🔴 Crítico | Evitar | Backend / QR |
| **R-22** | El borrado de usuario destruye el historial financiero y de accesos | 🔴 Crítico | Evitar | Backend / Login |
| **R-28** | QR llama a Membership sin token y esa ruta exige JWT (401) | 🔴 Crítico | Evitar | Backend / QR |
| **R-05** | Los accesos se calculan cargando toda la tabla en memoria | 🔴 Alto | Mitigar | Backend / QR |
| **R-11** | El aforo máximo no se valida | 🔴 Alto | Mitigar | Backend / QR |
| **R-13** | El plan semanal ignora el cálculo de calorías por día | 🔴 Alto | Mitigar | Backend / QR |
| **R-16** | Autorización solo por "autenticado", sin exigir rol `Admin` | 🔴 Alto | Mitigar | Seguridad |
| **R-23** | La suspensión de socios no suspende nada | 🔴 Alto | Mitigar | Backend / Login |
| **R-24** | No hay pruebas unitarias del núcleo de negocio | 🔴 Alto | Mitigar | Calidad |
| **R-03** | La validación de turno es asimétrica | 🟠 Medio | Mitigar | Backend / QR |
| **R-04** | Cobertura de pruebas prácticamente nula | 🟠 Medio | Mitigar | Calidad |
| **R-07** | `qr_code` guarda texto Base64, no una imagen QR | 🟠 Medio | Mitigar | Backend / QR |
| **R-14** | Los accesos denegados no se registran | 🟠 Medio | Mitigar | Producto |
| **R-15** | Hay secretos en archivos versionados | 🟠 Medio | Mitigar | Seguridad / DevOps |
| **R-17** | El pipeline solo construye 2 de 5 proyectos | 🟠 Medio | Mitigar | DevOps |
| **R-18** | Endpoints de diagnóstico sin restricción de rol | 🟠 Medio | Mitigar | Seguridad |
| **R-26** | El reseteo de contraseña apunta a la fuente equivocada | 🟠 Medio | Mitigar | Backend / Login |
| **R-27** | La sincronización depende de APIs externas con cuota | 🟠 Medio | Mitigar | Backend / QR |
| **R-02** | `Payment` tiene columnas duplicadas en dos idiomas | 🟡 Bajo | Mitigar | Datos |
| **R-08** | Endpoints públicos que permiten enumerar membresías | 🟡 Bajo | Mitigar | Seguridad |
| **R-10** | `password_reset_token` sin unicidad ni índice | 🟡 Bajo | Aceptar | Datos |
| **R-21** | El registro no crea la fila local y los roles divergen | 🟡 Bajo | Mitigar | Backend / Login |
| **R-25** | La columna `password_hash` está muerta | 🟡 Bajo | Evitar | Datos |
| **R-09** | `VITE_SPOONACULAR_API_KEY` ni está definida ni debe ir en el frontend | 🟡 Bajo | Transferir | Seguridad / Frontend |
| **R-20** | No hay recuperación de contraseña | 🟡 Bajo | Mitigar | Producto |

**Totales:** 28 riesgos · 6 críticos · 6 altos · 9 medios · 7 bajos.

---

## 4. Registro detallado

### R-01 — Los planes no conceden beneficios

| Campo | Valor |
|-------|-------|
| **Categoría** | Negocio / Producto |
| **Descripción** | Los tres planes se diferencian solo en nombre, precio y duración. Los únicos campos que podrían conceder beneficios distintos, `Membership.training` y `Membership.nutrition`, se declaran con `@Builder.Default = false` y el seeder nunca los asigna, así que los tres planes quedan en `false`. La verificación de acceso solo comprueba que el estado sea `ACTIVE`, sin mirar esos flags: **un socio del plan básico obtiene exactamente los mismos beneficios que uno premium**. |
| **Evidencia** | `Membership.java:45-51` (`@Builder.Default = false`); `DataInitializer.java:24-47` no asigna los flags; ningún servicio los consulta |
| **Bloquea** | RF-08 (rutinas) y RF-09 (nutrición) |
| **Probabilidad** | Alta — ya está ocurriendo |
| **Impacto** | Alto — el producto premium no existe |
| **Nivel** | 🔴 Crítico |
| **Estrategia** | Evitar |
| **Plan de mitigación** | Decidir el modelo de diferenciación antes de nada. Si el premium se define por nivel, activar los flags y hacer que `QrBusinessService` los lea. Si no hay diferencia real, quitar los campos y vender por precio/duración. |
| **Plan de contingencia** | Pausar la venta del plan premium y comunicar que todos los planes son equivalentes hasta que se resuelva. |
| **Disparador** | Un socio se queja de que paga más y recibe lo mismo |
| **Responsable** | Producto |
| **Estado** | Activo |

---

### R-02 — `Payment` tiene columnas duplicadas en dos idiomas

| Campo | Valor |
|-------|-------|
| **Categoría** | Datos / Técnico |
| **Descripción** | La tabla `payment` guarda cada dato dos veces: `amount`/`monto`, `payment_method`/`metodo_pago`, `payment_date`/`fecha_pago`. Las seis columnas son `NOT NULL`, así que cada camino de escritura debe rellenar los dos pares a mano. `savePaymentSimplified()` solo rellena el par en inglés, de modo que el `INSERT` viola la restricción de nulidad. |
| **Evidencia** | `Payment.java:51-79` (las seis columnas `nullable = false`); `PaymentService.java:74-83` (el builder solo asigna el par en inglés) |
| **Probabilidad** | Media |
| **Impacto** | Medio |
| **Nivel** | 🟡 Bajo |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Decidir un idioma (preferiblemente inglés, ver [ADR-001](../05-arquitectura/decisiones/registros/ADR-001-idioma-documentacion.md)), migrar los datos y eliminar las columnas redundantes. |
| **Plan de contingencia** | Un trigger de base de datos que iguale ambos pares, o una vista que unifique la lectura. |
| **Disparador** | Un pago aparece con `monto` nulo o distinto de `amount` |
| **Responsable** | Datos |
| **Estado** | Activo |

---

### R-03 — La validación de turno es asimétrica

| Campo | Valor |
|-------|-------|
| **Categoría** | Técnico / Regla de negocio |
| **Descripción** | `isSameShift()` valida el turno comprobando solo `h1 >= 12` y `h2 <= 22`. Una entrada a las 13:00 contra un evento de las 07:00 **sí pasa la validación**, porque la condición no es simétrica. La regla R-AC-3 ("06:00–12:00 o 12:01–22:00") no se aplica como está escrita. |
| **Evidencia** | `AccessLogBusinessService.isSameShift()` |
| **Probabilidad** | Media |
| **Impacto** | Medio |
| **Nivel** | 🟠 Medio |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Reescribir la condición como pertenencia a un conjunto de turnos explícitos, en lugar de dos comparaciones sueltas. Cubrirla con pruebas para las 24 horas del día. |
| **Plan de contingencia** | Revisar a mano los `access_log` con doble ingreso en turno de mañana. |
| **Disparador** | Un socio aparece con dos ingresos registrados antes de las 12:00 |
| **Responsable** | Backend / QR |
| **Estado** | Activo |

---

### R-04 — Cobertura de pruebas prácticamente nula

| Campo | Valor |
|-------|-------|
| **Categoría** | Calidad / Técnico |
| **Descripción** | El RNF-21 fija un 80 % de cobertura sobre código de negocio y la cobertura real es casi cero. No hay pruebas que protejan las reglas de negocio, y sin ellas ninguna corrección de las 28 entradas de este registro puede verificarse como correcta. |
| **Evidencia** | Ausencia de `src/test` con casos de negocio; RNF-21 |
| **Probabilidad** | Alta |
| **Impacto** | Medio |
| **Nivel** | 🟠 Medio |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Empezar por las 13 reglas de negocio de [`02-dominio/entidades-y-reglas.md`](../02-dominio/entidades-y-reglas.md): son las más baratas de probar y las que más daño causa tener rotas. Ver la hoja de ruta de [R-24](#r-24--no-hay-pruebas-unitarias-del-nucleo-de-negocio). |
| **Plan de contingencia** | Ninguno razonable: sin pruebas, todo refactor es una apuesta. |
| **Disparador** | El primer incidente en producción causado por una regla de negocio |
| **Responsable** | Calidad |
| **Estado** | Activo |

---

### R-05 — Los accesos se calculan cargando toda la tabla en memoria

| Campo | Valor |
|-------|-------|
| **Categoría** | Técnico / Rendimiento |
| **Descripción** | `marcarIngreso` y `marcarSalida` llaman a `accessLogRepository.findAll()` y filtran en memoria para buscar un ingreso abierto. `access_log` es la tabla que más crece del sistema. Con cientos de miles de registros, cada validación de acceso arrastra la tabla completa a memoria. |
| **Evidencia** | `AccessLogBusinessService.marcarIngreso()` / `marcarSalida()` |
| **Probabilidad** | Alta |
| **Impacto** | Alto |
| **Nivel** | 🔴 Alto |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Sustituir por una consulta con índice: `findFirstByUserIdAndExitTimeIsNull(userId)`. Añadir índice compuesto `(user_id, exit_time)`. |
| **Plan de contingencia** | Purgar `access_log` con más de 90 días y archivar. |
| **Disparador** | El tiempo de respuesta de `/api/access-log/entrada` sube por encima de 1 s |
| **Responsable** | Backend / QR |
| **Estado** | Activo |

---

### R-06 — Las membresías vencidas nunca se marcan `EXPIRED`

| Campo | Valor |
|-------|-------|
| **Categoría** | Negocio / Producto |
| **Descripción** | `UserMembershipStatus` incluye `EXPIRED` y las reglas R-MB-4 / R-AC-1 asumen que solo `ACTIVE` concede acceso, pero **ningún código transiciona a `EXPIRED`**. Una membresía con `end_date` en el pasado sigue en `ACTIVE` y el socio conserva el acceso indefinidamente. Sin expiración tampoco se puede calcular retención. |
| **Evidencia** | No existe job programado que marque `EXPIRED`; los campos `end_date` y `ready_in_minutes` no se leen para decidir |
| **Impacto sobre el negocio** | Ingreso pasivo: el socio deja de pagar y sigue entrando |
| **Probabilidad** | Alta |
| **Impacto** | Alto |
| **Nivel** | 🔴 Crítico |
| **Estrategia** | Evitar |
| **Plan de mitigación** | Job programado diario que marque `EXPIRED` todo lo que tenga `end_date` anterior a hoy. Alternativa más robusta: no confiar en el estado y validar `end_date` directamente en `QrBusinessService`. |
| **Plan de contingencia** | Revisar manualmente las suscripciones vencidas y corregirlas por SQL. |
| **Disparador** | Un socio con `end_date` vencida hace más de 30 días que accede |
| **Responsable** | Backend |
| **Estado** | Activo |

---

### R-07 — `qr_code` guarda texto Base64, no una imagen QR

| Campo | Valor |
|-------|-------|
| **Categoría** | Técnico / Dominio |
| **Descripción** | El campo `qr_code` almacena una cadena Base64 del token `userId:UUID`, no una imagen QR. El renderizado ocurre en el frontend con `qrcode.vue`. Quien asuma que la columna contiene una imagen construye un flujo de emisión de credenciales incompatible con el modelo real. |
| **Evidencia** | `QrAccess.qrCode`; renderizado en `qrcode.vue` del frontend |
| **Probabilidad** | Media |
| **Impacto** | Medio |
| **Nivel** | 🟠 Medio |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Renombrar la columna a `qr_token` para que el nombre describa lo que contiene, o documentar el formato en el diccionario de datos. |
| **Plan de contingencia** | Ninguno; es una deuda de nomenclatura, no un fallo funcional. |
| **Disparador** | Alguien integra un lector de QR esperando una imagen |
| **Responsable** | Backend / QR |
| **Estado** | Activo |

---

### R-08 — Endpoints públicos que permiten enumerar membresías

| Campo | Valor |
|-------|-------|
| **Categoría** | Seguridad |
| **Descripción** | `GET /api/user-memberships/user/*/permission/*` está en `permitAll()`. Devuelve un booleano, lo que permite a un atacante recorrer `userId` y deducir qué socios tienen membresía activa, sin autenticarse. El proxy equivalente en QR **no** tiene ese problema: `/api/memberships-proxy/**` cae en `anyRequest().authenticated()` y exige JWT. |
| **Evidencia** | `GYMETR-Membership/.../config/SecurityConfig.java` — `.requestMatchers("/api/user-memberships/user/*/permission/*")` dentro de `permitAll()`; en el `SecurityConfig` de QR ese patrón no aparece |
| **Probabilidad** | Media |
| **Impacto** | Medio — fuga de información de socios |
| **Nivel** | 🟡 Bajo |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Exigir JWT en el endpoint de permisos de Membership. El frontend ya tiene token: no hay razón de negocio para que sea público. |
| **Plan de contingencia** | Rate limiting por IP si deben seguir abiertos. |
| **Disparador** | Peticiones anómalas a esos patrones desde una misma IP |
| **Responsable** | Seguridad |
| **Estado** | Activo |

---

### R-09 — `VITE_SPOONACULAR_API_KEY` ni está definida ni debe ir en el frontend

| Campo | Valor |
|-------|-------|
| **Categoría** | Seguridad / Externo |
| **Descripción** | `nutritionService.ts` lee `import.meta.env.VITE_SPOONACULAR_API_KEY`, pero **ningún archivo `.env` del repositorio la define**: solo aparecen `VITE_API_URL_*`, `VITE_COGNITO_*` y `VITE_STRIPE_PUBLIC_KEY`. En el estado actual la variable es `undefined` y el servicio de nutrición lanza siempre el error "La API Key de Spoonacular no se encuentra". El riesgo es doble: hoy la funcionalidad está rota, y `ENVIRONMENT_SETUP.md` instruye a añadirla, lo que introduciría una clave de terceros dentro del bundle, donde cualquier `VITE_*` es pública por definición. |
| **Evidencia** | `nutritionService.ts:5` y `:21`; `.env.development` y `.env.example` del frontend sin la variable; `ENVIRONMENT_SETUP.md:71` y `:84` |
| **Probabilidad** | Alta — la funcionalidad de nutrición del frontend falla en el estado actual |
| **Impacto** | Bajo — la clave es de un servicio público de recetas, no de un sistema crítico |
| **Nivel** | 🟡 Bajo |
| **Estrategia** | Transferir |
| **Plan de mitigación** | Quitar la llamada a Spoonacular del frontend y consumir la nutrición solo a través del servicio QR, que ya lo hace con su clave. Corregir `ENVIRONMENT_SETUP.md` para que no instruya añadir la clave al navegador. |
| **Plan de contingencia** | Si se mantiene la llamada, rotar la clave en Spoonacular y restringir la cuota a la IP del servicio. |
| **Disparador** | Un socio abre el plan nutricional y ve el error de API key |
| **Responsable** | Seguridad / Frontend |
| **Estado** | Activo |

---

### R-10 — `password_reset_token` sin unicidad ni índice

| Campo | Valor |
|-------|-------|
| **Categoría** | Datos / Técnico |
| **Descripción** | La entidad no declara unicidad sobre `token` ni índice sobre `expiry_date`. La consulta de limpieza `delete from PasswordResetToken t where t.expiryDate <= :now` recorre la tabla entera, y dos tokens iguales serían ambiguos al canjear. |
| **Evidencia** | `PasswordResetToken` sin `@Column(unique = true)` ni `@Index`; `expiry_date` nullable |
| **Probabilidad** | Baja — hoy la tabla está siempre vacía |
| **Impacto** | Bajo mientras no exista el flujo (ver R-26) |
| **Nivel** | 🟡 Bajo |
| **Estrategia** | Aceptar |
| **Plan de mitigación** | Resolver primero R-26. Si el reseteo se implementa contra Cognito, esta tabla sobra entera y el riesgo desaparece. Si se mantiene, añadir unicidad e índice. |
| **Plan de contingencia** | No aplica: sin flujo de reseteo no hay consulta que lo revierta. |
| **Disparador** | Se implementa el reseteo sin añadir las restricciones |
| **Responsable** | Datos |
| **Estado** | Activo |

---

### R-11 — El aforo máximo no se valida

| Campo | Valor |
|-------|-------|
| **Categoría** | Negocio / Técnico |
| **Descripción** | `Branch.capacity` se declara y se siembra (100, 150 y 120), pero **ningún código lo lee**: `marcarIngreso` no lo consulta. El aforo es un dato decorativo y el gimnasio admite más socios de los que su capacidad permite. |
| **Evidencia** | `Branch.java:19-20` y `BranchDataInitializer.java:19-31`; `getCapacity()` no se invoca desde ningún servicio |
| **Probabilidad** | Alta |
| **Impacto** | Alto — riesgo físico y de seguridad en las sedes |
| **Nivel** | 🔴 Alto |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Contar los ingresos abiertos de la sede antes de conceder el acceso y rechazarlo con un mensaje claro si se supera `branch.capacity`. |
| **Plan de contingencia** | Control manual del aforo por parte del personal de la sede. |
| **Disparador** | La ocupación de una sede supera la capacidad teórica |
| **Responsable** | Backend / QR |
| **Estado** | Activo |

---

### R-12 — Los tres servicios comparten la base de datos

| Campo | Valor |
|-------|-------|
| **Categoría** | Arquitectura / Técnico |
| **Descripción** | `GYMETR-login`, `GYMETR-Membership` y `GYMETRA-Qr` apuntan a la misma base `gymdb`. Cualquier `DROP TABLE` o migración de un servicio rompe los otros dos. Un `ddl-auto: update` en desarrollo puede alterar tablas que pertenecen a otro servicio. |
| **Evidencia** | Las tres configuraciones apuntan a `gymdb`; ver [ADR-002](../05-arquitectura/decisiones/registros/ADR-002-base-datos-compartida.md) |
| **Requisito afectado** | RNF-07 (aislamiento de datos, incumplido) |
| **Probabilidad** | Alta |
| **Impacto** | Alto |
| **Nivel** | 🔴 Crítico |
| **Estrategia** | Evitar |
| **Plan de mitigación** | Separar en tres esquemas o tres bases, aunque compartan instancia. Es el cambio con más retorno del proyecto: elimina la mayoría de los riesgos de esta lista. |
| **Plan de contingencia** | Restricuir los permisos de cada usuario de base de datos a su propio esquema, de modo que un `DROP` accidental no alcance tablas ajenas. |
| **Disparador** | El primer `DROP TABLE` o cambio de esquema que rompa otro servicio |
| **Responsable** | Arquitectura |
| **Estado** | Activo |

---

### R-13 — El plan semanal ignora el cálculo de calorías por día

| Campo | Valor |
|-------|-------|
| **Categoría** | Técnico / Regla de negocio |
| **Descripción** | En `generateMealPlan()` con `timeFrame = "week"`, el código calcula `targetCalories / 7.0` y lo asigna al día, pero **la línea siguiente lo sobrescribe** con `targetCalories` sin dividir. El primer cálculo es código muerto y **el plan semanal entrega 7 veces las calorías objetivo**. |
| **Evidencia** | `LocalNutritionService.generateMealPlan()` |
| **Probabilidad** | Alta — ocurre en cada weekly plan generado |
| **Impacto** | Alto — un plan nutricional que se excede 7× es inservible y daña la confianza en el producto |
| **Nivel** | 🔴 Alto |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Corregir la asignación y añadir una prueba que verifique que la suma del plan semanal es igual al objetivo diario. |
| **Plan de contingencia** | Desactivar la generación semanal y entregar solo el plan diario, que sí es correcto. |
| **Disparador** | Un usuario reporta un plan semanal de ~14.000 kcal |
| **Responsable** | Backend / QR |
| **Estado** | Activo |

---

### R-14 — Los accesos denegados no se registran

| Campo | Valor |
|-------|-------|
| **Categoría** | Negocio / Datos |
| **Descripción** | `access_log.result` solo registra `granted`. Los intentos denegados (membresía vencida, doble ingreso, QR inválido) no dejan rastro. Se pierde el que probablemente es el dato más valioso del sistema para detectar uso fraudulento y medir retención. |
| **Evidencia** | `AccessLogBusinessService` solo escribe en la ruta de éxito; RNF-16 incumplido |
| **Probabilidad** | Alta |
| **Impacto** | Medio |
| **Nivel** | 🟠 Medio |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Registrar también los denegados con su motivo. Requiere el evento de dominio `IngresoDenegado` ya descrito en [`02-dominio/eventos-de-dominio.md`](../02-dominio/eventos-de-dominio.md). |
| **Plan de contingencia** | Ninguno: el dato que no se registra no se puede recuperar. |
| **Disparador** | Una auditoría pide el historial de intentos de acceso de un socio y no existe |
| **Responsable** | Producto |
| **Estado** | Activo |

---

### R-15 — Hay secretos en archivos versionados

| Campo | Valor |
|-------|-------|
| **Categoría** | Seguridad |
| **Descripción** | Hay 3 secretos en archivos versionados: credenciales de AWS (RapidAPI y Spoonacular) y `POSTGRES_PASSWORD` en `docker-compose.yml`. RNF-13 exige 0. |
| **Evidencia** | `docker-compose.yml` y archivos `.env` de los tres servicios |
| **Probabilidad** | Alta — ya está materializado en el repositorio |
| **Impacto** | Medio — las claves son de terceros con cuota limitada |
| **Nivel** | 🟠 Medio |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Mover a variables de entorno, rotar las claves expuestas y revisar el historial de Git, porque eliminar el archivo no borra el commit. |
| **Plan de contingencia** | Rotar las claves de inmediato y restringir por IP. |
| **Disparador** | El repositorio se hace público o se comparte fuera del equipo |
| **Responsable** | Seguridad / DevOps |
| **Estado** | Activo |

---

### R-16 — Autorización solo por "autenticado", sin exigir rol `Admin`

| Campo | Valor |
|-------|-------|
| **Categoría** | Seguridad |
| **Descripción** | Los tres `SecurityConfig` terminan en `anyRequest().authenticated()`. La mayoría de los endpoints de administración **no declaran `@PreAuthorize` con rol `Admin`**, así que cualquier socio autenticado podría llamar a `DELETE /api/auth/users/{userId}` o a `GET /api/payments/all`. Agrava el problema que los roles estén duplicados: `user_role` en la base y `cognito:groups` en el token, sin una política que diga cuál manda. |
| **Evidencia** | `SecurityConfig` de los tres servicios; ausencia de `@PreAuthorize` en los controladores |
| **Probabilidad** | Media — requiere que un socio descubra la ruta |
| **Impacto** | Alto — un socio podría borrar usuarios o listar todos los pagos |
| **Nivel** | 🔴 Alto |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Aplicar `@PreAuthorize("hasRole('Admin')")` en todos los endpoints de administración. Decidir si la fuente de verdad de los roles es Cognito o la tabla `user_role`, y eliminar la otra. |
| **Plan de contingencia** | Revocar los tokens de los socios y filtrar por rol en el gateway hasta poder corregir los controladores. |
| **Disparador** | Un socio accede a un endpoint de administración que no le corresponde |
| **Responsable** | Seguridad |
| **Estado** | Activo |

---

### R-17 — El pipeline solo construye 2 de 5 proyectos

| Campo | Valor |
|-------|-------|
| **Categoría** | DevOps |
| **Descripción** | El `Jenkinsfile` construye únicamente dos de los cinco proyectos del sistema. El resto se despliega a mano, lo que rompe la reproducibilidad y hace que el estado desplegado pueda divergir del repositorio. |
| **Evidencia** | `Jenkinsfile` en la raíz |
| **Requisito afectado** | RNF-30 (despliegue automatizado) |
| **Probabilidad** | Alta |
| **Impacto** | Medio |
| **Nivel** | 🟠 Medio |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Añadir los cinco proyectos al pipeline, incluidos los dos frontends. |
| **Plan de contingencia** | Publicar una guía de despliegue manual versionada, asumiendo que queda desactualizada. |
| **Disparador** | Un entorno desplegado no coincide con el repositorio |
| **Responsable** | DevOps |
| **Estado** | Activo |

---

### R-18 — Endpoints de diagnóstico sin restricción de rol

| Campo | Valor |
|-------|-------|
| **Categoría** | Seguridad |
| **Descripción** | Los 5 endpoints de `/api/diagnostic/*` y el de `/api/inspector/payment-table-structure` exponen la estructura de las tablas y `/api/diagnostic/test-payment` **dispara un pago real**. Exigen un JWT válido, pero no exigen rol `Admin`, así que cualquier socio autenticado puede invocarlos. Además, la documentación Swagger está en `permitAll()` en los tres servicios, lo que publica el mapa completo de la API. |
| **Evidencia** | `DiagnosticController`, `TableInspectorController`; ver el detalle en [`07-api/autenticacion-y-autorizacion.md`](../07-api/autenticacion-y-autorizacion.md) |
| **Probabilidad** | Media |
| **Impacto** | Medio — fuga de esquema y pagos no deseados |
| **Nivel** | 🟠 Medio |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Mover estos controladores a un perfil de Spring activo solo en desarrollo. Proteger Swagger con autenticación. |
| **Plan de contingencia** | Bloquearlos en el proxy si el perfil no basta. |
| **Disparador** | Se detectan pagos de prueba en un entorno de producción |
| **Responsable** | Seguridad |
| **Estado** | Activo |

---

### R-19 — Endpoint público que borra el catálogo de ejercicios

| Campo | Valor |
|-------|-------|
| **Categoría** | Seguridad / Técnico |
| **Descripción** | `POST /api/exercises/sync/clear-and-force` está en `permitAll()`. No exige token, ejecuta `exerciseRepository.deleteAll()` y relanza la descarga de ~1.300 ejercicios. Cualquiera que conozca la URL puede borrar el catálogo y agotar la cuota de RapidAPI. Lo mismo aplica, en menor grado, a `sync/force` y a `/api/nutrition/sync`. No hay rate limiting en ningún endpoint público. |
| **Evidencia** | `SecurityConfig` de QR: `.requestMatchers("/api/exercises/**", "/api/nutrition/**").permitAll()` |
| **Probabilidad** | Alta — el endpoint es público y adivinable |
| **Impacto** | Alto — pérdida del catálogo y agotamiento de cuota |
| **Nivel** | 🔴 Crítico |
| **Estrategia** | Evitar |
| **Plan de mitigación** | Sacar las rutas de sincronización del `permitAll()` y exigirlas a `Admin`. El `permitAll` puede quedar limitado a las rutas de solo lectura, que es lo que realmente necesitan ser públicas. Añadir rate limiting global. |
| **Plan de contingencia** | Lanzar la resincronización manualmente desde consola. |
| **Disparador** | Un ejercicio devuelve 404 o la cuota de RapidAPI se agota de golpe |
| **Responsable** | Backend / QR |
| **Estado** | Activo |

---

### R-20 — No hay recuperación de contraseña

| Campo | Valor |
|-------|-------|
| **Categoría** | Negocio / Producto |
| **Descripción** | No existe ningún endpoint de solicitud ni de canje de contraseña. La entidad `PasswordResetToken` y su repositorio están declarados pero ningún servicio los usa. Un socio que olvida su contraseña solo puede recuperarla por la consola de AWS. |
| **Evidencia** | `PasswordResetToken` sin uso; ausencia de endpoint en `AuthController` |
| **Probabilidad** | Alta — le ocurrirá a cualquier socio |
| **Impacto** | Bajo — hay una ruta alternativa manual, aunque solo para un administrador del sistema |
| **Nivel** | 🟡 Bajo |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Resolver junto con R-26: implementar el reseteo contra la API de Cognito, que es la fuente de verdad, y eliminar la tabla local. |
| **Plan de contingencia** | El administrador cambia la contraseña desde la consola de Cognito a petición del socio. |
| **Disparador** | Primera petición de recuperación de contraseña |
| **Responsable** | Producto |
| **Estado** | Activo |

---

### R-21 — El registro no crea la fila local y los roles divergen

| Campo | Valor |
|-------|-------|
| **Categoría** | Negocio / Técnico |
| **Descripción** | No hay endpoint de alta: el registro ocurre en Cognito desde el frontend y la fila en `user` nace únicamente cuando alguien ejecuta `POST /api/auth/users/sync`. Entre el alta y el `sync` el socio **no existe para el sistema** y no puede contratar membresía. Además `DataInitializer` siembra los roles `Admin` y `Client`, pero `CognitoUserSyncService` asigna `DEFAULT_ROLE = "User"` y lo crea si falta: conviven tres roles. |
| **Evidencia** | `UserService` sin `createUser`; `CognitoUserSyncService.DEFAULT_ROLE = "User"`; `DataInitializer` siembra `Admin` y `Client` |
| **Probabilidad** | Media |
| **Impacto** | Medio |
| **Nivel** | 🟡 Bajo |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Ejecutar la sincronización en el primer inicio de sesión del usuario en lugar de depender de una tarea manual, y unificar el nombre del rol por defecto. |
| **Plan de contingencia** | Un administrador ejecuta `POST /api/auth/users/sync` de forma periódica. |
| **Disparador** | Un socio se registra e intenta contratar una membresía y recibe "usuario no encontrado" |
| **Responsable** | Backend / Login |
| **Estado** | Activo |

---

### R-22 — El borrado de usuario destruye el historial financiero y de accesos

| Campo | Valor |
|-------|-------|
| **Categoría** | Datos / Negocio |
| **Descripción** | `DELETE /api/auth/users/{userId}` ejecuta `userRepository.deleteById`: es un **borrado físico**, no una baja lógica. El script de inicialización declara `ON DELETE CASCADE` desde `"user"` hacia `user_role`, `user_membership`, `payment`, `qr_access`, `access_log` y `password_reset_token`, así que borrar un socio **arrastra su historial de pagos y de accesos**. El resultado depende de cómo se provisionó la base: con el script SQL se pierde el historial; con `ddl-auto: update` sobre una base vacía, Hibernate no crea las claves foráneas y quedan filas huérfanas sin dueño. Ninguno de los dos escenarios es aceptable en un sistema que cobra suscripciones. |
| **Evidencia** | `UserService.deleteUser()`; `data/Database-Setup/database_ Initial.sql` (7 `FOREIGN KEY ... ON DELETE CASCADE`); ausencia de FK en las entidades JPA |
| **Probabilidad** | Alta |
| **Impacto** | Alto — pérdida de trazabilidad de pagos e incidentes de acceso |
| **Nivel** | 🔴 Crítico |
| **Estrategia** | Evitar |
| **Plan de mitigación** | Implementar baja lógica con `status = "deleted"` y una columna `deleted_at`, y sustituir los `ON DELETE CASCADE` por `ON DELETE RESTRICT` en las tablas de historial (pago y acceso). Respetar esa vía en lugar del borrado físico. |
| **Plan de contingencia** | Restaurar el historial desde `data/Database-Setup/test_data.sql` no es viable: hay que recurrir al respaldo de la base. Por eso el disparador de este riesgo es la propia ausencia de respaldos programados. |
| **Disparador** | Un socio es dado de baja y su historial de pagos desaparece de los informes |
| **Responsable** | Backend / Login |
| **Estado** | Activo |

---

### R-23 — La suspensión de socios no suspende nada

| Campo | Valor |
|-------|-------|
| **Categoría** | Seguridad / Negocio |
| **Descripción** | `PATCH /api/auth/users/{userId}/status` escribe `"suspended"` en la columna local, pero **nunca llama a Cognito para deshabilitar la cuenta**. Como la autenticación la resuelve por completo Cognito, el socio suspendido sigue iniciando sesión con normalidad. La suspensión es puramente cosmética. |
| **Evidencia** | `UserService.updateUserStatus()` solo hace `user.setStatus(status)` |
| **Probabilidad** | Media |
| **Impacto** | Alto — un socio dado de baja conserva el acceso |
| **Nivel** | 🔴 Alto |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Complementar el `PATCH` con una llamada a la API de Cognito (`AdminUserGlobalState`), de modo que la baja sea efectiva en el único lugar donde se decide. |
| **Plan de contingencia** | Suspender a mano en la consola de Cognito. |
| **Disparador** | Un socio suspendido sigue accediendo a la sede tras días de baja |
| **Responsable** | Backend / Login |
| **Estado** | Activo |

---

### R-24 — No hay pruebas unitarias del núcleo de negocio

| Campo | Valor |
|-------|-------|
| **Categoría** | Calidad / Técnico |
| **Descripción** | No hay pruebas unitarias que aislen el núcleo de negocio. Todo el código está acoplado a Spring, JPA y llamadas de red, de modo que ni siquiera las 13 reglas de negocio se pueden verificar sin levantar la infraestructura completa. Es la causa raíz de R-04. |
| **Evidencia** | Ausencia de capa de puertos y de casos de prueba |
| **Probabilidad** | Alta |
| **Impacto** | Alto — ninguna corrección de este registro puede validarse |
| **Nivel** | 🔴 Alto |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Ver la hoja de ruta de 5 pasos en [`05-arquitectura/arquitectura-hexagonal.md`](../05-arquitectura/arquitectura-hexagonal.md). Los pasos 1 y 2 son los de mayor retorno. |
| **Plan de contingencia** | Probar manualmente las rutas críticas, asumiendo el costo. |
| **Disparador** | Un cambio en una regla de negocio no se puede verificar más allá de compilar |
| **Responsable** | Calidad |
| **Estado** | Activo |

---

### R-25 — La columna `password_hash` está muerta

| Campo | Valor |
|-------|-------|
| **Categoría** | Datos / Técnico |
| **Descripción** | `User.password_hash` está declarada, pero **ningún código la escribe**: no hay `setPasswordHash`, ni `PasswordEncoder`, ni BCrypt en todo el backend. El valor es siempre `NULL`. Quien lea el esquema asumirá que las contraseñas se validan en local, cuando la única fuente de verdad es Cognito. |
| **Evidencia** | Búsqueda de `setPasswordHash`, `PasswordEncoder` y `BCrypt` en el backend: 0 coincidencias |
| **Probabilidad** | Baja — el defecto es de confusión, no funcional |
| **Impacto** | Bajo |
| **Nivel** | 🟡 Bajo |
| **Estrategia** | Evitar |
| **Plan de mitigación** | Eliminar la columna. No cumple ningún propósito y ocupa espacio. |
| **Plan de contingencia** | Documentar en el diccionario de datos que es vestigial, como está hecho ahora. |
| **Disparador** | Un desarrollador implementa validación de contraseña local sobre una columna que nunca se llena |
| **Responsable** | Datos |
| **Estado** | Activo |

---

### R-26 — El reseteo de contraseña apunta a la fuente equivocada

| Campo | Valor |
|-------|-------|
| **Categoría** | Seguridad / Técnico |
| **Descripción** | El diseño documentado del reseteo (`PasswordResetToken` local con expiración de 15 minutos) actualiza `password_hash` en la base local. Pero la autenticación la resuelve Cognito, así que **aunque se implementara tal cual, el cambio no tendría efecto**: la contraseña del usuario seguiría siendo la de Cognito. El reseteo debe llamar a `AdminSetUserPassword`. |
| **Evidencia** | [`07-api/autenticacion-y-autorizacion.md`](../07-api/autenticacion-y-autorizacion.md) §6; combinando con R-20 y R-25 |
| **Probabilidad** | Baja mientras no exista el flujo |
| **Impacto** | Medio si se implementa sin corregir |
| **Nivel** | 🟠 Medio |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Si se implementa el reseteo, hacerlo contra la API de Cognito y eliminar la tabla `password_reset_token`. |
| **Plan de contingencia** | Mantener el proceso manual por consola mientras tanto. |
| **Disparador** | Alguien implementa el flujo siguiendo la documentación actual |
| **Responsable** | Backend / Login |
| **Estado** | Activo |

---

### R-27 — La sincronización depende de APIs externas con cuota

| Campo | Valor |
|-------|-------|
| **Categoría** | Externo / Técnico |
| **Descripción** | El catálogo de ejercicios (~1.300) y las recetas (500) se descargan de ExerciseDB (RapidAPI) y Spoonacular, con traducción automática vía MyMemory. Si cualquiera falla o agota cuota, la base queda vacía o incompleta. `TranslationService` ya contempla el caso: registra `MYMEMORY WARNING: YOU USED ALL YOUR FREE QUOTA` y **conserva el término en inglés en lugar de fallar**, dejando ejercicios traducidos a medias. Las claves están además hardcodeadas (ver R-15). |
| **Evidencia** | `ExerciseSyncService`, `NutritionSyncService`, `TranslationService` |
| **Probabilidad** | Media |
| **Impacto** | Medio — catálogo incompleto o en dos idiomas |
| **Nivel** | 🟠 Medio |
| **Estrategia** | Mitigar |
| **Plan de mitigación** | Traducir en el momento de la consulta, no en el de la descarga, para que un fallo de traducción no contamine los datos persistidos. Registrar la cuota restante y alertar antes de agotarla. |
| **Plan de contingencia** | Servir el contenido en inglés, que es el estado actual ante el fallo. |
| **Disparador** | El log muestra `YOU USED ALL YOUR FREE QUOTA` |
| **Responsable** | Backend / QR |
| **Estado** | Activo |

---

### R-28 — QR llama a Membership sin token y esa ruta exige JWT (401)

| Campo | Valor |
|-------|-------|
| **Categoría** | Seguridad / Técnico |
| **Descripción** | QR consulta a Membership con un `RestTemplate` que no lleva `Authorization`. La ruta que usa el flujo de ingreso, `GET /api/user-memberships/user/{userId}`, **no está** en el `permitAll()` de Membership, así que responde 401. `QrBusinessService.getMembershipStatus()` captura la excepción y devuelve `false`, con lo que el QR se crea o se actualiza como `inactive` y `marcarIngreso` lanza *"User does not have an active membership"*. En cambio, la ruta de permisos `/*/permission/*` sí es pública, por lo que los ejercicios funcionan: el fallo queda confinado a un solo flujo. |
| **Evidencia** | `GYMETRA - Qr/.../config/SecurityConfig.java:38` (`new RestTemplate()` sin interceptores) · `GYMETRA - Qr/.../service/QrBusinessService.java:54-72` (URL y captura del error) · `GYMETR-Membership/.../config/SecurityConfig.java` (`permitAll` solo con `/api/user-memberships/user/*/permission/*` y `/api/memberships/available`) |
| **Probabilidad** | Alta — ocurre en toda llamada cuando el QR no es vigente o es nuevo |
| **Impacto** | Alto — el socio con membresía vigente no puede entrar |
| **Nivel** | 🔴 Crítico |
| **Estrategia** | Evitar |
| **Plan de mitigación** | Reenviar el JWT del socio en la cabecera `Authorization` de la llamada, o dar a QR un token de servicio, o añadir esa ruta al `permitAll()` de Membership. Aprovechar para añadir timeout. |
| **Plan de contingencia** | Decidir el ingreso con la ruta pública `GET /api/user-memberships/user/{userId}/permission/training`, que sí responde sin token. |
| **Disparador** | `POST /api/access-log/entrada` devuelve 400 *"User does not have an active membership"* a un socio con membresía `ACTIVE`, y Membership responde 401 en ese periodo |
| **Responsable** | Backend / QR |
| **Estado** | Activo — detectado por análisis estático de los dos `SecurityConfig`; confirmar con el sistema levantado antes de cerrar |

---

## 5. Riesgos cerrados y lecciones aprendidas

Ninguno cerrado todavía. Cuando un riesgo se materialice o se mitigue, se registra aquí:

| ID | Riesgo | Resultado | Lección |
|----|--------|-----------|---------|
| — | — | — | — |

---

## 6. Patrones de riesgo habituales en microservicios

Estos riesgos aplican a casi cualquier proyecto de microservicios. Se evaluó cuáles aplican a
GYMETRA y **cuáles ya están cubiertos por una entrada propia**:

| Riesgo típico | Probabilidad | Mitigación estándar | ¿Aplica a GYMETRA? |
|---------------|--------------|---------------------|---------------------|
| Cascada de fallos (un servicio caído tumba todo) | Media | Circuit breaker, timeout, fallback | 🔴 Sí — QR llama a Membership de forma síncrona sin fallback |
| Inconsistencia de datos entre servicios | Alta | Saga, Outbox, consumidores idempotentes | 🔴 Sí — ver R-12 |
| Latencia de red en llamadas síncronas | Alta | gRPC, caché, asincronía | 🟡 Sí — el proxy de membresía añade latencia a cada lectura de QR |
| Esquema que rompe a los consumidores | Alta | Versionar eventos, cambios compatibles primero | 🟡 Sí — sin versionado de API ni de eventos |
| Acumulación de deuda técnica | Alta | DoD con cobertura mínima, revisiones | 🔴 Sí — ver R-04 y R-24 |
| Sobredimensionamiento prematuro | Media | Empezar simple, YAGNI | 🟡 Parcial — se usa `ddl-auto: update` en desarrollo |
| Datos sensibles en logs | Media | Política de logs, enmascarado, SAST | 🔴 Sí — Hibernate en `TRACE` y `show-sql: true` |
| Deriva de configuración entre entornos | Alta | IaC, variables de entorno | 🔴 Sí — ver R-15 y R-17 |

---

## 7. Cómo añadir un riesgo nuevo

```markdown
### R-XX — [Nombre del riesgo]

| Campo | Valor |
|-------|-------|
| **Categoría** | Negocio / Técnico / Calidad / Seguridad / Externo |
| **Descripción** | Qué puede salir mal, con el archivo del código donde se observa |
| **Evidencia** | Referencia al archivo o método concreto |
| **Probabilidad** | Alta / Media / Baja |
| **Impacto** | Alto / Medio / Bajo |
| **Nivel** | Crítico / Alto / Medio / Bajo |
| **Estrategia** | Evitar / Mitigar / Transferir / Aceptar |
| **Plan de mitigación** | Qué se hace para reducir la probabilidad o el impacto |
| **Plan de contingencia** | Qué se hace si el riesgo ya ocurrió |
| **Disparador** | Señal de alarma de que se está materializando |
| **Responsable** | Rol que lo vigila |
| **Estado** | Activo |
```

---

## 8. Correlaciones

| Si cambias esto... | Revisa también... |
|--------------------|-------------------|
| Un riesgo del registro | [`03-producto/vision.md`](../03-producto/vision.md) — principios del producto |
| Un riesgo de datos | [`06-datos/README.md`](../06-datos/README.md) — modelo de datos |
| Un riesgo de seguridad | [`00-gobernanza/reglas-de-seguridad.md`](../00-gobernanza/reglas-de-seguridad.md) |
| Un riesgo de API | [`07-api/README.md`](../07-api/README.md) — inventario de endpoints |
| Una decisión arquitectónica | [`05-arquitectura/decisiones/`](../05-arquitectura/decisiones/) — ADR |
| La prioridad de un riesgo | [`04-requisitos/no-funcionales.md`](../04-requisitos/no-funcionales.md) — RNF |
