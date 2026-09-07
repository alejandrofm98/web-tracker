export function daysUntil(d: Date | string | null | undefined): number | null {
  if (!d) return null;
  const t = new Date(d).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / 86400000);
}

export function statusFor(days: number | null): "ok" | "warn" | "crit" {
  if (days === null) return "ok";
  if (days < 7) return "crit";
  if (days < 30) return "warn";
  return "ok";
}
