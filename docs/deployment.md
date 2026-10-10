# Contexto de despliegue

Verificado el 2026-10-10 mediante la sesión del usuario en el panel de Dokploy.
Los valores de secretos se conservan exclusivamente en Bitwarden y Dokploy.

## Destino de producción

- Proyecto / entorno / servicio: Web Tracker / production / Web Tracker.
- Tipo: Docker Compose; proveedor GitHub.
- Repositorio observado en Dokploy: https://github.com/alejandrofm98/web-tracker.
- Remoto local `origin`: https://github.com/alejandrofm98/web-tracker.git.
- Rama configurada en Dokploy: `master`.
- Auto Deploy: habilitado. Publicar en esta rama puede desplegar producción.
- Compose Path observado: `./docker-compose.prod.yml`.
- Contexto de build: raíz del repositorio; `Dockerfile`.
- Disparador: On Push, confirmado en el panel el 2026-10-10. No se mostraban filtros Watch Paths configurados.
- Panel y fuente de la comprobación:
  https://dokploy.walerike.com/dashboard/project/P9P7PVOwXuQr4uyr6Osqr/environment/cjHARvTjCNABF0IV_ov_Y/services/compose/0D2bW9Sd0hDSoq-pM4_27.
- Dominio definido en el Compose local: `web-tracker.walerike.com`.
- Salud pública: `https://web-tracker.walerike.com/api/health`.

## PostgreSQL

- Producción usa el recurso independiente `db` de Dokploy, en el mismo
  proyecto y entorno. Su ciclo de vida no depende del Compose de la app.
- Recurso:
  https://dokploy.walerike.com/dashboard/project/P9P7PVOwXuQr4uyr6Osqr/environment/cjHARvTjCNABF0IV_ov_Y/services/postgres/IYsm7HvRaP8CDDpGlnWP0.
- Variable de conexión de la app: `DATABASE_URL`, configurada en Environment.
- Referencia vigente de secretos: Bitwarden → `Proyectos/Walerike.com` →
  `.ENV | Web Tracker | App | Producción`:
  https://vault.bitwarden.com/#/vault?itemId=f59fb945-58f6-480c-8035-b4df00a5d67c.
- La entrada existente `ACCESO | Web Tracker | PostgreSQL | Por verificar`
  conserva sus credenciales originales; no coincide con el `DATABASE_URL`
  actual. No usarla como credencial confirmada de producción:
  https://vault.bitwarden.com/#/vault?itemId=5946bcf6-e04f-4ca5-89b1-b4c30111f209.
- SSL, política de backups y restauración: pendientes de verificar.
- Desarrollo y pruebas usan PostgreSQL local independiente. No ejecutar
  pruebas, resets ni importaciones de desarrollo sobre producción.

## Configuración y referencias

Variables observadas en Environment de la app: `ADMIN_USER`, `ADMIN_PASSWORD`,
`SESSION_SECRET`, `API_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` y
`DATABASE_URL`. La nota de Bitwarden citada arriba es una copia de estas
variables verificada contra el panel, no la fuente activa del despliegue.

Acceso al panel: Bitwarden → `Proyectos/Walerike.com` →
`ACCESO | Walerike.com | Dokploy`:
https://vault.bitwarden.com/#/vault?itemId=58c7feb9-7e86-4c3d-a865-b37d015b3e65.

El Compose del repositorio expone el servicio en el puerto interno 3002,
publica solo en loopback y usa `dokploy-network` con etiquetas Traefik para
HTTPS. No contiene el servicio PostgreSQL de producción. La configuración
de `docker-compose.yml` corresponde al desarrollo local.

## Migraciones y recuperación

El `Dockerfile` ejecuta `npx prisma migrate deploy` antes de iniciar Next.js.
Las migraciones pendientes se aplican al arrancar una nueva imagen; un
rollback de imagen no revierte la base de datos.

La migración local `20261010120000_add_env_hint` añade `envHint` con valor por
defecto vacío. Es compatible con la versión anterior, que ignora esa columna.
Se ha aplicado a la base local; su aplicación en producción está pendiente
de una publicación y despliegue autorizados. Para recuperar la aplicación,
conservar la columna y volver a una imagen anterior evita perder referencias.
Antes de cambiar el esquema en producción, verificar un backup recuperable.

La migración `20261010140000_notification_settings` crea la tabla independiente
`NotificationSettings` para guardar horario, pausa y antelaciones de avisos.
No modifica ni borra webs. La aplicación usa 09:00 y 30/15/7/1 días cuando aún
no existe una fila de ajustes. Se ha aplicado y probado en PostgreSQL local;
en producción se ejecutará con `prisma migrate deploy` al arrancar la imagen
publicada. No requiere variables nuevas ni cambios en Compose.

