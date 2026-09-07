# Web Tracker

Panel personal para trackear webs, caducidad de dominios y cobros de hosting, con avisos en Telegram.

## Configuración

1. Copia `.env.example` a `.env` y rellena:
   - `ADMIN_USER` / `ADMIN_PASSWORD`: tu acceso (sin registro público).
   - `SESSION_SECRET`: cadena larga aleatoria.
   - `TELEGRAM_BOT_TOKEN`: token de @BotFather.
   - `TELEGRAM_CHAT_ID`: tu chat id (habla con @userinfobot para verlo).
   - `CRON_SECRET`: protege `/api/cron`.
2. Los avisos saltan a 30 / 15 / 7 / 1 días antes de `dominioExpira` y `proximoCobro`.

## Desarrollo local

```bash
docker compose up -d db
DATABASE_URL=postgresql://tracker:tracker@localhost:5434/tracker?schema=public npx prisma migrate dev
npm run dev
```

App en http://localhost:3000 (login con tu `.env`).

## Docker local (modo prod)

```bash
docker compose up -d --build
```

## Despliegue en Dokploy

1. Crea una Postgres en Dokploy y copia su `DATABASE_URL` interna.
2. Crea la app desde este repo con el fichero `docker-compose.prod.yml`.
3. Variables de entorno en Dokploy: `DATABASE_URL`, `ADMIN_USER`, `ADMIN_PASSWORD`,
   `SESSION_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `CRON_SECRET`.
4. Cambia el `Host` de Traefik en `docker-compose.prod.yml` por tu dominio
   (p. ej. `tracker.tu-dominio.es`).
5. Despliega. La migración de Prisma corre sola al arrancar.
6. Cron: la app revisa cada día a las 09:00. Alternativa: crea un cron en Dokploy
   que llame a `https://tu-dominio/api/cron?secret=TU-CRON-SECRET` una vez al día.
7. Pulsa "Probar aviso" en el panel para comprobar Telegram.

## Tests

```bash
node --test tests/auth.test.mjs
npx tsx --test tests/dates.test.ts tests/notify.test.ts
```
