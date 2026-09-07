# Web Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Panel personal Next.js + Postgres + Telegram que trackea webs, dominios y cobros con login propio y despliegue Dokploy.

**Architecture:** Next.js App Router monolitico, Prisma contra Postgres, cron diario interno + endpoint `/api/cron` con `CRON_SECRET`, avisos via Telegram Bot API fetch directo.

**Tech Stack:** Next.js 14 (App Router, TS), Prisma 5, PostgreSQL 16, node-cron, Docker multi-stage, Dokploy + Traefik.

## Global Constraints

- Solo un usuario admin, sin registro publico. Login con ADMIN_USER / ADMIN_PASSWORD de .env.
- Avisos a 30/15/7/1 dias para dominioExpira y proximoCobro, sin duplicados el mismo dia.
- No guardar passwords de terceros en claro, solo pista de donde estan.
- UI oscuro con caracter segun DESIGN.md (OKLCH, Inter/system, tabla densa, sin cards genericas ni gradientes).
- Despliegue con docker-compose.yml local y docker-compose.prod.yml estilo pistas-deportivas-backend (Traefik + dokploy-network externa).
- Env requeridas: DATABASE_URL, ADMIN_USER, ADMIN_PASSWORD, SESSION_SECRET, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, CRON_SECRET.

---

### Task 1: Scaffold Next.js + Prisma + Docker base

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `prisma/schema.prisma`, `.env.example`, `Dockerfile`, `docker-compose.yml`, `docker-compose.prod.yml`, `.dockerignore`, `src/app/layout.tsx`
- Test: `scripts/smoke.mjs`

**Interfaces:**
- Consumes: nada
- Produces: app Next.js que arranca, Prisma con modelo Website, `DATABASE_URL` funcional

- [ ] **Step 1: Crear app Next.js en la carpeta actual**

Run:
```bash
npx create-next-app@14 --typescript --app --src-dir --import-alias "@/*" --tailwind --eslint --no-git .
```
Expected: package.json con next 14, carpeta src/app existe.
Nota: si create-next-app se queja por directorio no vacio (hay docs/, PRODUCT.md), usar `--use-npm` y aceptar, o scaffoldear en /tmp y copiar. No borrar docs/, PRODUCT.md, DESIGN.md, .git.

- [ ] **Step 2: Instalar deps**

Run:
```bash
npm i prisma @prisma/client node-cron jose && npm i -D @types/node-cron
```
Expected: package.json incluye las deps.

