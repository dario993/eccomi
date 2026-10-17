"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

const hash = (s: string) => createHash("sha256").update(s).digest();

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  const given = String(formData.get("password") ?? "");
  if (!timingSafeEqual(hash(given), hash(process.env.APP_PASSWORD!))) return "Password errata";
  (await cookies()).set(SESSION_COOKIE, createSessionToken(process.env.SESSION_SECRET!), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  redirect("/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
