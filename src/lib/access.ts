import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "./auth";

export function isValidBearer(req: Request): boolean {
  const token = process.env.API_TOKEN;
  if (!token) return false;
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.toLowerCase().startsWith("bearer ")) return false;
  return auth.slice(7).trim() === token;
}

export function hasBasicAuth(req: Request): boolean {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.toLowerCase().startsWith("basic ")) return false;
  try {
    const decoded = Buffer.from(auth.slice(6).trim(), "base64").toString("utf-8");
    const idx = decoded.indexOf(":");
    return (
      decoded.slice(0, idx) === process.env.ADMIN_USER &&
      decoded.slice(idx + 1) === process.env.ADMIN_PASSWORD
    );
  } catch {
    return false;
  }
}

export async function hasSession(): Promise<boolean> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    await verifySession(token);
    return true;
  } catch {
    return false;
  }
}

/** Acceso API: token Bearer (agentes/acc externos) o sesión (navegador). */
export async function hasApiAccess(req: Request): Promise<boolean> {
  if (isValidBearer(req)) return true;
  return await hasSession();
}
