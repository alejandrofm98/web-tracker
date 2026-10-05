# Web Tracker

Panel personal para trackear webs, caducidad de dominios y cobros de hosting, con avisos en Telegram.

## Configuración

1. Copia `.env.example` a `.env` y rellena:
   - `ADMIN_USER` / `ADMIN_PASSWORD`: tu acceso (sin registro público).
   `SESSION_SECRET`: cadena larga aleatoria.
   - `TELEGRAM_BOT_TOKEN`: token de @BotFather.
   - `TELEGRAM_CHAT_ID`: tu chat id (escríbele "hola" al bot y mira los
     mensajes con `https://api.telegram.org/botTU-TOKEN/getUpdates`).
2. Los avisos saltan a 30 / 15 / 7 / 1 días antes de `dominioExpira` y `proximoCobro`.

## Desarrollo local

```bash
docker compose up -d db
DATABASE_URL=postgresql://tracker:tracker@localhost:5438/tracker?schema=public npx prisma migrate dev
npm run dev
```

App en http://localhost:3002 (login con tu `.env`).

El servidor de desarrollo escucha en 3002. Para que acceda a Postgres desde
fuera de Docker, configura también el `DATABASE_URL` de `.env` con
`localhost:5438` (el contenedor de la app usa `db:5432`).

## Docker local (modo prod)

```bash
docker compose up -d --build
```

## Despliegue en Dokploy

1. El Compose de producción incluye Postgres con un volumen persistente
   `postgres_data`. Configura `POSTGRES_PASSWORD` con una contraseña aleatoria
   (por ejemplo, `openssl rand -hex 32`) y `DATABASE_URL` como
   `postgresql://tracker:TU_PASSWORD@db:5432/tracker?schema=public`. Usa la misma
   contraseña en ambas variables; si contiene caracteres especiales, debes
   codificarlos para la URL. Dentro de Docker se usa `db:5432`; desde el servidor
   se usa `127.0.0.1:5438`.
2. Crea un servicio **Docker Compose** desde este repositorio (no Docker Stack)
   y selecciona **`docker-compose.prod.yml`** como Compose Path. El fichero
   `docker-compose.yml` es solo para desarrollo local y no configura Traefik.
3. Define en Environment de Dokploy `DATABASE_URL`, `ADMIN_USER`,
   `ADMIN_PASSWORD`, `SESSION_SECRET`, `API_TOKEN` y `POSTGRES_PASSWORD`. Las seis son obligatorias.
   Usa secretos aleatorios diferentes para sesión y API; puedes generar cada
   uno con `openssl rand -hex 32`. Telegram es opcional: `TELEGRAM_BOT_TOKEN`
   y `TELEGRAM_CHAT_ID`.
4. Este Compose gestiona el dominio con etiquetas Traefik: HTTP redirige a
   HTTPS, el servicio `app` escucha en el puerto interno `3002` y utiliza
   `dokploy-network`. No añadas además ese mismo dominio en la pestaña Domains
   de Dokploy: utiliza una sola configuración de routing. Si prefieres Domains,
   elimina primero el bloque `labels` y configura host
   `web-tracker.walerike.com`, servicio `app`, puerto `3002`, path `/` y HTTPS.
5. El DNS de `web-tracker.walerike.com` debe apuntar al servidor de Dokploy.
   Las etiquetas asumen los entrypoints estándar `web` / `websecure` y el
   resolver `letsencrypt`. Si tu Traefik usa otros nombres, adapta las etiquetas.
6. El frontend se publica en `127.0.0.1:3002` y la base en
   `127.0.0.1:5438`, sin exponer Postgres a internet. Traefik accede al frontend
   por la red Docker. Despliega. Prisma aplica las migraciones pendientes al arrancar. La app
   estará saludable cuando `/api/health` devuelva `200 {"status":"ok"}`;
   devuelve 503 si no puede conectar con Postgres.
7. Comprueba `/login`, inicia sesión y revisa `/api/webs` con tu token. Sin
   credenciales `/api/webs` debe devolver 401, no 404.
