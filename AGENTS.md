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
