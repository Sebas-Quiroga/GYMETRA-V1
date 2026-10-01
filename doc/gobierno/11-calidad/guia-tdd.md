# Guía de TDD

> Cómo se trabaja con TDD en GYMETRA. Los ejemplos usan el código real del repositorio, no casos
> inventados: la mayoría de los ejemplos empiezan por un bug que ya está documentado.

---

## El ciclo

```
Rojo     →  Escribe una prueba que falla
Verde    →  Escribe lo mínimo para que pase
Refactor →  Limpia el código con la prueba en verde
```

En GYMETRA, el paso "Rojo" se hace casi siempre sobre un **fallo ya conocido**. Eso no es una
excusa: es la forma más rápida de convertir un riesgo documentado en un riesgo cerrado.

---

## Ejemplo 1 · Cerrar R-02 con una prueba

### El fallo

`PaymentService.savePaymentSimplified` rellena `amount`, `paymentMethod` y `paymentDate`, pero la
entidad `Payment` declara además `monto`, `metodoPago` y `fechaPago` como `nullable = false`. El
`INSERT` falla.

### Rojo

```java
@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentService paymentService;

    @Test
    void savePaymentSimplified_persisteTodosLosCamposObligatorios() {
        // given
        UserMembership userMembership = new UserMembership();
        userMembership.setId(42);
        PaymentRepository repo = mock(PaymentRepository.class);
        when(repo.save(any(Payment.class)))
            .thenAnswer(inv -> inv.getArgument(0));
        PaymentService service = new PaymentService(repo);

        // when
        Payment saved = service.savePaymentSimplified(
            userMembership,
            new BigDecimal("50000"),
            "credit_card",
            "txn-001",
            "completed");

        // then: hoy esta aserción falla
        assertThat(saved.getMonto()).isEqualByComparingTo("50000");
        assertThat(saved.getMetodoPago()).isEqualTo("CREDIT_CARD");
        assertThat(saved.getFechaPago()).isNotNull();
    }
}
```

La prueba falla en la aserción, no en la base de datos: el repositorio está mockeado, así que **no
hay ningún `INSERT`**. Lo que falla es `assertThat(saved.getMonto())`, porque `monto` llega `null`
al no rellenarlo `savePaymentSimplified`. Es la misma causa que haría fallar el `NOT NULL` real.

### Verde

La corrección no es rellenar los tres campos a mano en el servicio: eso perpetúa la duplicación.
Es eliminar la columna duplicada de la entidad y del script SQL. Una vez hecho, la prueba pasa
porque solo queda un conjunto de campos.

### Por qué esta prueba y no otra

| Prueba | Qué atrapa | Por qué esta es mejor |
|--------|-----------|---------------------|
| Esta | El `INSERT` roto de pagos | Reproduce el fallo real de producción |
| "El servicio devuelve un Payment" | Nada | Pasa hoy, porque el fallo es de base de datos |
| "El controlador responde 200" | Nada | El endpoint devuelve 500 |

---

## Ejemplo 2 · Probar la caída de la dependencia crítica

### El fallo

`MembershipProxyService.checkPermission` hace un `try/catch` que captura **cualquier** excepción y
devuelve `false`. Si Membership está caído, el socio recibe un denegado silencioso, sin
distinguir "no tiene permiso" de "el servicio no respondió".

### Rojo

La firma real es `checkPermission(Long, String)` y devuelve `boolean`. Sobre esa firma, lo primero
que se puede escribir es la prueba de caracterización: hoy los dos casos devuelven lo mismo.

```java
@Test
void checkPermission_conMembershipCa_devuelveFalseYRegistraElError() throws Exception {
    // given: Membership caído
    RestTemplate restTemplate = mock(RestTemplate.class);
    when(restTemplate.getForObject(anyString(), eq(Boolean.class)))
        .thenThrow(new ResourceAccessException("Connection refused"));
    MembershipProxyService service = new MembershipProxyService(restTemplate);
    ReflectionTestUtils.setField(service, "membershipApiUrl", "http://localhost:8081/api");

    PrintStream errOriginal = System.err;
    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    System.setErr(new PrintStream(buffer));
    boolean hasPermission;
    try {
        // when
        hasPermission = service.checkPermission(1L, "training");
    } finally {
        System.setErr(errOriginal);
    }

    // then: devuelve false, idéntico a "Membership responde y no tiene permiso"
    assertThat(hasPermission).isFalse();
    // y el error se tira a System.err, no al logger
    assertThat(buffer.toString()).contains("ERROR VALIDANDO PERMISO");
}
```

