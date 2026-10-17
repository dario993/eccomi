import { afterEach, expect, test, vi } from "vitest";
import { login } from "@/app/login/actions";

afterEach(() => vi.useRealTimers());

test("a wrong password is answered only after a 1s delay", async () => {
  vi.stubEnv("APP_PASSWORD", "giusta");
  vi.useFakeTimers();
  const fd = new FormData();
  fd.set("password", "sbagliata");
  let result: string | null | undefined;
  login(null, fd).then((r) => (result = r));
  await vi.advanceTimersByTimeAsync(900);
  expect(result).toBeUndefined();
  await vi.advanceTimersByTimeAsync(200);
  expect(result).toBe("Password errata");
});
