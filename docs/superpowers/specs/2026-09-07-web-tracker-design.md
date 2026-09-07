# Web Tracker — Design Doc
Fecha: 2026-09-07
Estado: Aprobado por usuario

## 1. Objetivo
Panel web personal (un solo usuario) para llevar el tracking de las páginas que gestiona:
cuándo caduca el dominio, cuándo toca cobrar el hosting al cliente, características de cada web,
con avisos automáticos por Telegram.

No es multi-cliente. Solo acceso admin.

## 2. Arquitectura
- Next.js App Router (TypeScript) + Prisma ORM + PostgreSQL 16
- Todo en un solo proyecto / una sola app Docker
- Cron interno diario 09:00 (node-cron o similar)  + endpoint `/api/cron` protegido con tu usuario y contraseña (Basic Auth) o sesion
  para usar el cron de Dokploy como alternativa
- Avisos via Telegram Bot API (fetch directo, sin dependencias pesadas)
- Auth propia simple: `ADMIN_USER` / `ADMIN_PASSWORD` en .env, sesión en cookie httpOnly,
  middleware protege todas las rutas excepto `/login`

### Por qué Postgres y no SQLite
Despliegue en VPS con Dokploy en producción e internet. El usuario ya trabaja con
Postgres + Dokploy. Evita problemas de volúmenes con ficheros .db en redeploys y permite
queries de fechas fiables para los avisos 30/15/7/1.

## 3. Modelo de datos (tabla `Website`)
- Básicos: nombre, url, cliente, email/tel cliente, estado (activa / pendiente / baja)
- Dominio: proveedor, fecha caducidad, coste renovación, auto-renovación (bool)
- Hosting/cobros: proveedor hosting, plan, coste propio, importe que cobra al cliente,
  periodicidad (mensual/anual), fecha próximo cobro, estado cobro (pendiente/cobrado)
- Técnico: stack, repo url, notas libres, pista de dónde están credenciales
  (no guardar passwords en claro)

## 4. Pantallas / Funcionalidad
- `/login` — formulario user/pass
- `/` — listado con semáforo (rojo <7 días, naranja <30), buscador, filtros:
  próximos a caducar, cobros pendientes
- `/webs/[id]` — ficha detalle
- Crear / editar / dar de baja
- Botón "probar aviso Telegram"
- API REST interna: CRUD webs + `/api/cron`

## 5. Telegram
- Bot creado con @BotFather. Env vars: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- Reglas: avisar si `dominioExpira` o `proximoCobro` cae en 30 / 15 / 7 / 1 días
- Formato: "⚠️ midominio.com caduca en 7 días (12/09/2026)" /
  "💰 Cobro hosting cliente X - 50€ el 15/09"
- Sin duplicados el mismo día (tabla o campo `lastNotified`)
- Resumen opcional futuro (fuera de alcance v1)

## 6. Despliegue (patrón pistas-deportivas-backend)
- `Dockerfile` multi-stage Node
- `docker-compose.yml` local: app + postgres:16-alpine + volúmenes
- `docker-compose.prod.yml`: solo app, labels Traefik, red externa `dokploy-network`,
  `DATABASE_URL` viene de la Postgres de Dokploy
- `.env.example` con: DATABASE_URL, ADMIN_USER, ADMIN_PASSWORD, SESSION_SECRET,
  TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
- HTTPS vía Traefik + letsencrypt (lo pone Dokploy)

## 7. Seguridad
- Todo tras login. Sin registro público
- Password admin en .env (idealmente hash, mínimo env)
- Cookie httpOnly, secure en prod
- `/api/cron` exige tu usuario y contraseña (Basic Auth) si se llama desde fuera

## 8. Fuera de alcance v1 (YAGNI)
- Acceso para clientes, multi-usuario, roles
- Renovación automática de dominios, pagos online
- Guardar credenciales de terceros en la app
- Resúmenes semanales, gráficos avanzados

## 9. Plan siguiente
Scaffold Next.js + Prisma + Docker + login + CRUD + cron Telegram, según implementation plan.