Ese `assertThat(...).isFalse()` **pasa hoy**: esa es la cuenta pendiente. Para que exista un Rojo
propio hay que declarar antes el resultado con tres estados, que hoy no existe en el código:

```java
// A crear en el paso 1: ni el record ni el método están en el repositorio
public record PermissionResult(boolean granted, boolean serviceUnavailable) {}

public PermissionResult checkPermissionWithDetail(Long userId, String permission) { ... }
```

Con esa interfaz declarada, la prueba que falla es:

```java
PermissionResult result = service.checkPermissionWithDetail(1L, "training");
assertThat(result.serviceUnavailable()).isTrue();
assertThat(result.granted()).isFalse();
```

### Verde

`MembershipProxyService.checkPermission` necesita devolver un resultado con tres estados
—concedido, denegado, no disponible— en lugar de un `boolean` que colapsa tres situaciones en dos.
Eso obliga a definir qué hace el registrador de accesos cuando Membership no responde, que es la
decisión de negocio que hoy no existe.

### Lo que enseña este caso

Un `boolean` como retorno esconde información. Cuando el valor por defecto y el valor de error
coinciden, el error se vuelve indistinguible del resultado esperado, y la depuración se vuelve
imposible sin logs. Es la causa de que R-14 y R-28 no se hayan detectado antes.

---

## Ejemplo 3 · Probar el reparto de calorías

### El fallo

El plan semanal no reparte las calorías por día (R-13): un plan de 7 días entrega las calorías
totales concentradas, en lugar de distribuidas.

### Rojo

```java
@Test
void generateMealPlan_semanal_reparteLasCaloriasEntreLosDias() {
    // given: el repositorio devuelve una receta con las calorías que se le piden
    RecipeRepository recipeRepository = mock(RecipeRepository.class);
    when(recipeRepository.findRandomByDishTypeAndMaxCalories(anyString(), anyDouble(), anyInt()))
        .thenAnswer(inv -> {
            Recipe recipe = new Recipe();
            recipe.setCalories(inv.getArgument(1));
            recipe.setProtein(10.0);
            recipe.setFat(10.0);
            recipe.setCarbs(10.0);
            return List.of(recipe);
        });
    LocalNutritionService service = new LocalNutritionService(recipeRepository);

    // when: firma real → Map<String, Object>
    Map<String, Object> plan = service.generateMealPlan("week", 14000.0, null);

    // then
    Map<?, ?> weekDays = (Map<?, ?>) plan.get("week");
    assertThat(weekDays).hasSize(7);

    double total = 0;
    for (Object day : weekDays.values()) {
        Map<?, ?> nutrients = (Map<?, ?>) ((Map<?, ?>) day).get("nutrients");
        total += (Double) nutrients.get("calories");
    }
    assertThat(total).isCloseTo(14000.0, within(1.0));
}
```

La prueba se escribe contra el método público `generateMealPlan`: `generateDayPlan` es `private` y
se llega a ella a través de su devolvedor.

### Verde

El fallo está en `LocalNutritionService.generateMealPlan`: la rama semanal calcula
`targetCalories / 7.0` y acto seguido **sobrescribe** esa entrada con `generateDayPlan(targetCalories, …)`,
asignando a cada día el total de la semana. Cada día entrega 14.000 kcal y el plan suma 98.000.
La corrección es eliminar la segunda llamada y quedarse con el reparto entre los 7 días.

### Detalle importante

El mapa que devuelve el método es `Map<String, Object>`: tanto `week` como `nutrients` llegan como
`Object` y hay que castearlos. Las aserciones de arriba comprueban además que `nutrients` existe y
que `calories` no es `null`. **Escribir la prueba así, desde el principio, evita el
`NullPointerException` que aparecería en producción con datos incompletos.**

