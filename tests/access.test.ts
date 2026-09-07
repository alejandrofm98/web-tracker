import test from "node:test";
import assert from "node:assert/strict";
import { isValidBearer, hasBasicAuth } from "../src/lib/access.js";

process.env.API_TOKEN = "test-token-123";
process.env.ADMIN_USER = "admin";
process.env.ADMIN_PASSWORD = "secret";

test("bearer acepta el token correcto", () => {
  const req = new Request("http://x/", { headers: { authorization: "Bearer test-token-123" } });
  assert.equal(isValidBearer(req), true);
});

test("bearer rechaza token incorrecto o ausente", () => {
  assert.equal(isValidBearer(new Request("http://x/")), false);
  assert.equal(
    isValidBearer(new Request("http://x/", { headers: { authorization: "Bearer otro" } })),
    false
  );
});

test("basic acepta usuario y pass del login", () => {
  const creds = Buffer.from("admin:secret").toString("base64");
  const req = new Request("http://x/", { headers: { authorization: `Basic ${creds}` } });
  assert.equal(hasBasicAuth(req), true);
});

test("basic rechaza credenciales malas", () => {
  const creds = Buffer.from("admin:mal").toString("base64");
  const req = new Request("http://x/", { headers: { authorization: `Basic ${creds}` } });
  assert.equal(hasBasicAuth(req), false);
});
