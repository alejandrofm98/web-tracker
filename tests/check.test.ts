import test from "node:test";
import assert from "node:assert/strict";
import { checkExpirations } from "../src/lib/check";
import { prisma } from "../src/lib/db";
import { DEFAULT_NOTIFICATIONS } from "../src/lib/notification-settings";

const originalFetch = globalThis.fetch;
const originalToken = process.env.TELEGRAM_BOT_TOKEN;
const originalChat = process.env.TELEGRAM_CHAT_ID;
const now = new Date("2026-10-10T07:00:00Z");
const web = { id: "test", name: "Web <Ana>", url: "https://example.es", clientName: "Ana & Luis", clientPrice: 50, billingPeriod: "anual", chargeStatus: "pendiente", domainExpiresAt: new Date("2026-10-10"), nextChargeAt: new Date("2026-10-17"), lastNotifiedAt: null };
let records: Record<string, unknown>[] = [];
let updates = 0;
let messages: string[] = [];

prisma.$use(async (params) => {
  if (params.model === "Website" && params.action === "findMany") return records;
  if (params.model === "Website" && params.action === "update") { updates++; return {}; }
  throw new Error("Consulta inesperada en la prueba");
});

test.beforeEach(() => {
  records = [web]; updates = 0; messages = [];
  process.env.TELEGRAM_BOT_TOKEN = "test-token";
  process.env.TELEGRAM_CHAT_ID = "test-chat";
  globalThis.fetch = async (_url, init) => {
    messages.push(JSON.parse(init!.body as string).text);
    return Response.json({ ok: true });
  };
});
test.afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
  else process.env.TELEGRAM_BOT_TOKEN = originalToken;
  if (originalChat === undefined) delete process.env.TELEGRAM_CHAT_ID;
  else process.env.TELEGRAM_CHAT_ID = originalChat;
});

test("usa antelaciones independientes y el día del vencimiento", async () => {
  const result = await checkExpirations(now, { ...DEFAULT_NOTIFICATIONS, domainDays: [0], chargeDays: [7] });
  assert.equal(result.notified, 1);
  assert.equal(messages.length, 1);
  assert.match(messages[0], /dominio caduca <b>hoy/);
  assert.match(messages[0], /cuota anual/);
  assert.match(messages[0], /50 € · dominio y hosting/);
  assert.match(messages[0], /Ana &amp; Luis/);
  assert.equal(updates, 1);
});

test("pausar o desactivar cobros evita mensajes", async () => {
  assert.equal((await checkExpirations(now, { ...DEFAULT_NOTIFICATIONS, enabled: false })).skippedDisabled, true);
  await checkExpirations(now, { ...DEFAULT_NOTIFICATIONS, chargeEnabled: false });
  assert.equal(messages.length, 0);
  assert.equal(updates, 0);
});

test("no avisa de cobros resueltos ni duplica en el mismo día de Madrid", async () => {
  records = [{ ...web, chargeStatus: "cobrado" }];
  await checkExpirations(now, DEFAULT_NOTIFICATIONS);
  records = [{ ...web, lastNotifiedAt: new Date("2026-10-09T22:30:00Z") }];
  await checkExpirations(now, DEFAULT_NOTIFICATIONS);
  assert.equal(messages.length, 0);
});

test("un fallo de Telegram no marca el aviso como enviado", async () => {
  globalThis.fetch = async () => Response.json({ ok: false, description: "Blocked" }, { status: 403 });
  const result = await checkExpirations(now, DEFAULT_NOTIFICATIONS);
  assert.match(result.error!, /Blocked/);
  assert.equal(updates, 0);
});
