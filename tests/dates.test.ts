import test from "node:test";
import assert from "node:assert/strict";
import { daysUntil, statusFor } from "../src/lib/dates.js";

test("status thresholds", () => {
  assert.equal(statusFor(40), "ok");
  assert.equal(statusFor(20), "warn");
  assert.equal(statusFor(5), "crit");
  assert.equal(statusFor(null), "ok");
});

test("daysUntil null on empty", () => {
  assert.equal(daysUntil(null), null);
  assert.equal(daysUntil(undefined), null);
});

test("daysUntil computes ceiling of day diff", () => {
  const future = new Date(Date.now() + 10 * 86400000).toISOString();
  assert.equal(daysUntil(future), 10);
});
