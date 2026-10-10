import { NextResponse } from "next/server";
import { sendTelegram } from "@/lib/telegram";
import { checkExpirations } from "@/lib/check";
import { isValidBearer, hasBasicAuth, hasSession } from "@/lib/access";

export async function GET(req: Request) {
  const allowed = isValidBearer(req) || hasBasicAuth(req) || (await hasSession());
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await checkExpirations();
  return NextResponse.json(result, { status: result.error ? 502 : 200 });
}

// Send a test even when no expiration is due, without suppressing reminders.
export async function POST(req: Request) {
  const allowed = isValidBearer(req) || hasBasicAuth(req) || (await hasSession());
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const result = await sendTelegram("🔔 <b>Web Tracker</b>: mensaje de prueba. Los avisos de Telegram funcionan.");
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.reason === "missing-config" ? 503 : 502 });
  }
  return NextResponse.json({ notified: 1 });
}
