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
   `SESSION_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
4. Cambia el `Host` de Traefik en `docker-compose.prod.yml` por tu dominio
   (p. ej. `tracker.tu-dominio.es`).
5. Despliega. La migración de Prisma corre sola al arrancar.
6. Cron: la app revisa cada día a las 09:00. Alternativa: crea un cron en Dokploy
   que llame una vez al día a `https://tu-dominio/api/cron` con tu usuario y
   contraseña (`curl -u usuario:contraseña https://tu-dominio/api/cron`).
7. Pulsa "Probar aviso" en el panel para comprobar Telegram.

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
