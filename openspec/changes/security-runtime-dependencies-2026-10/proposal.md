# Proposal

## Why

La auditoría del 2026-10-23 detecta dependencias con avisos publicados y runtimes Docker sin parche mínimo verificable. Se actualizan los runtimes y dependencias vulnerables, adaptando Web Tracker a Next 16 para disponer de una versión corregida.

## What Changes

Actualizar dependencias afectadas y lockfile con versiones compatibles; fijar Node 22.23.4 en imágenes Node. Mantener los contratos existentes y documentar limitaciones de verificación.

## Capabilities

Sin cambios funcionales intencionados; skip_specs: true por mantenimiento de dependencias.

## Impact

package.json, package-lock.json, Dockerfiles y compatibilidad de código con Next 16. Sin cambios de esquema PostgreSQL, variables ni topología Compose. La rama y Auto Deploy constan en docs/deployment.md. El usuario autorizó publicación secuencial; cada despliegue se comprueba antes de continuar.
