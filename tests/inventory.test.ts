import test from "node:test";
import assert from "node:assert/strict";
import { chargeLabel, needsCompletion, inventoryWhere } from "../src/lib/inventory";

const complete = { clientName: "Cliente", domainExpiresAt: new Date("2027-05-28"), clientPrice: 120, chargeStatus: "cobrado", nextChargeAt: new Date("2020-01-01") };
test("un cobro pagado con fecha antigua no se muestra atrasado", () => {
  assert.equal(chargeLabel(complete), "Cobrado");
  assert.match(chargeLabel({ ...complete, chargeStatus: "pendiente" }), /retraso/);
});
test("una ficha sin fecha de dominio o datos de cobro está incompleta", () => {
  assert.equal(needsCompletion(complete), false);
  assert.equal(needsCompletion({ ...complete, domainExpiresAt: null }), true);
  assert.equal(needsCompletion({ ...complete, clientName: "  " }), true);
  assert.equal(needsCompletion({ ...complete, clientPrice: null }), true);
  assert.equal(needsCompletion({ ...complete, chargeStatus: "pendiente", nextChargeAt: null }), true);
  assert.equal(needsCompletion({ ...complete, chargeStatus: "sin-cobro", clientPrice: null, nextChargeAt: null }), false);
  assert.equal(needsCompletion({ ...complete, clientPrice: 0 }), false);
});
test("búsqueda y filtro incompleto conservan las bajas fuera del listado", () => {
  const where = inventoryWhere("Valle", "incomplete");
  assert.deepEqual(where.NOT, { status: "baja" });
  assert.equal(where.OR?.length, 3);
  assert.deepEqual(inventoryWhere("", "bajas"), { status: "baja" });
  assert.deepEqual(inventoryWhere("", "todas"), {});
});
