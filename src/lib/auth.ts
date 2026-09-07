import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "wt_session";

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET no definido");
  return new TextEncoder().encode(s);
}

export async function signSession(user: string) {
  return await new SignJWT({ u: user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, secret());
  return payload.u as string;
}

export function checkCredentials(user: string, pass: string) {
  return user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASSWORD;
}