- [ ] **Step 3: Escribir prisma/schema.prisma**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Website {
  id               String   @id @default(cuid())
  name             String
  url              String
  clientName       String   @default("")
  clientContact    String   @default("")
  status           String   @default("activa")
  domainProvider   String   @default("")
  domainExpiresAt  DateTime?
  domainCost       Float?
  domainAutoRenew  Boolean  @default(false)
  hostingProvider  String   @default("")
  hostingPlan      String   @default("")
  ownCost          Float?
  clientPrice      Float?
  billingPeriod    String   @default("anual")
  nextChargeAt     DateTime?
  chargeStatus     String   @default("pendiente")
  stack            String   @default("")
  repoUrl          String   @default("")
  credentialsHint  String   @default("")
  notes            String   @default("")
  lastNotifiedAt   DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

- [ ] **Step 4: Escribir .env.example**

```
DATABASE_URL=postgresql://tracker:tracker@db:5432/tracker?schema=public
ADMIN_USER=admin
ADMIN_PASSWORD=cambia-esto
SESSION_SECRET=cambia-esto-32-chars-minimo
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
CRON_SECRET=cambia-esto
```

- [ ] **Step 5: Escribir Dockerfile multi-stage**

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
```

- [ ] **Step 6: Escribir docker-compose.yml**

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    env_file: .env
    environment:
      POSTGRES_DB: tracker
      POSTGRES_USER: tracker
      POSTGRES_PASSWORD: tracker
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U tracker -d tracker"]
      interval: 5s
      timeout: 5s
      retries: 5

  app:
    build: .
    restart: unless-stopped
    env_file: .env
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://tracker:tracker@db:5432/tracker?schema=public
    depends_on:
      db:
        condition: service_healthy

volumes:
  postgres_data:
```

- [ ] **Step 7: Escribir docker-compose.prod.yml (patron pistas-deportivas)**

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    expose:
      - "3000"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.webtracker.rule=Host(`tracker.TU-DOMINIO.es`)"
      - "traefik.http.routers.webtracker.entrypoints=websecure"
      - "traefik.http.routers.webtracker.tls.certresolver=letsencrypt"
      - "traefik.http.services.webtracker.loadbalancer.server.port=3000"
    env_file: .env
    environment:
      - DATABASE_URL
      - ADMIN_USER
      - ADMIN_PASSWORD
      - SESSION_SECRET
      - TELEGRAM_BOT_TOKEN
      - TELEGRAM_CHAT_ID
      - CRON_SECRET
    networks:
      - default
      - dokploy-network

networks:
  default: {}
  dokploy-network:
    external: true
```

- [ ] **Step 8: Smoke test local**

Run:
```bash
cp -n .env.example .env || true
npx prisma validate
npm run build
```
Expected: build OK.

- [ ] **Step 9: Commit**

```bash
git add package.json prisma Dockerfile docker-compose.yml docker-compose.prod.yml .env.example src
git commit -m "feat: scaffold next + prisma + docker"
```

### Task 2: Auth login user/pass con sesion

**Files:**
- Create: `src/lib/auth.ts`, `src/app/login/page.tsx`, `src/middleware.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`
- Test: `tests/auth.test.mjs` (node:test, verifica firma/verificacion JWT con jose y comparacion user/pass)

**Interfaces:**
- Consumes: ADMIN_USER, ADMIN_PASSWORD, SESSION_SECRET de env
- Produces: `signSession(user)`, `verifySession(token)`, cookie `wt_session`, middleware que redirige a /login

- [ ] **Step 1: Write the failing test**

```js
// tests/auth.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { SignJWT, jwtVerify } from "jose";
test("session roundtrip", async () => {
  const secret = new TextEncoder().encode("test-secret-32-chars-minimo-123456");
  const jwt = await new SignJWT({ u: "admin" }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret);
  const { payload } = await jwtVerify(jwt, secret);
  assert.equal(payload.u, "admin");
});
```

- [ ] **Step 2: Run test to verify it fails (falta dep o test mal)**

Run: `node --test tests/auth.test.mjs`
Expected: PASS si jose instalado (es test de contrato, sirve como base). Si FAIL por import, instalar jose.

- [ ] **Step 3: Write minimal implementation `src/lib/auth.ts`**

```ts
import { SignJWT, jwtVerify } from "jose";
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET!);
export async function signSession(user: string) {
  return await new SignJWT({ u: user }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret());
}
export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, secret());
  return payload.u as string;
}
export function checkCredentials(user: string, pass: string) {
  return user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASSWORD;
}
```

- [ ] **Step 4: API login/logout + middleware + pagina login oscuro segun DESIGN.md**

`src/app/api/auth/login/route.ts`: lee {user, pass}, checkCredentials, firma, set cookie httpOnly secure en prod, 401 si falla.
`src/middleware.ts`: si no hay cookie valida y la ruta no es /login ni /api/auth/*, redirect a /login.
`src/app/login/page.tsx`: formulario simple dark, sin librerias UI pesadas, usa variables de DESIGN.md.

- [ ] **Step 5: Verificar manual**

Run: `npm run dev`, abrir http://localhost:3000, debe redirigir a /login, login con .env funciona.
Expected: redirect OK, cookie wt_session presente.

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth.ts src/app/login src/middleware.ts src/app/api/auth tests/auth.test.mjs
git commit -m "feat: auth login user/pass con sesion"
```

### Task 3: CRUD webs + listado semaforo

**Files:**
- Create: `src/lib/db.ts`, `src/lib/dates.ts`, `src/app/page.tsx`, `src/app/webs/[id]/page.tsx`, `src/app/webs/nueva/page.tsx`, `src/app/api/webs/route.ts`, `src/app/api/webs/[id]/route.ts`
- Test: `tests/dates.test.mjs`

**Interfaces:**
- Consumes: Prisma Website, verifySession
- Produces: `daysUntil(date)`, `statusFor(days)` -> "ok" | "warn" | "crit", CRUD API

- [ ] **Step 1: Write the failing test**

```js
// tests/dates.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { daysUntil, statusFor } from "../src/lib/dates.mjs";
test("status thresholds", () => {
  assert.equal(statusFor(40), "ok");
  assert.equal(statusFor(20), "warn");
  assert.equal(statusFor(5), "crit");
});
```

Nota: implementar `src/lib/dates.ts` y re-export mjs o duplicar logica minima para test node. Lo mas simple: `src/lib/dates.ts` puro TS sin deps, test importa via tsx o copia. Alternativa aceptada: test en vitest si se instala. Minimo: test manual de funcion pura.

- [ ] **Step 2: Run test**

Run: `node --test tests/dates.test.mjs`
Expected: FAIL hasta crear el modulo (ajustar import a build JS o usar tsx).