---

## Qué se prueba y qué no

### Sí se prueba, y en este orden

| Orden | Objetivo | Por qué en ese orden |
|-------|----------|----------------------|
| 1 | Reglas de cálculo: calorías, días restantes, aforo | Sin base de datos, sin red, resultado inmediato |
| 2 | Servicios con colaboradores simulados | Aísla el fallo y localiza la capa |
| 3 | Integración con Testcontainers | El esquema real, que es donde falla R-02 |
| 4 | Autorización: rol requerido en cada endpoint | Hoy ninguno lo exige (R-16, R-18) |
| 5 | Contratos OpenAPI | Detecta deriva entre documentación y código |
| 6 | E2E de los cinco escenarios críticos | Lo más caro, para lo que no se puede probar de otra forma |

### No se prueba

| No | Motivo |
|----|--------|
| Getters y setters | Los genera Lombok, no tienen lógica |
| El arranque de Spring, más allá de una vez | `contextLoads()` ya lo cubre, o no lo cubre |
| Elformateo del código | No es comportamiento |
| La configuración de Maven o Docker | Se verifica con la integración y el pipeline |
| Los `System.out.println` con emoji | No son comportamiento de negocio, son ruido |

---

## Reglas del equipo

| Regla | Motivo |
|-------|--------|
| Una prueba, un comportamiento | Una prueba que hace tres cosas falla sin decir por qué |
| El nombre de la prueba describe el resultado | `checkPermission_noConfundeCaidaDelServicioConFaltaDePermiso` dice qué se verifica; `test1` no |
| Sin `Thread.sleep` | La espera fija hace la suite lenta y frágil |
| Sin dependencia del orden entre pruebas | Una prueba que depende de otra es una bomba de relojería |
| Nada de red real en la suite | Cognito, Spoonacular y RapidAPI se simulan |
| La prueba de integración usa un contenedor propio | `gymdb` contiene datos reales |
| Todo bug corregido lleva su prueba | Sin ella, el bug vuelve |

---

## Errores que se cometen en TDD

| Error | Consecuencia | Cómo evitarlo |
|-------|--------------|----------------|
| Escribir la prueba después del código | La prueba confirma el código, no el requisito | Escribir primero, aunque falle |
| Probar la implementación en vez del comportamiento | Cualquier refactor rompe la prueba | Afirmar sobre el resultado, no sobre las llamadas internas |
| Una prueba gigante con muchos `assert` | Un fallo no localiza el problema | Dividir por comportamiento |
| Usar el `null` como valor por defecto esperado | Se oculta un dato ausente | Comprobar explícitamente el `null` |
| Silenciar la prueba con `@Disabled` | La suite miente sobre el estado real | Arreglar o registrar el riesgo |
| Usar `@SpringBootTest` para todo | Lento y frágil | `@WebMvcTest` para controladores, prueba unitaria para reglas |

---

## Primas 5 pruebas

| # | Prueba | Cierra |
|---|--------|--------|
| 1 | `savePaymentSimplified` persiste todos los campos | R-02 |
| 2 | `generateMealPlan` reparte las calorías por día | R-13 |
| 3 | `checkPermission` distingue caída de servicio de falta de permiso | R-28 |
| 4 | `DELETE /api/auth/users/{id}` conserva el historial de pagos | R-22 |
| 5 | `GET /api/inspector/**` exige rol administrativo | R-18 |

Las cinco usan código que ya existe y fallan hoy. Es el punto de partida menos-costoso para pasar
de 0 % a algo medible.

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`estrategia-de-pruebas.md`](estrategia-de-pruebas.md) | Qué probar en cada capa |
| [`00-gobernanza/definicion-de-listo.md`](../00-gobernanza/definicion-de-listo.md) | Requisitos antes de probar |
| [`00-gobernanza/definicion-de-hecho.md`](../00-gobernanza/definicion-de-hecho.md) | Pruebas como criterio de cierre |
| [`13-operaciones/observabilidad.md`](../13-operaciones/observabilidad.md) | Detectar en producción lo que la prueba no cubre |
