export type NotificationPreferences = {
  enabled: boolean;
  sendTime: string;
  domainEnabled: boolean;
  chargeEnabled: boolean;
  domainDays: number[];
  chargeDays: number[];
};

export const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  enabled: true, sendTime: "09:00", domainEnabled: true, chargeEnabled: true,
  domainDays: [30, 15, 7, 1], chargeDays: [30, 15, 7, 1],
};

export function parseNotificationPreferences(body: unknown): NotificationPreferences {
  if (!body || typeof body !== "object") throw new Error("Los ajustes no son válidos.");
  const input = body as Record<string, unknown>;
  for (const key of ["enabled", "domainEnabled", "chargeEnabled"]) {
    if (typeof input[key] !== "boolean") throw new Error("Indica qué avisos quieres activar.");
  }
  if (typeof input.sendTime !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.sendTime)) {
    throw new Error("Indica una hora válida (HH:MM).");
  }
  function days(key: string): number[] {
    const value = input[key];
    if (!Array.isArray(value) || !value.length || value.length > 20 ||
        value.some(d => typeof d !== "number" || !Number.isInteger(d) || d < 0 || d > 365)) {
      throw new Error("Indica entre 1 y 20 días de antelación, de 0 a 365.");
    }
    return Array.from(new Set(value as number[])).sort((a, b) => b - a);
  }
  return {
    enabled: input.enabled as boolean, sendTime: input.sendTime,
    domainEnabled: input.domainEnabled as boolean, chargeEnabled: input.chargeEnabled as boolean,
    domainDays: days("domainDays"), chargeDays: days("chargeDays"),
  };
}

export function madridDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find(p => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function daysUntilInMadrid(date: Date | null, now = new Date()): number | null {
  if (!date) return null;
  return (Date.parse(madridDateKey(date)) - Date.parse(madridDateKey(now))) / 86400000;
}

export function isNotificationTime(settings: NotificationPreferences, now = new Date()): boolean {
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(now);
  return settings.enabled && settings.sendTime === time;
}
