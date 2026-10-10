import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../src/app/api/cron/route";
import { prisma } from "../src/lib/db";

const originalFetch = globalThis.fetch;
const originalEnv = { token: process.env.TELEGRAM_BOT_TOKEN, chat: process.env.TELEGRAM_CHAT_ID, api: process.env.API_TOKEN };

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const [key, value] of Object.entries({ TELEGRAM_BOT_TOKEN: originalEnv.token, TELEGRAM_CHAT_ID: originalEnv.chat, API_TOKEN: originalEnv.api })) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function request() {
  process.env.API_TOKEN = "test-api";
  return new Request("http://localhost/api/cron", { method: "POST", headers: { authorization: "Bearer test-api" } });
}

test("la prueba envía sin consultar vencimientos ni modificar recordatorios", async () => {
  process.env.TELEGRAM_BOT_TOKEN = "test-bot";
  process.env.TELEGRAM_CHAT_ID = "test-chat";
  prisma.$use(async () => { throw new Error("La prueba no debe consultar ni modificar la base de datos"); });
  let sent = 0;
  globalThis.fetch = async (_url, init) => {
    sent++;
    assert.match(JSON.parse(init!.body as string).text, /mensaje de prueba/);
    return Response.json({ ok: true });
  };
  const response = await POST(request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { notified: 1 });
  assert.equal(sent, 1);
});

test("la prueba devuelve el error de configuración", async () => {
  delete process.env.TELEGRAM_BOT_TOKEN;
  const response = await POST(request());
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /no está configurado/);
});

test("la prueba devuelve el rechazo de Telegram sin anunciar éxito", async () => {
  process.env.TELEGRAM_BOT_TOKEN = "test-bot";
  process.env.TELEGRAM_CHAT_ID = "test-chat";
  globalThis.fetch = async () => Response.json({ ok: false, description: "Forbidden: bot was blocked by the user" }, { status: 403 });
  const response = await POST(request());
  assert.equal(response.status, 502);
  assert.match((await response.json()).error, /bot was blocked/);
});
