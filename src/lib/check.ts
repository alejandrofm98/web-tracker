import { prisma } from "@/lib/db";
import { daysUntilInMadrid, madridDateKey, type NotificationPreferences } from "@/lib/notification-settings";
import { getNotificationSettings } from "@/lib/settings";
import { dueIn } from "@/lib/notify";
import { fmtDate, fmtMoney } from "@/lib/format";
import { escapeTelegramHtml, sendTelegram } from "@/lib/telegram";

export type CheckResult = { checked: number; notified: number; skippedNoTelegram: boolean; skippedDisabled?: boolean; error?: string };

export async function checkExpirations(now = new Date(), preferences?: NotificationPreferences): Promise<CheckResult> {
  const settings = preferences ?? await getNotificationSettings();
  if (!settings.enabled) return { checked: 0, notified: 0, skippedNoTelegram: false, skippedDisabled: true };
  const webs = await prisma.website.findMany({ where: { NOT: { status: "baja" } } });
  const today = madridDateKey(now);
  let notified = 0;

  for (const w of webs) {
    if (w.lastNotifiedAt && madridDateKey(w.lastNotifiedAt) >= today) continue;

    const dDom = daysUntilInMadrid(w.domainExpiresAt, now);
    const dCob = daysUntilInMadrid(w.nextChargeAt, now);
    const msgs: string[] = [];

    if (settings.domainEnabled && dueIn(dDom, settings.domainDays) && dDom !== null) {
      const when = dDom === 0 ? "hoy" : `en ${dDom} días`;
      msgs.push(`⚠️ <b>${escapeTelegramHtml(w.name)}</b> (${escapeTelegramHtml(w.url)}): el dominio caduca <b>${when}</b> (${fmtDate(w.domainExpiresAt)})`);
    }
    if (settings.chargeEnabled && w.chargeStatus === "pendiente" && dueIn(dCob, settings.chargeDays) && dCob !== null) {
      const when = dCob === 0 ? "hoy" : `en ${dCob} días`;
      const period = w.billingPeriod === "mensual" ? "mensual" : "anual";
      msgs.push(
        `💰 <b>${escapeTelegramHtml(w.name)} · cuota ${period}</b>\nCliente: ${escapeTelegramHtml(w.clientName || "cliente")}\nImporte: <b>${fmtMoney(w.clientPrice)} · dominio y hosting</b>\nFecha de cobro: <b>${fmtDate(w.nextChargeAt)} · ${when}</b>\nEstado: <b>Pendiente</b>`
      );
    }
    if (msgs.length === 0) continue;

    const result = await sendTelegram(msgs.join("\n\n"));
    if (!result.ok) return { checked: webs.length, notified, skippedNoTelegram: result.reason === "missing-config", error: result.error };
    await prisma.website.update({ where: { id: w.id }, data: { lastNotifiedAt: now } });
    notified++;
  }

  return { checked: webs.length, notified, skippedNoTelegram: false };
}
