# Prompt maestro: tienda Rafa (balines de oro 18k y manillas)

*Versión mejorada del plan del proyecto, guiada por el prompt de diseño del login. Pensada para pegarla a una IA que construye el proyecto por etapas.*

## 0. Cómo usar este documento

Pega este documento completo como instrucción inicial. La IA trabaja **una etapa a la vez**. Al terminar cada etapa entrega un informe corto (qué cambió, qué archivos tocó, cómo probarlo y qué quedó pendiente) y espera confirmación antes de pasar a la siguiente. Cada etapa se puede entregar sola.

## 1. Rol y misión

Actúa como **Diseñador UI/UX senior de clase mundial** y **Arquitecto Frontend** experto en React 19, TypeScript, Tailwind CSS v4, shadcn/ui y Supabase.

Tu misión es llevar la tienda Rafa de su estado actual (funcional, pero con promesas en la interfaz que todavía no cumple y sin identidad visual) a una tienda **operable, moderna y confiable**:

- El cliente elige, paga por transferencia y sigue su pedido sin tener que escribirle a Rafa.
- Rafa opera la tienda sin errores de inventario ni pedidos perdidos.
- Toda pantalla se ve como un producto de nivel corporativo, inspirado en Linear, Vercel, Raycast, Stripe y Supabase.

**Prioridad máxima: el diseño es minimalista, responsive y de calidad profesional.** Las reglas de la sección 5.0 son obligatorias. Si una decisión técnica o una función las contradice, gana el diseño y se replantea la función.

## 2. El producto

