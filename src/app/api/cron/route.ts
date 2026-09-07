import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkExpirations } from "@/lib/check";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  let byBasic = false;
  if (auth.toLowerCase().startsWith("basic ")) {
    try {
      const decoded = Buffer.from(auth.slice(6).trim(), "base64").toString("utf-8");
      const idx = decoded.indexOf(":");
      const user = decoded.slice(0, idx);
      const pass = decoded.slice(idx + 1);
      byBasic = user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASSWORD;
    } catch {
      byBasic = false;
    }
  }

  let bySession = false;
  if (!byBasic) {
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

  if (!byBasic && !bySession) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await checkExpirations();
  return NextResponse.json(result);
}
