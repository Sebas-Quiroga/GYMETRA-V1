# 12 · UX y UI

> El sistema de diseño y la navegación de los dos frontends de GYMETRA, verificados contra los
> archivos de tema y los de enrutado del repositorio.

---

## Qué hay

| | `gymetra-frontend` | `admin-frontend` |
|---|---|---|
| **Perfil** | App del socio | Panel de administración |
| **Vistas** | 11 | 18 |
| **Líneas de vista** | 1.987 | 5.583 |
| **Framework** | Vue 3.3 + Ionic 8 + Vite 5.2 + Pinia 3 | Vue 3.3 + Ionic 7 + Vite 4.4 + Pinia 2.1 |
| **Rutas** | 10 | 13 |
| **Tema** | `src/modules/shared/theme/variables.css` | `src/theme/variables.css` |
| **Tema oscuro** | Por preferencia del sistema | Por preferencia del sistema |
| **Móvil** | Capacitor 7.4 preparado | No |
| **Gráficos** | Chart.js 4.5 | Chart.js |

> **Los dos frontends usan versiones distintas de casi todo**: Ionic 8 frente a 7, Vite 5 frente a
> 4, Pinia 3 frente a 2. No es un error, pero sí un coste: cada decisión de diseño hay que
> tomarla dos veces, y una migración de dependencias las afecta de forma distinta.

---

## Documentos de esta sección

| Documento | Contenido |
|-----------|-----------|
| [`sistema-de-diseno.md`](sistema-de-diseno.md) | Colores, tipografía, espaciado, componentes y modo oscuro |
| [`mapa-de-navegacion.md`](mapa-de-navegacion.md) | Rutas, guards, flujo de usuario y puntos de fricción |

---

## Hallazgos principales

| Hallazgo | Detalle |
|----------|---------|
| El tema oscuro depende del sistema | `prefers-color-scheme: dark`: no hay conmutador manual |
| La barra lateral es el mayor componente del panel | `AdminSidebar.vue` con 654 líneas |
| Tres componentes superan las 500 líneas | `PagosPage`, `MetricasPage`, `PdfButton`, `ExcelButton` |
| Las rutas no siguen una convención | `/Pasarelapago`, `/Planes`, `/adminadduser` mezclan mayúsculas, español e inglés |
| No hay biblioteca de componentes | Cada vista define su propio CSS en un archivo `theme/` propio |
| El registro es la vista más larga | `RegisterPage.vue`, 540 líneas, con un archivo CSS aparte |
| La ruta raíz no está protegida en el frontend | El primer render depende de lo que devuelva la ruta `/` |

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`03-producto/`](../03-producto/README.md) | Visión de producto y usuarios |
| [`04-requisitos/`](../04-requisitos/README.md) | Requisitos funcionales de las pantallas |
| [`08-uml/`](../08-uml/README.md) | Diagrama de casos de uso |
| [`10-devops/entornos.md`](../10-devops/entornos.md) | Variables que controlan las URLs de la interfaz |
