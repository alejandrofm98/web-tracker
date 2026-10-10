import type { Website } from "@prisma/client";
import { daysUntilInMadrid, madridDateKey } from "./notification-settings";

type StatisticsWeb = Pick<Website, "id" | "name" | "status" | "clientPrice" | "billingPeriod" | "chargeStatus" | "nextChargeAt" | "domainCost" | "domainExpiresAt">;
const money = (value: number) => Math.round(value * 100) / 100;

export function portfolioStatistics(webs: StatisticsWeb[], now = new Date()) {
  const portfolio = webs.filter(w => w.status !== "baja");
  const billable = portfolio.filter(w => w.chargeStatus !== "sin-cobro");
  const pending = billable.filter(w => w.chargeStatus === "pendiente");
  const overdue = pending.filter(w => (daysUntilInMadrid(w.nextChargeAt, now) ?? Infinity) < 0);
  const today = madridDateKey(now);
  const [year, month] = today.split("-").map(Number);
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1 + index, 1));
    const key = date.toISOString().slice(0, 7);
    const charges = pending.filter(w => w.nextChargeAt && madridDateKey(w.nextChargeAt) >= today && madridDateKey(w.nextChargeAt).startsWith(key));
    return {
      key, label: date.toLocaleDateString("es-ES", { month: "short", year: "2-digit", timeZone: "UTC" }),
      amount: money(charges.reduce((sum, w) => sum + (w.clientPrice ?? 0), 0)),
      count: charges.length,
    };
  });
  const events = portfolio.flatMap(w => {
    const items: { id: string; name: string; kind: "Dominio" | "Cobro"; days: number; date: Date; amount: number | null }[] = [];
    const domain = daysUntilInMadrid(w.domainExpiresAt, now);
    const charge = daysUntilInMadrid(w.nextChargeAt, now);
    if (domain !== null && domain <= 30) items.push({ id: w.id, name: w.name, kind: "Dominio", days: domain, date: w.domainExpiresAt!, amount: w.domainCost });
    if (w.chargeStatus === "pendiente" && charge !== null && charge <= 30) items.push({ id: w.id, name: w.name, kind: "Cobro", days: charge, date: w.nextChargeAt!, amount: w.clientPrice });
    return items;
  }).sort((a, b) => a.days - b.days);
  return {
    webs: portfolio.length,
    annualRevenue: money(billable.reduce((sum, w) => sum + (w.clientPrice ?? 0) * (w.billingPeriod === "mensual" ? 12 : 1), 0)),
    missingPrices: billable.filter(w => w.clientPrice === null).length,
    pendingCount: pending.length,
    pendingAmount: money(pending.reduce((sum, w) => sum + (w.clientPrice ?? 0), 0)),
    pendingMissingPrices: pending.filter(w => w.clientPrice === null).length,
    overdueCount: overdue.length,
    overdueAmount: money(overdue.reduce((sum, w) => sum + (w.clientPrice ?? 0), 0)),
    domainCost: money(portfolio.reduce((sum, w) => sum + (w.domainCost ?? 0), 0)),
    knownDomainCosts: portfolio.filter(w => w.domainCost !== null).length,
    noChargeDate: pending.filter(w => !w.nextChargeAt).length,
    months, events,
  };
}
