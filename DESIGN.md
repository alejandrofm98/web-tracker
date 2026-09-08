# Design System — Web Tracker (Noche editorial)

## Theme
Dark-first editorial. Escena: Alejandro revisa vencimientos en el portatil por la noche entre despliegues, luz baja, como quien lee un periodico: titulares serif grandes, indice numerado, datos mono. Fondo marron oscuro calido, texto crema, un solo acento ambar.

## Colors
Uso OKLCH, neutros tintados hacia marron calido, nunca #000 ni #fff puros.
Estrategia: Restrained (neutros + un acento ambar) + semanticos de estado.

- `--bg`: oklch(0.21 0.02 70) — superficie base
- `--bg-raised`: oklch(0.25 0.022 70) — topbar, paneles, digest
- `--bg-overlay`: oklch(0.29 0.024 70) — hover filas
- `--border`: oklch(0.36 0.03 70) — bordes 1px completos, nunca side-stripe >1px
- `--text`: oklch(0.93 0.012 80)
- `--text-muted`: oklch(0.72 0.025 70)
- `--accent`: oklch(0.80 0.13 75) — ambar. Acciones primarias, kickers, indices. Solo ahi.
- `--danger`: oklch(0.68 0.17 25) — <7 dias / impagado
- `--warning`: oklch(0.80 0.13 80) — <30 dias / pendiente
- `--success`: oklch(0.74 0.13 150) — al dia / cobrado

Sin gradientes decorativos (solo un radial calido estatico en el login). Sin gradient-text. Estado con pildora mono + texto de dias, no solo color.

## Typography
- Display: Fraunces (serif) para titulares de pagina, nombres de web en filas indice y titulos de seccion. Fallback Georgia.
- Cuerpo/UI: Inter, fallback system-ui. Una sola sans para todo lo funcional.
- Datos: JetBrains Mono para pildoras de dias, indices 01/02/03 y cifras de atencion. Fallback ui-monospace.
- Titulares 30-60px serif; cuerpo 14px; tablas 13px. Prosa max 70ch.

## Spacing & Layout
- Topbar fina fija (marca + 2 links + usuario) en vez de sidebar: el producto cabe en 3 vistas.
- Contenido centrado max 960px. Listado como indice editorial numerado, no tabla generica.
- Formularios centrados max 880px, secciones en paneles, barra de acciones fija abajo.
- Ficha en dos columnas: hechos (dl) + acciones/historial.

## Components
- Acciones como iconos (lucide, 15-16px): abrir, cobrar, editar, borrar, salir, probar aviso. Solo el CTA primario lleva texto.
- Pildoras mono de estado: punto + texto ("7d", "cobrado"), fondo tintado.
- Inputs oscuros con foco en acento, selects con flecha propia.
- Empty state que ensena. Toasts via texto inline en botones (probar aviso).

## Motion
- Sin animacion decorativa. Transiciones instantaneas o 150ms en hover. Respeta prefers-reduced-motion.

## Radius & Elevation
- Radius 8px botones/inputs/iconos, 10-12px paneles. Elevacion por tono, no por sombra.
