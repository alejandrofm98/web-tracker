import test from "node:test";
import assert from "node:assert/strict";
import { portfolioStatistics } from "../src/lib/statistics";

const web = { id: "1", name: "Web", status: "activa", clientPrice: 50, billingPeriod: "anual", chargeStatus: "pendiente", nextChargeAt: new Date("2026-10-17"), domainCost: 12, domainExpiresAt: new Date("2026-10-17") };
const now = new Date("2026-10-10T10:00:00Z");

test("anualiza cuotas mensuales, excluye bajas y separa cuotas de pendientes", () => {
  const stats = portfolioStatistics([
    web, { ...web, id: "2", billingPeriod: "mensual", clientPrice: 10, chargeStatus: "cobrado" },
    { ...web, id: "3", status: "baja", clientPrice: 999 },
    { ...web, id: "4", chargeStatus: "sin-cobro", clientPrice: 999 },
  ], now);
  assert.equal(stats.annualRevenue, 170);
  assert.equal(stats.pendingAmount, 50);
  assert.equal(stats.pendingCount, 1);
  assert.equal(stats.webs, 3);
  assert.equal(stats.domainCost, 36);
});

test("la previsión incluye solo cobros futuros registrados y cruza de año", () => {
  const stats = portfolioStatistics([
    web, { ...web, id: "2", nextChargeAt: new Date("2026-10-01") },
    { ...web, id: "3", nextChargeAt: new Date("2027-01-01") },
    { ...web, id: "4", nextChargeAt: null },
    { ...web, id: "5", chargeStatus: "cobrado" },
  ], now);
  assert.equal(stats.overdueAmount, 50);
  assert.equal(stats.overdueCount, 1);
  assert.equal(stats.months[0].amount, 50);
  assert.equal(stats.months[3].key, "2027-01");
  assert.equal(stats.months[3].amount, 50);
  assert.equal(stats.months.reduce((sum, m) => sum + m.amount, 0), 100);
  assert.equal(stats.noChargeDate, 1);
});

test("faltan importes: se cuenta la ficha sin inventar ingresos", () => {
  const stats = portfolioStatistics([{ ...web, clientPrice: null, domainCost: null }], now);
  assert.equal(stats.missingPrices, 1);
  assert.equal(stats.pendingMissingPrices, 1);
  assert.equal(stats.annualRevenue, 0);
  assert.equal(stats.knownDomainCosts, 0);
  assert.equal(stats.events.length, 2);
  assert.equal(stats.events[0].days, 7);
  assert.equal(portfolioStatistics([], now).months.length, 12);
});
