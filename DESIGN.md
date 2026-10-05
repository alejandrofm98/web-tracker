# Design System: Web Tracker (Inventario)

## Theme
Alejandro revisa su cartera desde el portátil por la noche, con poca luz, y desde el móvil entre tareas. Tema oscuro de grafito cálido, tabla compacta y estados legibles. Estrategia restrained: neutros tintados, un acento ámbar para acciones y colores semánticos para estados.

## Colors
Tokens OKLCH definidos en `src/app/globals.css`:
- Base: oklch(0.185 0.006 80)
- Superficie elevada: oklch(0.22 0.006 80)
- Hover: oklch(0.26 0.007 80)
- Borde: oklch(0.34 0.008 80)
- Texto: oklch(0.94 0.008 80)
- Texto secundario: oklch(0.73 0.012 80)
- Acento: oklch(0.82 0.13 80)
- Éxito: oklch(0.79 0.105 150)
- Aviso: oklch(0.8 0.13 80)
- Peligro: oklch(0.68 0.17 25)

Los estados llevan texto además del color. Una fecha de dominio ausente se muestra como «Por completar». Un cobro resuelto nunca se marca atrasado por su fecha anterior.

## Typography
Inter local para títulos, controles, datos y textos. Titular 30px, peso 600; cuerpo 14px; tabla 13px; textos secundarios 12px. No se necesita tipografía display en la interfaz. Fuentes locales, sin descarga externa durante el build.

## Layout
Contenido centrado de hasta 1160px útiles. Cabecera Webs/Cobros y acción Nueva web. Resumen en línea, aviso único de fichas incompletas, filtros y búsqueda antes de la tabla. Columnas: Web, Cliente, Proveedor, Dominio, Cobro, Ficha.

En móvil cada fila se reorganiza en una cuadrícula: nombre y acceso, cliente/proveedor, dominio/cobro. Se conservan todos los datos sin desplazamiento horizontal. Los formularios mantienen sus secciones y las acciones de guardar/cancelar. Login centrado y breve.

## Components
Botones e inputs de radio 6–8px; paneles de 10px. Iconos Lucide. Foco visible en ámbar, estados de carga y errores inline. Filtros conservan la búsqueda. Vacíos con enlace al listado completo o a crear la primera web, según el contexto.

## Motion
Sin animación decorativa. Hover inmediato, foco visible y respeto a prefers-reduced-motion. Elevación por tonos y bordes, sin gradientes ni glassmorphism.
