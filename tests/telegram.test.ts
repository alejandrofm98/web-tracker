import test from "node:test";
import assert from "node:assert/strict";
import { escapeTelegramHtml, sendTelegram } from "../src/lib/telegram";

const originalFetch = globalThis.fetch;
const originalToken = process.env.TELEGRAM_BOT_TOKEN;
const originalChat = process.env.TELEGRAM_CHAT_ID;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
  else process.env.TELEGRAM_BOT_TOKEN = originalToken;
  if (originalChat === undefined) delete process.env.TELEGRAM_CHAT_ID;
  else process.env.TELEGRAM_CHAT_ID = originalChat;
});

function configure() {
  process.env.TELEGRAM_BOT_TOKEN = "test-token";
  process.env.TELEGRAM_CHAT_ID = "test-chat";
}

test("la configuración ausente se distingue de un envío fallido", async () => {
  delete process.env.TELEGRAM_BOT_TOKEN;
  let called = false;
  globalThis.fetch = async () => { called = true; throw new Error(); };
  const result = await sendTelegram("prueba");
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "missing-config");
  assert.equal(called, false);
});

test("el éxito requiere la confirmación de Telegram", async () => {
  configure();
  globalThis.fetch = async (_url, init) => {
    assert.deepEqual(JSON.parse(init!.body as string), { chat_id: "test-chat", text: "prueba", parse_mode: "HTML" });
    return Response.json({ ok: true, result: { message_id: 1 } });
  };
  assert.deepEqual(await sendTelegram("prueba"), { ok: true });
  globalThis.fetch = async () => Response.json({ ok: false, description: "chat not found" });
  const rejected = await sendTelegram("prueba");
  assert.equal(rejected.ok, false);
  if (!rejected.ok) assert.match(rejected.error, /chat not found/);
});

test("el rechazo HTTP y los fallos de red no exponen el token", async () => {
  configure();
  globalThis.fetch = async () => Response.json({ ok: false, description: "invalid test-token" }, { status: 401 });
  const result = await sendTelegram("prueba");
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error.includes("test-token"), false);
  globalThis.fetch = async () => { throw new Error("https://api.telegram.org/bottest-token/sendMessage"); };
  const network = await sendTelegram("prueba");
  assert.equal(network.ok, false);
  if (!network.ok) assert.equal(network.error.includes("test-token"), false);
});

test("los nombres, clientes y URLs no rompen el HTML de los avisos", () => {
  assert.equal(escapeTelegramHtml('Web <Valle> & https://web.es/?a=1&b=2'), 'Web &lt;Valle&gt; &amp; https://web.es/?a=1&amp;b=2');
});
