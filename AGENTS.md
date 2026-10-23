<!-- dokploy-project-context:start -->
## Contexto de despliegue

Lee docs/deployment.md al iniciar trabajo en este repositorio y antes de publicar cambios. Contiene el mapa de ramas y entornos en Dokploy, la configuración Compose y la PostgreSQL externa. Si faltan datos, no los deduzcas de la rama actual.

Respeta el modo SDD efectivo configurado por la skill sdd-mode. Con SDD activado, para cambios relevantes utiliza las skills OpenSpec instaladas y lee openspec/config.yaml. Con SDD desactivado trabaja directamente y conserva este contexto de despliegue. Comprueba el impacto en despliegue y migraciones cuando corresponda. Respeta la autorización de publicación y verifica el destino real de cualquier push.

La configuración verificada de ramas en `docs/deployment.md` prevalece sobre referencias históricas de despliegue en este archivo.
<!-- dokploy-project-context:end -->

@/home/alejandro/.codex/RTK.md

## Contexto de despliegue

Lee `docs/deployment.md` al iniciar trabajo en este repositorio y antes de
publicar cambios. Contiene la configuración de Dokploy, Compose y PostgreSQL.
No deduzcas la rama de despliegue de la rama actual ni del upstream.

Antes de iniciar SDD/OpenSpec consulta:
`python3 /home/alejandro/.codex/skills/sdd-mode/scripts/sdd_mode.py status --project /home/alejandro/Proyectos/web-tracker`.
Respeta el modo efectivo; no inicialices OpenSpec automáticamente si está
desactivado. Mantén el contexto de despliegue en ambos modos.

Comprueba el destino real de cualquier push autorizado y sus efectos de Auto
Deploy. Una implementación local no autoriza publicar. Guarda en documentos
solo nombres de variables y referencias a Bitwarden, nunca secretos.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
