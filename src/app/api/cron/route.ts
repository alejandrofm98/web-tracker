import { NextResponse } from "next/server";
import { checkExpirations } from "@/lib/check";
import { isValidBearer, hasBasicAuth, hasSession } from "@/lib/access";

export async function GET(req: Request) {
  const allowed = isValidBearer(req) || hasBasicAuth(req) || (await hasSession());
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await checkExpirations();
  return NextResponse.json(result);
}
