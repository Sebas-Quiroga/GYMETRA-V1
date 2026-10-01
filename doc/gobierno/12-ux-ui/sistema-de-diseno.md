# Sistema de diseño

> Tokens, tipografía y componentes de los dos frontends. Todo lo de esta página está leído de los
> archivos `variables.css` y de las vistas del repositorio.

---

## Paleta de marca

Los dos frontends comparten los mismos colores de marca. Esa consistencia sí está lograda.

| Token | Valor | Uso |
|-------|-------|-----|
| `--brand-primary` | `#00ACC1` | Cian de marca: acciones, enlaces, elementos activos |
| `--brand-secondary` | `#263238` | Gris azulado oscuro: texto de cabecera, iconos |
| `--brand-accent` | `#FFB300` | Ámbar de acento previsto |
| `--ion-color-primary-shade` | `#0098aa` | Estado presionado del primario |
| `--ion-color-primary-tint` | `#1ab4c7` | Estado hover del primario |
| `--brand-primary-fade` | `rgba(0, 172, 193, 0.15)` | Fondos suaves, halos de foco |

> El acento `#FFB300` está definido en ambos archivos de tema, pero **no se usa en ninguna regla de
> ningún componente**: el token existe y no se aplica. Es un color previsto que nunca llegó a
> usarse, o un color que se quedó sin uso tras un rediseño.

---

## Tipografía

| Token | Valor | Aplicación |
|-------|-------|------------|
| `--app-font-family` | `'Inter', system-ui, -apple-system, sans-serif` | Todo el texto de la interfaz |
| `--app-font-brand` | `'Outfit', sans-serif` | Solo la marca |
| `--ion-font-family` | `var(--app-font-family)` | Se lo pasa a Ionic |

| Frontend | Fuente de marca |
|----------|-----------------|
| `gymetra-frontend` | `'Outfit', sans-serif` |
| `admin-frontend` | `'Outfit', var(--app-font-family)` — con respaldo |

> La diferencia del respaldo es menor, pero significa que las cabeceras de la marca pueden verse
> distintas si `Outfit` no carga en una de las dos aplicaciones.

---

## Tema claro

### Aplicación del socio

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg-page` | `#f8f9fa` | Fondo general |
| `--bg-card` | `#ffffff` | Tarjetas y superficies |
| `--bg-subtle` | `#f1f3f4` | Zonas secundarias |
| `--text-main` | `#1c1c1c` | Texto principal |
| `--text-sub` | `#4b5563` | Texto secundario |
| `--text-muted` | `#9ca3af` | Texto atenuado, 마크s de ayuda |
| `--border-color` | `#e5e7eb` | Bordes de tarjeta y separadores |
| `--color-success` | `#10b981` | Confirmaciones |
| `--color-error` | `#ef4444` | Errores |

### Panel de administración

El panel usa un prefijo propio, `admin-`, lo que evita colisiones pero duplica los tokens.

| Token | Valor |
|-------|-------|
| `--admin-bg-page` | `#F8FAFB` |
| `--admin-bg-card` | `#FFFFFF` |
| `--admin-bg-subtle` | `#F1F3F4` |
| `--admin-text-main` | `#263238` |
| `--admin-text-sub` | `#546E7A` |
| `--admin-text-muted` | `#90A4AE` |
| `--admin-border` | `#E0E4E7` |
| `--admin-accent` | `var(--brand-primary)` |
| `--admin-accent-soft` | `var(--brand-primary-fade)` |

Al final del archivo, el panel **aliasa** sus tokens propios a los genéricos:

```
--bg-page  → var(--admin-bg-page)
--bg-card  → var(--admin-bg-card)
--text-main → var(--admin-text-main)
```

Es un patrón correcto: un solo lugar donde cambiar el color, aunque obliga a leer dos capas para
saber qué color se ve realmente en pantalla.

---

## Tema oscuro

Ambos frontends lo implementan con la preferencia del sistema operativo:

```css
@media (prefers-color-scheme: dark) { ... }
```

### Aplicación del socio

| Token | Claro | Oscuro |
|-------|-------|--------|
| `--bg-page` | `#f8f9fa` | `#0f172a` |
| `--bg-card` | `#ffffff` | `#1e293b` |
| `--bg-subtle` | `#f1f3f4` | `#111827` |
| `--text-main` | `#1c1c1c` | `#f8fafc` |
| `--text-sub` | `#4b5563` | `#cbd5e1` |
| `--text-muted` | `#9ca3af` | `#64748b` |
| `--brand-primary` | `#00ACC1` | **`#22d3ee`** |
| `--logo-filter` | `brightness(0)` | `none` |

### Panel de administración

| Token | Claro | Oscuro |
|-------|-------|--------|
| `--admin-bg-page` | `#F8FAFB` | `#0F172A` |
| `--admin-bg-card` | `#FFFFFF` | `#1E293B` |
| `--admin-bg-subtle` | `#F1F3F4` | `#141E33` |
| `--admin-text-main` | `#263238` | `#F8FAFC` |
| `--admin-text-sub` | `#546E7A` | `#94A3B8` |
| `--admin-text-muted` | `#90A4AE` | `#64748B` |
| `--admin-border` | `#E0E4E7` | `rgba(255, 255, 255, 0.08)` |

### Dos consecuencias del modo oscuro por preferencia del sistema

1. **No hay conmutador.** Un socio en modo claro y otro en modo oscuro ven pantallas distintas sin
   que ninguno lo haya pedido. Para una app de gimnasio, donde el uso en sala con luz suele ser en
   modo claro, conviene un conmutador manual.