- [ ] **Step 3: Implementar `src/lib/dates.ts`**

```ts
export function daysUntil(d: Date | string | null): number | null {
  if (!d) return null;
  const t = new Date(d).getTime();
  return Math.ceil((t - Date.now()) / 86400000);
}
export function statusFor(days: number | null): "ok" | "warn" | "crit" {
  if (days === null) return "ok";
  if (days < 7) return "crit";
  if (days < 30) return "warn";
  return "ok";
}
```

- [ ] **Step 4: CRUD + paginas con tabla densa oscura (impeccable product)**

API con Prisma, validacion minima (name y url requeridos). Paginas: `/` tabla con columnas estado/nombre/cliente/dominio/cobro/acciones, filtros ?f=expiring|charges, buscador ?q=. Detalle y nueva/editar con formulario completo del spec. Empty state que ensena. Sin cards genericas.

- [ ] **Step 5: Verificar**

Run: `npx prisma migrate dev --name init`, `npm run dev`, crear 2 webs de prueba, comprobar semaforos.
Expected: CRUD funciona, filtros funcionan.

- [ ] **Step 6: Commit**

```bash
git add src/lib/dates.ts src/lib/db.ts src/app/page.tsx src/app/webs src/app/api/webs tests/dates.test.mjs prisma
git commit -m "feat: crud webs con semaforo"
```

### Task 4: Cron diario + Telegram 30/15/7/1

**Files:**
- Create: `src/lib/telegram.ts`, `src/lib/notify.ts`, `src/app/api/cron/route.ts`, `src/instrumentation.ts`
- Test: `tests/notify.test.mjs`

**Interfaces:**
- Consumes: Website[], daysUntil
- Produces: `dueIn(days, targets=[30,15,7,1])`, `sendTelegram(text)`, GET /api/cron

- [ ] **Step 1: Write the failing test**

```js
// tests/notify.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { dueIn } from "../src/lib/notify.mjs";
test("due matches targets", () => {
  assert.equal(dueIn(30), true);
  assert.equal(dueIn(15), true);
  assert.equal(dueIn(29), false);
});
```

- [ ] **Step 2: Run test**

Run: `node --test tests/notify.test.mjs`
Expected: FAIL hasta implementar.

- [ ] **Step 3: Implementar**

```ts
// src/lib/notify.ts
export const TARGETS = [30, 15, 7, 1];
export function dueIn(days: number | null, targets = TARGETS) {
  return days !== null && targets.includes(days);
}
```

```ts
// src/lib/telegram.ts
export async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const chat = process.env.TELEGRAM_CHAT_ID!;
  if (!token || !chat) { console.warn("telegram no configurado"); return; }
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML" }),
  });
}
```

`/api/cron`: exige `?secret=CRON_SECRET` o header, busca webs con domainExpiresAt / nextChargeAt en TARGETS, manda mensajes, actualiza lastNotifiedAt para no duplicar el mismo dia. Incluye boton en UI que hace fetch a /api/cron para "probar aviso".

`instrumentation.ts`: registra node-cron diario 09:00 que llama a la misma logica.

- [ ] **Step 4: Verificar**

Run: configurar .env con bot real de prueba, `curl "http://localhost:3000/api/cron?secret=..."`, comprobar mensaje en Telegram.
Expected: mensaje recibido.

- [ ] **Step 5: Commit**

```bash
git add src/lib/telegram.ts src/lib/notify.ts src/app/api/cron src/instrumentation.ts tests/notify.test.mjs
git commit -m "feat: cron + avisos telegram 30/15/7/1"
```

### Task 5: Polish impeccable + deploy Dokploy

**Files:**
- Modify: `src/app/globals.css` (tokens DESIGN.md), `src/app/layout.tsx`, README deploy
- Create: `README.md` (seccion deploy)

**Interfaces:**
- Consumes: PRODUCT.md, DESIGN.md
- Produces: UI pulida dark, README con pasos Dokploy

- [ ] **Step 1: Aplicar tokens DESIGN.md en globals.css (OKLCH, Inter, tabla densa, foco visible, skeletons, responsive)**

- [ ] **Step 2: Pasar checklist impeccable: sin side-stripe >1px, sin gradient-text, sin glass, sin cards identicas, sin modal como primer recurso, copy sin em dashes, test de slop categoria**

- [ ] **Step 3: Build prod + compose**

Run:
```bash
npm run build
docker compose build
docker compose up -d db
npx prisma migrate deploy
```
Expected: app en http://localhost:3000 tras login.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css README.md
git commit -m "polish: tema oscuro impeccable + docs deploy"
```
