import { expect, test, vi } from "vitest";

// Layouts are skipped on client navigations, so every page must check auth itself.
vi.mock("@/lib/session", () => ({
  requireAuth: vi.fn(async () => {
    throw new Error("AUTH_REQUIRED");
  }),
}));

test.each([
  ["presenze", () => import("@/app/(app)/page")],
  ["volontari", () => import("@/app/(app)/volontari/page")],
  ["riepilogo", () => import("@/app/(app)/riepilogo/page")],
])("%s page requires auth before reading data", async (_name, load) => {
  const Page = (await load()).default as (p: object) => Promise<unknown>;
  await expect(Page({ searchParams: Promise.resolve({}) })).rejects.toThrow("AUTH_REQUIRED");
});