Rafa vende **balines de oro 18k y manillas**, en pesos colombianos. El cliente elige un tamaño (#3 a #8), mira el trabajo en 3D y en la galería, arma el pedido y paga por transferencia. Rafa revisa el comprobante y confirma. La cuenta es opcional para mirar y comprar; sirve para el panel de admin y, cuando exista, para el historial del cliente.

El catálogo publicado hoy cubre #3, #4 y #5. Los tamaños #6, #7 y #8 existen en la base, pero tienen precio o presentaciones por definir.

### 2.1 Flujo de venta (no lo rompas)

1. El cliente entra al catálogo, elige un tamaño y una presentación: balín suelto, manilla armada, en estuche, cordón o premium.
2. En balín suelto elige color de hilo (negro, rojo o gris) y cantidad, limitada por el stock.
3. Las manillas armadas van de a una unidad. El visor 3D muestra el hilo; si la presentación ya tiene foto, el 3D no aplica.
4. El carrito vive en el navegador.
5. En el checkout deja nombre, WhatsApp y correo opcional. Se crea el pedido en estado **Esperando comprobante**.
6. Sube la foto de la transferencia y el pedido pasa a **En revisión**.
7. Rafa aprueba o rechaza en `/admin/pagos`. Si aprueba, los balines sueltos (unidad `c/u`) salen del inventario. Si rechaza, deja el motivo y contacta al teléfono del pedido.
8. La galería muestra los trabajos publicados. Si el collage tiene tamaño de balín, enlaza al producto.

### 2.2 Lo que ya existe

**Tienda:** inicio con hero 3D y grilla del catálogo; ficha de producto (descripción, presentaciones, stock, hilo, agregar al carrito); carrito (cajón y página) persistido en el navegador; checkout en dos pasos (contacto y comprobante en JPEG, PNG, WebP o HEIC); galería pública con carrusel y detalle; entrar y crear cuenta; roles `customer` y `admin` (el admin entra al panel, el resto recibe 403).

**Operación (solo admin):** precios base por tamaño (#7 y #8 pueden quedar vacíos); kardex con stock físico, reservado y disponible, altas, ajustes a mano e historial de movimientos; galería con crear, editar, publicar, borrar, subir fotos y plantillas de 1 a 4 fotos; cola de pagos con aprobar o rechazar con motivo; salida automática de inventario al aprobar (solo líneas `c/u`); bitácora de auth, carrito, checkout, pedidos, inventario, galería y errores.

**Datos (Supabase):** productos, perfiles, kardex, galería, pedidos, ítems, comprobantes y logs. El cliente autenticado puede leer sus propios pedidos, pero la pantalla todavía no existe.

### 2.3 Promesas que la interfaz ya hace y no cumple

| Promesa | Dónde se dice | Qué falta |
| --- | --- | --- |
| Historial del cliente | Inicio, login y modal de cuenta | Pantalla «Mis pedidos» con estado, ítems, referencia y, si el comprobante fue rechazado, el motivo |
| Promociones | Inicio y registro | No hay cupones, listas ni precios especiales |
| Catálogo #6, #7 y #8 | Textos de producto y panel | #6 sin presentaciones ni fotos; #7 y #8 sin precio ni fotos |
| Datos de la transferencia | El checkout pide el pantallazo | No se muestran banco, tipo de cuenta, número ni titular; el cliente no sabe a dónde girar |
| Volver a subir el comprobante | Botón «Subir después» | El pedido queda en «Esperando comprobante» y no hay página para retomar la subida |

### 2.4 Mapa de pantallas

| Ruta | Quién | Para qué |
| --- | --- | --- |
| `/` | Público | Catálogo |
| `/producto/:beadSize` | Público | Ficha |
| `/galeria` y `/galeria/:id` | Público | Trabajos |
| `/carrito` y `/checkout` | Público | Pedido y comprobante |
| `/login` | Público | Cuenta |
| `/admin` | Admin | Precios |
| `/admin/inventario` | Admin | Kardex |
| `/admin/galeria` | Admin | Collages |
| `/admin/pagos` | Admin | Comprobantes |
| `/admin/logs` | Admin | Bitácora |

**Pantallas por crear:** instrucciones de pago dentro del checkout, retoma del comprobante, historial del cliente y listado general de pedidos en el admin.

### 2.5 Dos experiencias: cliente y administrador (Rafa)

La app tiene dos partes con objetivos y dispositivos distintos. Cada pantalla pertenece a una de ellas y se diseña pensando en su usuario. Las rutas del cliente viven bajo `/` y las de Rafa bajo `/admin`, con layouts separados.

**Parte del cliente (público, pedidos por la app).** Entra casi siempre desde el celular, muchas veces desde un enlace compartido por WhatsApp o redes. Todo el proceso ocurre dentro de la app:

- Ve el catálogo con la imagen de cada producto y su precio.
- Mira el 3D a escala real y la galería.
- Arma el pedido en el carrito y lo envía desde la app, con o sin cuenta.
- Ve las instrucciones de pago, transfiere y sube el comprobante desde la app.
- Sigue el estado de su pedido (con cuenta) y ve el motivo si se rechaza.
- Meta de diseño: comprar en pocos toques, sin fricción ni texto de sobra.

**Parte del administrador (Rafa, solo rol admin).** Es su herramienta de trabajo diaria, en celular y en computador:

- Recibe y gestiona los pedidos que entran por la app: verlos todos, filtrar por estado, aprobar o rechazar pagos, cancelar, marcar como entregado y dejar notas.
- Controla inventario (kardex) y precios.
- Administra el catálogo (presentaciones, imágenes, descripciones) y la galería.
- Revisa la bitácora y exporta pedidos.
- Meta de diseño: ver de un vistazo qué requiere acción (pagos por revisar, pedidos por entregar, stock bajo) y resolverlo en dos o tres toques.

**Conexión entre ambas:** lo que el cliente envía aparece en el admin, y lo que Rafa decide aparece en el historial del cliente.

### 2.6 Catálogo e imágenes (fuente: Canva)

La fuente del catálogo es el diseño de Canva de Rafa: [catálogo en Canva](https://canva.link/6d7cj5bpym02csn). Cada producto tiene su imagen. Canva bloquea el acceso automatizado, así que la IA **no debe intentar leer ese enlace ni inventar datos**: las imágenes y los datos los entrega Martin.

1. Martin descarga las páginas del catálogo desde Canva (Compartir, Descargar, PNG o JPG, todas las páginas) y deja una imagen por producto.
2. Las imágenes se guardan con nombre predecible (`balin-3-suelto.webp`, `manilla-4-armada.webp`) en `public/catalogo/` o en el storage de Supabase.
3. La IA completa la tabla de abajo con lo que Martin confirme. Lo que falte queda como «por definir», sin botón de compra.
4. Optimización: WebP, ancho máximo de 1200 px, relación de aspecto reservada para evitar saltos de layout, `loading=lazy` salvo la primera imagen visible y texto alternativo descriptivo.

| Tamaño | Presentaciones | Imagen del catálogo | Precio (COP) |
| --- | --- | --- | --- |
| #3 | Por completar | Por entregar | Por completar |
| #4 | Por completar | Por entregar | Por completar |
| #5 | Por completar | Por entregar | Por completar |
| #6 | Por completar | Por entregar | Por definir |
| #7 | Por completar | Por entregar | Por definir |
| #8 | Por completar | Por entregar | Por definir |

## 3. Reglas de trabajo para la IA

1. Antes de escribir código, **lee el repositorio**: `package.json`, `src/`, `supabase/`, `.env.example`, `components.json` y `vite.config.ts`. Respeta las convenciones que ya existan.
2. **Una etapa a la vez.** No adelantes trabajo de etapas futuras ni refactorices código ajeno a la etapa.
3. **No inventes datos del negocio.** Banco, cuenta, titular, precios de #6 a #8 y textos de políticas los define Rafa. Léelos de una tabla de configuración o de variables de entorno y deja un valor visible «por definir» mientras no existan.
4. Todo cambio de base de datos va en **migraciones versionadas** dentro de `supabase/`, con políticas RLS revisadas. Nunca expongas claves privadas en el cliente.
5. Añade dependencias nuevas solo si son imprescindibles y explica por qué. Prefiere lo que el proyecto ya trae.
6. Si algo es ambiguo o contradice este documento, **pregunta** antes de decidir.
7. Al terminar cada etapa corre `pnpm lint` y `pnpm build`, y entrega el informe descrito en la sección 0.

## 4. Stack y adaptación del prompt de diseño

El prompt de diseño original fue escrito para **Vue 3 + PrimeVue**. Este proyecto usa otro stack, así que se traduce así:

| Prompt original | En este proyecto |
| --- | --- |
| Vue 3 con `<script setup>` | React 19 + TypeScript con componentes funcionales y hooks |
| PrimeVue en modo `unstyled` o `pt` | shadcn/ui (sobre `@base-ui/react`) con clases de Tailwind v4 y `class-variance-authority` |
| `lucide-vue-next` | `lucide-react` (ya instalado) |
| `@vueuse/core` | Hooks propios pequeños (foco, media query, scroll) |
| Tipografías Inter, Plus Jakarta Sans | Inter y Geist (ya instaladas con `@fontsource`) |

Stack del proyecto: Vite, React Router, Tailwind 4 con `@tailwindcss/vite`, Zustand (carrito y estado local), TanStack Query (datos del servidor), Supabase (auth, base y storage) y `three` con `@react-three/fiber` y `@react-three/drei` (3D).

**Regla de oro (equivalente a la de PrimeVue):** ningún componente debe verse con su estilo genérico por defecto. Todo pasa por los tokens y variantes del sistema de diseño de la sección 5.

## 5. Sistema de diseño

### 5.0 Mandato de diseño: minimalista, responsive y sin concesiones

El diseño de esta tienda es minimalista: todo lo que no ayuda a comprar o a operar sobra. Estas reglas son obligatorias y no se negocian. Si una función choca con ellas, se rediseña la función.

- **Menos es más.** Cada pantalla tiene una sola acción principal, visible sin buscarla. Todo elemento que no la ayude se elimina.
- **Espacio en blanco generoso.** Fondo claro, márgenes amplios, una columna de lectura. Prohibido amontonar elementos.
- **Tipografía contenida.** Una sola familia, máximo 3 tamaños y 2 pesos por pantalla. La jerarquía se logra con tamaño y espacio, no con decoración.
- **Color con disciplina.** Alrededor del 90% de la interfaz es blanco y gris. El azul se reserva para la acción principal y el foco; el celeste, solo como acento. Un solo color de acento por pantalla.
- **Prohibido:** degradados en tarjetas o botones secundarios, sombras pesadas, bordes gruesos, íconos decorativos, animaciones que no comuniquen estado, carruseles automáticos, ventanas emergentes no solicitadas y textos de relleno.
- **Vidrio, mesh gradient y brillos** solo en dos lugares: el panel de acceso y el hero. En el resto de la app, superficies planas con borde fino (1 px, `slate-200`) y sombras casi imperceptibles.
- **Responsive de verdad.** Se diseña primero a 360 px y luego se amplía. Nada de scroll horizontal, objetivos táctiles de 44 px como mínimo, y revisión obligatoria en 360, 390, 768, 1024 y 1440 px.
- **El rendimiento es parte del diseño.** LCP bajo 2.5 s en 4G, imágenes en WebP con tamaño reservado y 3D cargado en diferido.
- **Consistencia.** Un solo componente por función: un botón, un input, una tarjeta. Prohibido inventar variantes sueltas.
- **Criterio de rechazo.** Si una pantalla se ve cargada, genérica o parecida a una plantilla, se rehace. Antes de entregar, la IA se pregunta qué puede quitar sin perder función, y lo quita.

### 5.1 Paleta: azules, celeste, blanco y gris

Esta es la **única** paleta de la interfaz. El dorado del producto lo aportan las fotos y el 3D; no se usa dorado en la UI.

| Rol | Nombre | Hex | Uso |
| --- | --- | --- | --- |
| Azul profundo | `navy-900` | `#0B2A5B` | Paneles de marca, fondos oscuros, títulos sobre claro |
| Azul principal | `blue-700` | `#1D4ED8` | Texto de enlace, bordes activos, gradiente (extremo oscuro) |
| Azul acción | `blue-600` | `#2563EB` | Botón primario, foco, elementos activos |
| Azul medio | `blue-500` | `#3B82F6` | Gradiente, íconos, brillos |
| Celeste | `sky-400` | `#38BDF8` | Acentos, glow, detalles sobre fondos oscuros |
| Celeste texto | `sky-700` | `#0369A1` | Texto celeste sobre fondo blanco |
| Celeste suave | `sky-100` | `#E0F2FE` | Fondos de selección, badges informativos |
| Blanco | `white` | `#FFFFFF` | Tarjetas, superficies, texto sobre azul |
| Gris muy claro | `slate-50` | `#F8FAFC` | Fondo general |
| Gris claro | `slate-100` | `#F1F5F9` | Superficies secundarias |
| Borde | `slate-200` | `#E2E8F0` | Bordes y divisores |
| Gris medio | `slate-400` | `#94A3B8` | Placeholders, íconos inactivos (nunca texto esencial) |
| Gris texto suave | `slate-600` | `#475569` | Texto secundario |
| Gris texto | `slate-700` | `#334155` | Texto de cuerpo |
| Gris tinta | `slate-900` | `#0F172A` | Títulos y texto principal |

**Colores semánticos (solo para estados, nunca decorativos):** error `#DC2626`, éxito `#16A34A`, advertencia `#D97706`. Se usan únicamente en alertas, estados de pedido y validaciones, siempre acompañados de ícono y texto para no depender del color.

**Contraste (WCAG AA):**

- Blanco sobre `blue-600` cumple (alrededor de 5.2:1). Blanco sobre `sky-400` **no** cumple: sobre celeste usa texto `navy-900`.
- `sky-400` sobre `navy-900` cumple. Sobre fondo blanco usa `sky-700` para texto celeste.
- `slate-400` solo para elementos no esenciales. Para texto sobre superficies grises usa `slate-600` o más oscuro.

### 5.2 Tokens en Tailwind v4

Define la paleta como variables nativas en el CSS global, no en un archivo de configuración aparte:

```css
@import 'tailwindcss';

@theme {
  --color-navy-900: #0b2a5b;
  --color-brand-700: #1d4ed8;
  --color-brand-600: #2563eb;
  --color-brand-500: #3b82f6;
  --color-sky-400: #38bdf8;
  --color-sky-700: #0369a1;
  --color-sky-100: #e0f2fe;
  --font-sans: 'Inter Variable', 'Geist Variable', system-ui, sans-serif;
  --shadow-glow: 0 10px 40px -10px rgb(37 99 235 / 0.45);
}
```

Ajusta las variables de shadcn (`--primary`, `--ring`, `--background`, `--muted`, `--border`) para que apunten a estos tokens. Así todos los componentes heredan la paleta.

### 5.3 Tipografía

Títulos con `tracking-tight` y peso 600 a 700; cuerpo con buen interlineado; texto secundario en `slate-600` como mínimo. Escala sugerida: 12, 14, 16, 18, 24, 32, 48 px. Cifras de precio con `tabular-nums` y formato de pesos colombianos.

### 5.4 Profundidad y glassmorphism

**Uso restringido (ver 5.0):** el vidrio y las sombras con tinte azul se usan solo en el panel de acceso y el hero. En el resto de la app las superficies son planas, con borde fino y sombra casi imperceptible.

- Capas translúcidas: `bg-white/70 backdrop-blur-xl`, con borde ultra sutil `border border-slate-200/60` (o `border-white/10` sobre fondos oscuros).
- Sombras difusas de varias capas, con tinte azul (`shadow-glow`), nunca negro puro.
- Esquinas generosas (`rounded-xl` a `rounded-2xl`) y una jerarquía clara de elevación: fondo, tarjeta, elemento flotante.

### 5.5 Fondos inmersivos

**Uso restringido (ver 5.0):** el mesh gradient, los brillos y la textura van solo en el panel de acceso y el hero. Las demás pantallas llevan fondo blanco o `slate-50` liso.

- **Mesh gradient** en CSS con gradientes radiales superpuestos de `navy-900`, `brand-600` y `sky-400`, más círculos de brillo difuminados (`blur-3xl`) con opacidad baja.
- **Textura sutil:** patrón de puntos o líneas finas curvas (evocan el hilo de una manilla) con opacidad muy baja, para que el fondo no se vea vacío.
- En móvil se mantienen destellos suaves del mismo fondo para que la pantalla no quede plana.
- Las animaciones del fondo son lentas, usan solo `transform` y `opacity`, y se desactivan con `prefers-reduced-motion`.

### 5.6 Microinteracciones

**Sobrias y funcionales:** duración de 150 a 300 ms, y solo para comunicar estado (foco, carga, éxito, error). El gradiente y el brillo al pasar el cursor del botón primario se reservan para el acceso y el botón principal del hero; en el resto de la app el botón primario es azul sólido.

- **Inputs:** etiqueta flotante, borde que cambia suavemente al enfocar (`focus-visible:ring-2 ring-brand-600`, `transition-all duration-300`), estado de error con mensaje claro bajo el campo.
- **Botón primario:** gradiente de `brand-700` a `brand-500`, brillo que cruza al pasar el cursor (hover shine), estado presionado (`active:scale-[0.98]`), estado deshabilitado y **spinner integrado** mientras carga.
- **Tarjetas de producto:** elevación y leve zoom de imagen al pasar el cursor.
- **Retroalimentación:** toasts y alertas con ícono, texto accesible y duración razonable.

### 5.7 Responsividad (mobile-first)

- **Móvil (< 768px):** una columna. El panel de marca se vuelve un encabezado compacto sobre el formulario. Márgenes seguros `px-4 sm:px-6`. Inputs y botones de **44 a 48 px de alto mínimo**.
- **Tablet (768 a 1024px):** transición fluida a dos columnas bien proporcionadas (`grid-cols-1 md:grid-cols-12`).
- **Escritorio y ultra ancho (> 1024px):** layout dividido a pantalla completa (`min-h-screen`); panel de marca de 50 a 55% a la izquierda y contenido centrado vertical y horizontalmente a la derecha.
- El visor 3D debe tener alternativa estática (foto) en dispositivos lentos o si WebGL falla.

### 5.8 Accesibilidad (WCAG AA)

Contraste según la sección 5.1; `:focus-visible` claro en todo elemento interactivo; navegación completa por teclado; etiquetas y `aria-*` para lectores de pantalla; los errores se anuncian (`role=alert` o `aria-live`); ninguna información depende solo del color; el 3D no es el único medio de ver el producto.

### 5.9 3D a escala real

Las manillas en 3D se ven a su tamaño real y con proporciones normales, nunca gigantes.

- **Unidad de escena:** 1 unidad = 1 mm. El diámetro de cada balín sale del campo de milímetros de la base de datos, no de un valor puesto a mano. Al pasar de #3 a #8 el cliente debe notar la diferencia real y proporcional.
- **Largo de la manilla:** el de un adulto estándar. Como referencia, 16 a 20 cm; la medida exacta se confirma con Rafa. Se muestra enrollada o en vista de muñeca, no como una pieza que llena la pantalla.
- **Encuadre:** la cámara se coloca para que la pieza ocupe como máximo entre 50 y 60% del alto del visor. `OrbitControls` con `minDistance` y `maxDistance` para que no se pueda acercar hasta volverla enorme, rotación suave y sin capturar el scroll de la página en móvil.
- **Contenedor del visor:** de tamaño contenido (relación 1:1 o 4:3, alto máximo de unos 420 px en móvil), nunca a pantalla completa. En el hero, el 3D es parte de la composición, no el fondo entero.
- **Referencia de escala (opcional):** una regla en milímetros o una silueta de muñeca que se active con un botón.
- **Si la presentación tiene foto del catálogo,** la foto manda y el 3D no se muestra.
- **Rendimiento:** modelos ligeros, carga diferida con `React.lazy`, `dpr` limitado a entre 1 y 2, y alternativa estática (foto) si WebGL falla.

## 6. Etapas

### Etapa 0. Auditoría (sin cambios de código)

**Objetivo:** entender el proyecto real antes de tocarlo.

- Revisar rutas, componentes, stores de Zustand, consultas de TanStack Query, migraciones y políticas RLS.
- Listar qué variables de entorno exige Supabase.
- Confirmar cuáles promesas de la sección 2.3 siguen sin cumplirse.

**Entrega:** informe con hallazgos, riesgos (por ejemplo políticas RLS débiles) y ajustes propuestos al orden de las etapas.

### Etapa 1. Sistema de diseño y componentes base

**Objetivo:** que toda pantalla futura herede la identidad visual.

**Regla extra:** todo componente nace minimalista según la sección 5.0. Si un detalle visual no comunica estado ni ayuda a la acción, se elimina.

- Tokens de la sección 5.2 y variables de shadcn alineadas.
- Componentes base: `Button` (con hover shine y spinner), `Input` con etiqueta flotante, `Card` de vidrio, `Badge` de estado, `Alert`, `Dialog`, `Skeleton`.
- Componente `MeshBackground` reutilizable (con versión estática para `prefers-reduced-motion`).
- Página interna de muestras (solo desarrollo) para revisar todos los estados.

**Aceptación:** ningún componente conserva estilo genérico; contraste verificado; todo funciona en 360 px de ancho.

### Etapa 2. Acceso: login, registro y modal de cuenta

**Objetivo:** aplicar de lleno el prompt de diseño a la pantalla de acceso.

- Layout dividido en escritorio con panel de marca (mesh gradient, patrón sutil, mensaje corto y beneficios) y tarjeta de vidrio con el formulario.
- Móvil con encabezado compacto y fondo con destellos.
- Campos de correo y contraseña con ícono, botón para ver la contraseña, errores claros y botón con spinner.
- Cambiar los textos que prometen historial o promociones por lo que realmente existe, hasta que esas funciones se entreguen.

**Aceptación:** accesible por teclado y lector de pantalla; sin saltos de layout; funciona igual en móvil, tablet y escritorio.

### Etapa 3. Tienda pública (pase visual)

**Objetivo:** que catálogo, ficha, galería y carrito se vean al nivel del acceso.

- Inicio: hero 3D sobre fondo de marca, grilla del catálogo con tarjetas de vidrio y precios claros.
- Ficha: presentaciones, stock, selector de hilo y agregar al carrito con retroalimentación visible.
- Galería: carrusel y detalle con el mismo lenguaje visual.
- Carrito (cajón y página): resumen legible y tocable en móvil.
- Alternativa estática del 3D (foto) cuando WebGL no esté disponible.

**Además, en esta etapa:**

- Mostrar las imágenes del catálogo (sección 2.6) en las tarjetas y en la ficha de cada producto.
- Implementar el 3D a escala real según la sección 5.9, en un visor contenido y nunca gigante.
- Separar con claridad las dos partes de la app: layout público para clientes y layout propio para `/admin`.

**Aceptación:** el flujo de compra no cambia; solo mejora su presentación. Lighthouse de accesibilidad sin errores graves.

### Etapa 4. Cobro claro

**Objetivo:** que el cliente sepa exactamente a dónde pagar y cómo retomar su pedido.

- Bloque de instrucciones de pago en el checkout: banco, tipo de cuenta, número, titular y **valor exacto** del pedido, leídos de configuración.
- Referencia del pedido visible **antes** de subir la foto (los primeros 8 caracteres del id), con botón para copiarla, para que la pongan en la transferencia.
- Página o enlace para retomar un pedido en «Esperando comprobante» y subir la foto más tarde.
- Aviso visible de rechazo, con el motivo que escribió Rafa.

**Aceptación:** un cliente puede crear el pedido, cerrar la página, volver y subir el comprobante; si lo rechazan, ve el motivo.

### Etapa 5. Historial del cliente («Mis pedidos»)

**Objetivo:** cumplir la promesa del historial.

- Ruta para el cliente autenticado con sus pedidos, del más reciente al más antiguo.
- Estados en español: esperando comprobante, en revisión, aprobado, rechazado, cancelado (y entregado cuando exista).
- Cada pedido muestra ítems, total, referencia y, si aplica, el motivo del rechazo.
- Sin sesión, el checkout sigue igual. El pedido anónimo no aparece en ningún historial; el teléfono sigue siendo el canal de Rafa.

**Aceptación:** el cliente con cuenta ve el estado de su pedido sin pedirle el pantallazo a Rafa. Las políticas RLS impiden ver pedidos ajenos.

### Etapa 6. Catálogo completo

**Objetivo:** que #6, #7 y #8 estén listos o se muestren honestamente como «por definir».

- Presentaciones, precios y fotos de #6.
- Precio (o «por definir» explícito) y presentaciones de #7 y #8.
- En el admin, editar más que el precio base: descripción, milímetros, foto de portada y cada presentación (nombre, precio, unidad, foto).
- **Revisar la unidad `c/u`:** hoy descuenta stock al aprobar y exige existencias al agregar al carrito. Una manilla armada no debe llevar `c/u` si no es un balín suelto.
- Un tamaño sin precio o sin presentación se muestra «por definir» y **sin botón de compra**.

**Catálogo desde Canva:** completar la tabla de la sección 2.6 con las imágenes y los datos que entregue Martin. Cada presentación lleva su propia imagen.

**Aceptación:** se puede comprar una manilla sin descontar balines sueltos; los tamaños incompletos no se pueden comprar.

### Etapa 7. Stock que no se vende dos veces

**Objetivo:** evitar que dos clientes compren el último balín suelto.

- El kardex ya tiene reserva y liberación, pero el pedido no las usa. Al crear el pedido, **reservar** los balines sueltos. Al aprobar, convertir la reserva en salida. Al rechazar o cancelar, **liberar**.
- Hacerlo de forma atómica en la base (función o transacción en Supabase), no desde el cliente, para evitar condiciones de carrera.
- Definir qué pasa con reservas de pedidos que nunca reciben comprobante (por ejemplo, vencimiento configurable), y confirmarlo con Rafa.

**Aceptación:** un segundo cliente no puede reservar los mismos balines mientras el primero espera revisión; el kardex refleja reservado y disponible correctamente.

### Etapa 8. Gestión de pedidos en el admin

**Objetivo:** que Rafa administre todo el ciclo, no solo los comprobantes.

- Lista de **todos** los pedidos con filtro por estado.
- Cancelar un pedido desde el admin (liberando la reserva).
- Estado «entregado» con fecha, y nota interna (quién lo arma, si ya se entregó).
- Pase visual del panel admin con el mismo sistema de diseño, pensado también para usarse desde el celular.

**Experiencia de Rafa (mobile-first):**

- Pantalla de inicio del admin con lo que requiere acción: pagos por revisar, pedidos por entregar y stock bajo.
- Las tablas se convierten en tarjetas en móvil, y las acciones principales (aprobar, rechazar, entregar) quedan al alcance del pulgar.
- Registrar un pedido manual para ventas por WhatsApp o en persona. Es una propuesta: confirmarla con Rafa antes de construirla.

**Aceptación:** Rafa puede ver, filtrar, cancelar y marcar como entregado cualquier pedido sin tocar la base de datos.

### Etapa 9. Mejoras (solo después de cerrar las etapas 4 a 8)

No están prometidas en la interfaz. Se priorizan con Rafa:

- **Vender mejor:** enlace de WhatsApp con el resumen del pedido (ítems, total y referencia) abierto al teléfono de Rafa; cupón simple (código, porcentaje o valor fijo, vencimiento), que cumple el texto de «promociones»; foto real de cada presentación en la ficha; botón «Quiero una así» desde la galería, si el tamaño tiene precio.
- **Operar el día a día:** aviso a Rafa cuando entra un comprobante (correo o WhatsApp); aviso al cliente cuando el pago se aprueba o rechaza; exportar pedidos del mes en CSV; tope de stock también para manillas armadas; ajuste de inventario con motivo obligatorio.
- **Confianza:** página corta de políticas (oro 18k, tiempos de armado, qué pasa si el comprobante no coincide); reemplazar el README de la plantilla de Vite por uno real, con cómo correr el proyecto y qué variables de Supabase pide.
- **Más adelante:** pasarela de pago (cambia pedidos, comprobantes y kardex); carrito ligado a la cuenta; más colores de hilo o grabado (hoy son negro, rojo y gris fijos en código); medidas distintas a #3 a #8; varios administradores con permisos distintos.

### Etapa 10. Calidad y cierre

- Tests del carrito y del checkout: precio nulo, stock de sueltos, manilla de una sola unidad, color de hilo.
- Pruebas manuales en móvil real, tablet y escritorio.
- Revisión final de accesibilidad y de políticas RLS.
- README actualizado.

## 7. Criterio para dar el proyecto por cerrado

- Se puede comprar un balín suelto #3 con stock, subir el comprobante y ver la salida en el kardex al aprobar.
- Se puede comprar una manilla sin descontar balines sueltos.
- Un segundo cliente no puede reservar los mismos balines sueltos mientras el primero espera revisión.
- El cliente con cuenta ve el estado de su pedido sin pedirle el pantallazo a Rafa.
- \#6, #7 y #8 se ven en la tienda solo cuando tienen precio y presentación, o se muestran como «por definir» sin botón de compra.
- Toda pantalla usa la paleta azul, celeste, blanco y gris, cumple WCAG AA y se ve bien desde 360 px hasta pantallas ultra anchas.

**Criterios adicionales de diseño y alcance:**

- Cliente y administrador funcionan como dos partes separadas: un pedido hecho por la app aparece en el panel de Rafa, y su decisión aparece en el historial del cliente.
- El diseño cumple el mandato minimalista de la sección 5.0 en todas las pantallas, sin excepciones.
- El 3D se ve a escala real, con el diámetro de cada balín tomado de la base de datos, y nunca ocupa la pantalla completa.
- Cada producto del catálogo muestra la imagen del catálogo de Canva, o «por entregar» mientras Martin no la haya subido.