Ambas migraciones son aditivas y compatibles con la imagen anterior. Si falla
el despliegue, recuperar la imagen anterior conservando la columna `envHint`
y la tabla `NotificationSettings`; esa versión las ignora. No borrar la tabla
ni la columna durante el rollback, pues perdería los ajustes y referencias
guardados. El rollback de imagen no deshace las migraciones. La política y
recuperabilidad de backups de producción siguen pendientes de verificar.

## Verificación y publicación

- Pruebas: `node --test tests/auth.test.mjs` y
  `npx tsx --test tests/*.test.ts`.
- Build: `npm run build`; tipos: `npx tsc --noEmit`; lint: `npm run lint`.
- Compose: validar con `docker compose -f docker-compose.prod.yml config
  --quiet`, usando valores de prueba; no imprimir el Compose resuelto.
- Antes de un push autorizado: comprobar remoto, refspec y rama destino
  reales. Si afectan a `master`, señalar el impacto en producción.
- Tras desplegar: registrar el commit activo, el resultado del despliegue,
  las migraciones y la salud pública. El commit actualmente desplegado
  sigue pendiente de registrar.
- En esta revisión se han organizado referencias y copias en Bitwarden.
  No se ha publicado código ni modificado la configuración de Dokploy.

<!-- dokploy-verified-context:start -->
## Mapa verificado en Dokploy (2026-10-10)

Panel: https://dokploy.walerike.com/. Fuente: configuración visible del panel, versión v0.29.5.
Esta comprobación identifica destinos y ramas; no acredita el commit activo ni comprueba conexión, migraciones o salud.

| Entorno | Servicio | Rama que despliega | Compose configurado | Auto Deploy |
|---|---|---|---|---|
| production | Web Tracker | `master` | `./docker-compose.prod.yml` | Activado, On Push |

El remoto observado en Dokploy es https://github.com/alejandrofm98/web-tracker. No se mostraban rutas Watch Paths configuradas.
Antes de publicar, comprueba la rama y el remoto destino reales: la rama local actual no determina el despliegue.

- production / Web Tracker: https://dokploy.walerike.com/dashboard/project/P9P7PVOwXuQr4uyr6Osqr/environment/cjHARvTjCNABF0IV_ov_Y/services/compose/0D2bW9Sd0hDSoq-pM4_27

### PostgreSQL y entorno

Los recursos siguientes existen como PostgreSQL independientes de Dokploy, fuera del Compose de la aplicación. La presencia en el mismo entorno no prueba que esta aplicación esté conectada a ellos.
- Recurso del entorno production: db — https://dokploy.walerike.com/dashboard/project/P9P7PVOwXuQr4uyr6Osqr/environment/cjHARvTjCNABF0IV_ov_Y/services/postgres/IYsm7HvRaP8CDDpGlnWP0

Conserva las referencias de conexión y secretos ya documentadas arriba. No se han leído ni copiado valores de Environment del panel en esta revisión.

### Inspección de esta copia local

- `./docker-compose.prod.yml` existe. Servicios locales: `app`.
  Builds: contexto `.`, Dockerfile `Dockerfile`.
  Nombres de variables presentes/referenciados en Compose (sin valores): `ADMIN_PASSWORD`, `ADMIN_USER`, `API_TOKEN`, `DATABASE_URL`, `PORT`, `SESSION_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TZ`.
- Scripts disponibles en package.json: `build`, `dev`, `lint`, `start`. Revisa sus comandos antes de ejecutarlos; no presuponer que `test` sale de modo watch.
- Comprobaciones de aplicación/build: conserva los comandos existentes de AGENTS.md y README; no se han ejecutado como parte de esta configuración documental.
- Verificación Compose previa a publicar: `docker compose -f RUTA_COMPOSE config --quiet` con valores de prueba, sin imprimir configuración resuelta ni usar la BD real.
- Tras un despliegue autorizado: comprobar commit, resultado del despliegue, migraciones aplicables y salud desde el panel; push exitoso no equivale a despliegue verificado.

### Flujo SDD y publicación

Consulta la preferencia global/local de `sdd-mode`. Con modo off trabaja directamente sin inicializar ni ejecutar OpenSpec automáticamente; conserva el mapa de ramas.
No se han publicado commits ni cambiado servicios de Dokploy durante esta configuración.
<!-- dokploy-verified-context:end -->
