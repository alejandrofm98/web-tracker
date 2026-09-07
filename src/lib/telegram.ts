export async function sendTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) {
    console.warn("telegram no configurado (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID)");
    return false;
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML" }),
  });
  if (!res.ok) {
    console.error("telegram error", res.status, await res.text().catch(() => ""));
    return false;
  }
  return true;
}
