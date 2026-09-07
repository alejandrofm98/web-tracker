import { NextResponse } from "next/server";
import { checkCredentials, signSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const { user, pass } = await req.json().catch(() => ({ user: "", pass: "" }));
  if (!checkCredentials(String(user ?? ""), String(pass ?? ""))) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }
  const token = await signSession(String(user));
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