8. El cron diario corre a las 09:00 de Europe/Madrid. Alternativamente puedes
   configurar un cron que llame a `/api/cron` usando Bearer o Basic Auth.
   Esa llamada puede enviar avisos a Telegram.

Las fuentes están incluidas en `src/app/fonts` con sus licencias OFL. El build
no necesita descargar fuentes de Google.

En Oracle Cloud, mantén permitidos TCP 80 y 443 para Traefik. No necesitas
reglas públicas para 3002 ni 5438: ambos se publican solo en loopback.

### Diagnóstico del 404

Un `404 page not found` de texto plano, tanto en `/login` como en `/api/webs`,
indica probablemente un routing ausente en el proxy. No basta para confirmar
la causa sin revisar el servidor. Comprueba:

- Compose Path: debe ser `docker-compose.prod.yml`.
- Logs de despliegue: build, migraciones y arranque de Next.js deben terminar
  correctamente. Un fallo de Postgres impide que la aplicación arranque.
- Preview Compose: las etiquetas `webtracker` y la red `dokploy-network`
  deben aparecer en `app`; el puerto del servicio Traefik debe ser 3002.
- Logs de Traefik: routers duplicados, resolver inexistente o red incorrecta.
- DNS: el dominio debe llegar a la instancia correcta de Dokploy.

Comprobaciones desde el servidor (usa el nombre real del contenedor):

```bash
docker logs NOMBRE_CONTENEDOR --tail 100
docker inspect NOMBRE_CONTENEDOR --format '{{json .State.Health}}'
docker inspect NOMBRE_CONTENEDOR --format '{{json .Config.Labels}}'
curl -i https://web-tracker.walerike.com/api/health
curl -i https://web-tracker.walerike.com/api/webs
```

### Datos locales y producción

Las migraciones crean el esquema, no copian los registros locales. Las fechas
corregidas y los dominios añadidos en local solo estarán en producción si se
transfieren a la Postgres del despliegue. Para una base nueva, puedes exportar con
`docker compose exec -T db pg_dump -U tracker -d tracker --data-only --column-inserts --table='"Website"' > websites.sql` e importar con `psql` en la
base de destino. No importes ese fichero sobre una base que ya contiene esos
registros sin comprobar duplicados. El volcado contiene los datos privados del
tracker: no lo subas al repositorio.

## Uso por agentes IA (API con token)

Define `API_TOKEN` en el `.env` (cadena larga aleatoria) y llama con
`Authorization: Bearer TU-TOKEN`. Sin token devuelve 401.

```bash
BASE=https://web-tracker.walerike.com
H="Authorization: Bearer TU-TOKEN"

# Listar (filtros: ?q=texto, ?f=expiring|charges|bajas|todas)
curl -H "$H" $BASE/api/webs

# Crear (solo nombre y url obligatorios, resto opcional)
curl -X POST -H "$H" -H "content-type: application/json" $BASE/api/webs -d '{
  "name": "Mi Web", "url": "https://miweb.es",
  "clientName": "Cliente", "domainProvider": "DonDominio",
  "domainExpiresAt": "2027-01-15", "domainCost": 12,
  "hostingProvider": "VPS", "clientPrice": 120,
  "billingPeriod": "anual", "nextChargeAt": "2027-01-15",
  "chargeStatus": "pendiente", "stack": "Next.js", "notes": "..."
}'

# Ver una, actualizar, marcar cobrado, borrar
curl -H "$H" $BASE/api/webs/ID
curl -X PUT -H "$H" -H "content-type: application/json" $BASE/api/webs/ID \
  -d '{"chargeStatus": "cobrado"}'
curl -X DELETE -H "$H" $BASE/api/webs/ID

# Disparar revisión de avisos (también vale Basic Auth del login)
curl -H "$H" $BASE/api/cron
```

## Tests

```bash
node --test tests/auth.test.mjs
npx tsx --test tests/dates.test.ts tests/notify.test.ts
```
