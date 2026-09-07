import test from "node:test";
import assert from "node:assert/strict";
import { SignJWT, jwtVerify } from "jose";

test("session roundtrip", async () => {
  const secret = new TextEncoder().encode("test-secret-32-chars-minimo-123456");
  const jwt = await new SignJWT({ u: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
  const { payload } = await jwtVerify(jwt, secret);
  assert.equal(payload.u, "admin");
});
