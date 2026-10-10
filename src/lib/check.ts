import { prisma } from "@/lib/db";
import { daysUntil } from "@/lib/dates";
import { dueIn } from "@/lib/notify";
import { fmtDate, fmtMoney } from "@/lib/format";
import { escapeTelegramHtml, sendTelegram } from "@/lib/telegram";

export type CheckResult = { checked: number; notified: number; skippedNoTelegram: boolean; error?: string };

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export async function checkExpirations(now = new Date()): Promise<CheckResult> {
  const webs = await prisma.website.findMany({ where: { NOT: { status: "baja" } } });
  const today = startOfDay(now);
  let notified = 0;

  for (const w of webs) {
    if (w.lastNotifiedAt && startOfDay(w.lastNotifiedAt) >= today) continue;

    const dDom = daysUntil(w.domainExpiresAt);
    const dCob = daysUntil(w.nextChargeAt);
    const msgs: string[] = [];

    if (dueIn(dDom) && dDom !== null) {
      const when = dDom === 0 ? "hoy" : `en ${dDom} días`;
      msgs.push(`⚠️ <b>${escapeTelegramHtml(w.name)}</b> (${escapeTelegramHtml(w.url)}): el dominio caduca <b>${when}</b> (${fmtDate(w.domainExpiresAt)})`);
    }
    if (w.chargeStatus === "pendiente" && dueIn(dCob) && dCob !== null) {
      const when = dCob === 0 ? "hoy" : `en ${dCob} días`;
      msgs.push(
        `💰 <b>${escapeTelegramHtml(w.name)}</b>: toca cobrar hosting a ${escapeTelegramHtml(w.clientName || "cliente")} (${fmtMoney(w.clientPrice)}) <b>${when}</b> (${fmtDate(w.nextChargeAt)})`
      );
    }
    if (msgs.length === 0) continue;

    const result = await sendTelegram(msgs.join("\n"));
    if (!result.ok) return { checked: webs.length, notified, skippedNoTelegram: result.reason === "missing-config", error: result.error };
    await prisma.website.update({ where: { id: w.id }, data: { lastNotifiedAt: now } });
    notified++;
  }

  return { checked: webs.length, notified, skippedNoTelegram: false };
}
