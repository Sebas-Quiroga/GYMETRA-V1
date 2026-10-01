# 14 · Formación

> Manuales para los tres perfiles que tocan GYMETRA: la persona que lo usa, quien lo administra y
> quien lo desarrolla. Cada perfil necesita un documento distinto, y solo uno de los tres puede
> escribirse hoy.

---

## Estado de esta sección

| Documento | Perfil | ¿Se puede escribir ya? |
|-----------|--------|------------------------|
| [`onboarding-tecnico.md`](onboarding-tecnico.md) | Desarrollador nuevo | **Sí** |
| Manual de usuario | Socio del gimnasio | No: las pantallas todavía cambian |
| Manual de administrador | Administrador del panel | Parcialmente |

> La diferencia entre "se puede escribir" y "hay que escribirlo" importa. Un manual de usuario
> escrito sobre pantallas que van a cambiar se queda viejo en semanas y, peor, da una confianza
> injusta. Este repositorio tiene [64 endpoints documentados](../07-api/README.md) y **cero
> pruebas**; lo primero que necesita un usuario nuevo es que el sistema sea fiable, no un
> documento que lo describa.

---

## Documentos de esta sección

| Documento | Contenido |
|-----------|-----------|
| [`onboarding-tecnico.md`](onboarding-tecnico.md) | Guía de incorporation para quien va a contribuir al código |

---

## Lo que sí está listo

### Para desarrollar

Todo lo necesario para empezar a trabajar hoy está en
[`10-devops/configuracion-local.md`](../10-devops/configuracion-local.md), con estas salvedades
que conviene conocer **antes** de la primera hora:

| Advertencia | Detalle |
|-------------|---------|
| El compose solo levanta 2 de 5 proyectos | Membership y QR arrancan a mano |
| El perfil `prod` de Login no conecta | La contraseña no coincide con la del compose |
| Las pruebas no existen | `mvn test` arranca dos contextos y no comprueba nada |
| El health check del pipeline da 404 | No sirve para nada |
| Hay credenciales reales en el repositorio | No usarlas ni compartirlas tal cual |

### Para operar

[`13-operaciones/gestion-de-incidentes.md`](../13-operaciones/gestion-de-incidentes.md) define
un procedimiento ejecutable por una sola persona, con comandos concretos de diagnóstico.

---

## Lo que falta

| Falta | Para quién | Por qué no está escrito |
|-------|-----------|-------------------------|
| Manual de usuario | Socio | Las pantallas no están estables; el registro tiene un flujo de verificación sin cerrar |
| Manual de administrador | Administrador del panel | El panel no tiene autorización real: lo que puede ver un usuario con token no está definido |
| Material de formación de personal de gimnasio | Personal de recepción | Nadie ha definido qué debe saber esa persona para atender a un socio |

> El tercer perfil es el que más se ha descuidado y el que más impacto tiene. Un socio que no puede
> entrar al gimnasio no llama al equipo técnico: llama a recepción. Sin un guion de qué hacer y a
> quién escalar, cada incidencia se convierte en una llamada que hay que atender a mano.

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`onboarding-tecnico.md`](onboarding-tecnico.md) | Guía del desarrollador nuevo |
| [`10-devops/configuracion-local.md`](../10-devops/configuracion-local.md) | Primer paso del onboarding |
| [`11-calidad/guia-tdd.md`](../11-calidad/guia-tdd.md) | Flujo de trabajo con pruebas |
| [`00-gobernanza/reglas-de-documentacion.md`](../00-gobernanza/reglas-de-documentacion.md) | Reglas de escritura de esta documentación |
| [`12-ux-ui/mapa-de-navegacion.md`](../12-ux-ui/mapa-de-navegacion.md) | Qué hace cada pantalla que se documentaría |
