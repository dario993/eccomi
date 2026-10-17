import { expect, test } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/session";

const DAY = 86_400_000;

test("token is valid for 90 days", () => {
  const t = createSessionToken("secret", 0);
  expect(verifySessionToken(t, "secret", 89 * DAY)).toBe(true);
  expect(verifySessionToken(t, "secret", 91 * DAY)).toBe(false);
});

test("tampered, missing or foreign tokens are rejected", () => {
  const t = createSessionToken("secret", 0);
  const [exp, sig] = t.split(".");
  expect(verifySessionToken(`${Number(exp) + 1}.${sig}`, "secret", 0)).toBe(false);
  const flipped = sig.slice(0, -1) + (sig.endsWith("a") ? "b" : "a");
  expect(verifySessionToken(`${exp}.${flipped}`, "secret", 0)).toBe(false);
  expect(verifySessionToken(undefined, "secret", 0)).toBe(false);
  expect(verifySessionToken("garbage", "secret", 0)).toBe(false);
  expect(verifySessionToken(t, "other", 0)).toBe(false);
});
