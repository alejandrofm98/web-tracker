import test from "node:test";
import assert from "node:assert/strict";
import { dueIn, TARGETS } from "../src/lib/notify.js";

test("due matches targets 30/15/7/1", () => {
  assert.equal(TARGETS.join(","), "30,15,7,1");
  assert.equal(dueIn(30), true);
  assert.equal(dueIn(15), true);
  assert.equal(dueIn(7), true);
  assert.equal(dueIn(1), true);
  assert.equal(dueIn(29), false);
  assert.equal(dueIn(null), false);
});
