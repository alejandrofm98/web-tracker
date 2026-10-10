export type TelegramResult =
  | { ok: true }
  | { ok: false; reason: "missing-config" | "send-failed"; error: string };

export function escapeTelegramHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function sendTelegram(text: string): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) {
    return { ok: false, reason: "missing-config", error: "Telegram no está configurado: faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID en el servidor." };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML" }),
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.ok !== true) {
      // Do not expose request URLs or credentials in diagnostics.
      const description = typeof data?.description === "string"
        ? data.description.split(token).join("[oculto]")
        : `respuesta HTTP ${res.status}`;
      return { ok: false, reason: "send-failed", error: `Telegram rechazó el envío: ${description}` };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "send-failed", error: "No se pudo conectar con Telegram. Revisa la conexión del servidor y vuelve a probar." };
  }
}
