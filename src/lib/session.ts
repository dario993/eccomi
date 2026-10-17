import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "eccomi_session";
export const SESSION_MAX_AGE = 90 * 86_400; // seconds

const sign = (exp: string, secret: string) => createHmac("sha256", secret).update(exp).digest("hex");

export function createSessionToken(secret: string, now = Date.now()): string {
  const exp = String(now + SESSION_MAX_AGE * 1000);
  return `${exp}.${sign(exp, secret)}`;
}

export function verifySessionToken(token: string | undefined, secret: string, now = Date.now()): boolean {
  const [exp, sig] = token?.split(".") ?? [];
  if (!exp || !sig || !(Number(exp) > now)) return false;
  const expected = Buffer.from(sign(exp, secret));
  const given = Buffer.from(sig);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function requireAuth(): Promise<void> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!verifySessionToken(token, process.env.SESSION_SECRET!)) redirect("/login");
}
