# Design System — Web Tracker

## Theme
Dark-first functional. Escena: Alejandro revisa vencimientos en el portatil por la noche entre despliegues, luz baja, quiere escanear rapido sin fatiga. Fondo oscuro neutro tintado, texto alto contraste, un solo acento para accion y alertas semanticas separadas.

## Colors
Uso OKLCH, neutros tintados hacia azul frio (chroma 0.008), nunca #000 ni #fff puros.
Estrategia: Restrained (neutros + un acento <=10%) + semanticos de estado.

- `--bg`: oklch(0.21 0.008 260) — superficie base
- `--bg-raised`: oklch(0.25 0.009 260) — sidebar, toolbar
- `--bg-overlay`: oklch(0.28 0.01 260) — dropdowns, modales
- `--border`: oklch(0.34 0.008 260) — bordes 1px completos, nunca side-stripe >1px
- `--text`: oklch(0.93 0.005 260)
- `--text-muted`: oklch(0.70 0.008 260)
- `--accent`: oklch(0.72 0.14 230) — acciones primarias, seleccion actual. Solo ahi.
- `--danger`: oklch(0.65 0.18 25) — <7 dias / impagado
- `--warning`: oklch(0.78 0.14 80) — <30 dias / pendiente
- `--success`: oklch(0.75 0.15 150) — al dia / cobrado
- `--info`: oklch(0.72 0.12 250)

Sin gradientes decorativos. Sin gradient-text. Estado con punto + texto de dias, no solo color.

## Typography
- Familia: Inter, fallback `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`. Una sola familia para todo, sin display font en labels/botones/datos.
- Escala fija rem, ratio 1.125–1.2: 12 / 14 / 16 / 20 / 24. H1 24 en listado, nada fluido con clamp.
- Cuerpo 14px, tablas densas 13px. Prosa (notas) max 70ch. Tablas pueden llegar a 120ch+.
- Jerarquia por peso + escala, no por color.

## Spacing & Layout
- App shell: sidebar izquierda (nav: Webs, Avisos, Ajustes) + topbar con buscador + contenido. Sidebar colapsable en movil.
- Listado como tabla densa, no grid de cards identicas. Fila = web con columnas: estado, nombre/url, cliente, dominio (dias), cobro (dias), acciones.
- Ritmo variado: 8 / 12 / 16 / 24, no mismo padding en todo.
- Sin cards anidadas. La mayoria de bloques sin contenedor innecesario.

## Components
- Botones: primario (accent), secundario (borde 1px), danger. Estados: default, hover, focus visible, active, disabled, loading (skeleton, no spinner central).
- Inputs: fondo raised, borde 1px, foco con anillo accent 2px. Error con mensaje + borde danger.
- Tabla: header sticky, zebra sutil, fila hover, skeleton rows al cargar.
- Empty state que ensena: "Anade tu primera web" + CTA, no "nada aqui".
- Badges de estado: punto + texto ("7d", "cobrado"), fondo tintado 12%.
- Toasts para confirmar crear/cobrar/probar Telegram.

## Motion
- 150–200ms, ease-out-quart/quint. Solo para cambio de estado, feedback, reveal. Nada de secuencias de carga orquestadas. Respeta prefers-reduced-motion. Nunca animar layout properties.

## Radius & Elevation
- Radius 8px botones/inputs, 10px paneles. Sombras minimas en oscuro (elevacion por tono, no por sombra).
