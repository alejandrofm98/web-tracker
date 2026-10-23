# Design

## Context

Auditoría npm actual y boletín Node del 21 de octubre: 22.23.4 corrige vulnerabilidades del runtime. El runtime realmente desplegado sigue pendiente de comprobar en Dokploy.

## Goals / Non-Goals

Corregir vulnerabilidades de runtime y conservar comportamiento. La actualización de Next requiere cambios de compatibilidad del código. No cambiar el esquema de PostgreSQL ni operar sus datos.

## Decisions

Actualizar dentro del major cuando haya parche. No usar npm audit fix --force ni bajar versiones para silenciar avisos. Mantener Angular core/compiler/CLI/build coherentes. Fijar imagen Node 22.23.4 con la misma distribución. Conservar cambios ajenos.

Para `web-tracker`, el registro npm no publica una versión estable de Next 14 posterior a 14.2.35, y el aviso crítico GHSA-2464-fhr4-w9xw afecta esa versión. El fix sugerido por npm es Next 16.4.2, así que esta corrección cruza el major. Migrar las APIs de request síncronas a promesas, renombrar la convención middleware a `proxy` y reemplazar el comando eliminado `next lint` por ESLint CLI con configuración flat. Actualizar React/React DOM a 19.3.1 y sus tipos a 19.3.0 para la compatibilidad recomendada por Next 16 y evitar la deprecación explícita de React 18. Conservar contratos de auth, cron, Prisma y rutas, y no modificar el esquema ni crear migraciones.

La imagen de runtime copia `node_modules` del build y ejecuta `npm prune --omit=dev` antes de arrancar. Prisma y `@prisma/client` permanecen en `dependencies`, por lo que la CLI de migración y el cliente generado siguen disponibles en runtime; herramientas de lint, tipos y pruebas no se empaquetan.

Tras los arreglos del lockfile, `npm audit` aún reporta 7 altas y 2 moderadas en herramientas de desarrollo transitivas de Tailwind/ESLint (`braces` y `postcss-selector-parser`). `npm audit --omit=dev` da cero vulnerabilidades; Docker elimina dependencias de desarrollo de la imagen final con `npm prune --omit=dev`. El registro no ofrece un `braces` 3.x corregido; npm propone Tailwind 4, un cambio major que queda fuera de este alcance. El advisory crítico de optimización de imágenes reporta una condición glibc que no está confirmada para la imagen Alpine/musl de Web Tracker; el repositorio no usa `next/image` ni configura `dangerouslyAllowSVG`. El audit de dependencias no demuestra que una ruta vulnerable sea alcanzable.

## Risks / Trade-offs

Una auditoría de manifiestos no demuestra explotación ni equivale a escaneo de imagen. Los servidores npm globales del Dockerfile quedan fuera del lockfile. Builds o tests que necesiten DB deben usar únicamente recursos locales verificados.

## Migration Plan

No se añade ninguna migración de datos. Dokploy ya muestra desplegado el commit base `8a47981`, que contiene las dos migraciones existentes; el cambio de seguridad no modifica sus archivos. Docker ejecuta `prisma migrate deploy` al arrancar, por lo que el despliegue volverá a comprobarlas. La base PostgreSQL es independiente y no se ha accedido ni modificado. Dokploy muestra que no hay backups configurados para este recurso; por eso esta publicación no introduce cambios de esquema. Si alguna migración antigua estuviera pendiente, la recuperación de imagen no la revierte y no hay backup configurado para restaurarla.