2. **El color de marca cambia con el tema.** `--brand-primary` pasa de `#00ACC1` a `#22d3ee`. Las
   capturas de pantalla y los materiales impresos dejan de corresponder con la aplicación.

---

## Espaciado, radios y sombras

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-xl` | `1.5rem` | Tarjetas grandes |
| `--radius-lg` | `1rem` | Botones y campos |
| `--radius-md` | `0.75rem` | Chips y etiquetas |
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Elevación sutil |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Elementos flotantes |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Modales |

El panel usa su propia escala:

| Token | Valor |
|-------|-------|
| `--admin-radius-sm` | `8px` |
| `--admin-radius-md` | `12px` |
| `--admin-radius-lg` | `16px` |
| `--admin-radius-xl` | `24px` |
| `--admin-shadow-md` | `0 10px 24px rgba(38, 50, 56, 0.08)` |
| `--admin-shadow-lg` | `0 18px 50px rgba(38, 50, 56, 0.12)` |

> **Los radios no coinciden.** El panel usa un sistema de 8 px y la app del socio uno basado en
> `rem` con 12, 16 y 24 px. El mismo tipo de botón se ve distinto en una aplicación y en la otra.

---

## Campos de formulario

La app del socio define los campos con una sobrescritura de los componentes de Ionic:

```css
/* Fragmento real de variables.css */
--background: var(--input-bg) !important;
--border-radius: 12px !important;
--padding-start: 1.25rem !important;
--highlight-height: 0;
--border-width: 0 !important;
```

| Token | Valor | Efecto |
|-------|-------|--------|
| `--input-bg` | `rgba(0, 0, 0, 0.03)` | Fondo casi transparente |
| `--input-bg-focus` | `rgba(0, 172, 193, 0.05)` | Fondo al enfocar |
| `--input-border` | `rgba(0, 0, 0, 0.1)` | Borde sutil |
| `--input-border-focus` | `var(--brand-primary)` | Borde de marca al enfocar |
| `--input-shadow-focus` | `0 0 0 3px rgba(0, 172, 193, 0.2)` | Halo de foco |
| `--input-placeholder` | `rgba(0, 0, 0, 0.4)` | Placeholder |

> Los `!important` sobre variables de Ionic son la vía habitual para ajustar componentes, pero
> impeden que cualquier vista los sobrescriba con especificidad normal. Es una deuda que se paga
> cuando hace falta un campo con otro estilo.

---

## Botones de autenticación

```css
--btn-auth-bg: linear-gradient(135deg, var(--brand-primary) 0%, #0098aa 100%);
--btn-auth-text: #ffffff;
box-shadow: 0 8px 24px var(--brand-primary-fade);
```

Con `border-radius: 12px`. En modo oscuro, el degradado pasa a `#22d3ee` → `#00d2ff` y el texto
pasa a **negro**, porque el cian claro necesita texto oscuro para mantener el contraste.

---

## Componentes

No hay biblioteca de componentes. Cada vista tiene su propio archivo CSS en `theme/`.

### Aplicación del socio

| Archivo | Líneas |
|---------|---------|
| `auth/theme/` | Login, Registro, verificación |
| `home/` | Inicio |
| `profile/` | Perfil |
| `qr/` | Código QR |
| `membership/theme/` | Planes, pasarela de pago |
| `training/` | Rutinas |
| `nutrition/` | Plan de nutrición |

### Panel de administración

| Componente | Líneas | Nota |
|------------|---------|------|
| `components/AdminSidebar.vue` | 654 | La barra lateral completa, con lógica dentro |
| `components/ExcelButton.vue` | 482 | Exportación a Excel |
| `components/PdfButton.vue` | 598 | Exportación a PDF |
| `components/Pagination.vue` | 260 | Paginación reutilizable |

> Los tres componentes grandes del panel son de exportación y navegación, y los tres llevan la
> lógica embebida en el archivo de vista. `AdminSidebar` con 654 líneas es el caso más claro: un
> componente de navegación no debería necesitar ese tamaño.

### Vistas más largas

| Vista | Líneas | Problema probable |
|-------|--------|-------------------|
| `RegisterPage.vue` | 540 | Verificación en varios pasos, validaciones y envío |
| `PagosPage.vue` | 678 | Filtros, tabla, paginación y exportación |
| `MetricasPage.vue` | 604 | Gráficos y consultas agregadas |
| `ReportesPage.vue` | 551 | Generación y descarga de informes |
| `LoginPage.vue` | 273 | Formulario más validación |

---

## Lo que falta

| Ausencia | Consecuencia |
|----------|--------------|
| Conmutador de tema | El usuario no decide; depende del sistema |
| Biblioteca de componentes | Cada vista repite estilos; un cambio de marca obliga a tocar todas |
| Escala de espaciado | No hay tokens de separación: se usan valores sueltos |
| Estados de carga y vacío compartidos | Cada vista los inventa, y no todas los tienen |
| Guía de accesibilidad | No hay criterio documentado de contraste, foco o tamaño mínimo |
| Tokens de tipografía | No hay escala de tamaños ni pesos; cada vista elige los suyos |
| Uso real de `--brand-accent` | El ámbar está definido y no se usa |

---

## Correlaciones

| Documento | Relación |
|-----------|----------|
| [`mapa-de-navegacion.md`](mapa-de-navegacion.md) | Dónde se aplica cada estilo |
| [`03-producto/`](../03-producto/README.md) | Perfil del socio y del administrador |
| [`12-ux-ui/README.md`](README.md) | Resumen de la sección |
