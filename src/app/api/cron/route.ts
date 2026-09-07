import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkExpirations } from "@/lib/check";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret") ?? req.headers.get("authorization")?.replace(/^Bearer /i, "");
  const bySecret = Boolean(process.env.CRON_SECRET && secret === process.env.CRON_SECRET);

  let bySession = false;
  if (!bySecret) {
    const token = cookies().get(SESSION_COOKIE)?.value;
    if (token) {
      try {
        await verifySession(token);
        bySession = true;
      } catch {
        bySession = false;
      }
    }
  }

  if (!bySecret && !bySession) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await checkExpirations();
  return NextResponse.json(result);
}
