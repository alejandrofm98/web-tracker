import type { Prisma, Website } from "@prisma/client";
import { daysUntil } from "./dates";

type InventoryWeb = Pick<Website, "clientName" | "domainExpiresAt" | "clientPrice" | "chargeStatus" | "nextChargeAt">;

export function needsCompletion(web: InventoryWeb): boolean {
  return !web.clientName.trim() || !web.domainExpiresAt ||
    (web.chargeStatus !== "sin-cobro" && web.clientPrice === null) ||
    (web.chargeStatus === "pendiente" && !web.nextChargeAt);
}

export function chargeLabel(web: Pick<Website, "chargeStatus" | "nextChargeAt">): string {
  if (web.chargeStatus === "cobrado") return "Cobrado";
  if (web.chargeStatus === "sin-cobro") return "Sin cobro";
  const days = daysUntil(web.nextChargeAt);
  if (days === null) return "Pendiente · sin fecha";
  if (days < 0) return `Pendiente · ${-days} días de retraso`;
  if (days === 0) return "Pendiente · hoy";
  return `Pendiente · en ${days} días`;
}

export function inventoryWhere(q: string, f: string): Prisma.WebsiteWhereInput {
  const where: Prisma.WebsiteWhereInput = {};
  if (q) where.OR = ["name", "url", "clientName"].map((field) => ({
    [field]: { contains: q, mode: "insensitive" },
  }));
  if (f === "expiring") where.domainExpiresAt = { lte: new Date(Date.now() + 30 * 86400000) };
  else if (f === "charges") where.chargeStatus = "pendiente";
  else if (f === "bajas") where.status = "baja";
  else if (f !== "todas") where.NOT = { status: "baja" };
  return where;
}
