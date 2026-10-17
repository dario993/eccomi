import { expect, test } from "vitest";
import { parseRange, shortcutRange } from "@/lib/range";

const T = "2026-10-17";

test("missing or invalid params fall back to today", () => {
  expect(parseRange({}, T)).toEqual({ from: T, to: T });
  expect(parseRange({ from: "x", to: "2026-10-01" }, T)).toEqual({ from: T, to: T });
  expect(parseRange({ from: "2026-02-30", to: "2026-03-01" }, T)).toEqual({ from: T, to: T });
  expect(parseRange({ from: "0000-01-01", to: "2026-01-01" }, T)).toEqual({ from: T, to: T }); // Postgres rejects year 0
});

test("a reversed range is swapped", () => {
  expect(parseRange({ from: "2026-10-20", to: "2026-10-01" }, T)).toEqual({ from: "2026-10-01", to: "2026-10-20" });
});

test("only from given means that single day", () => {
  expect(parseRange({ from: "2026-10-05" }, T)).toEqual({ from: "2026-10-05", to: "2026-10-05" });
});

test("shortcuts", () => {
  expect(shortcutRange("today", T)).toEqual({ from: T, to: T });
  expect(shortcutRange("week", T)).toEqual({ from: "2026-10-12", to: "2026-10-18" }); // Saturday
  expect(shortcutRange("week", "2026-10-12")).toEqual({ from: "2026-10-12", to: "2026-10-18" }); // Monday
  expect(shortcutRange("week", "2026-10-18")).toEqual({ from: "2026-10-12", to: "2026-10-18" }); // Sunday
  expect(shortcutRange("month", "2026-02-10")).toEqual({ from: "2026-02-01", to: "2026-02-28" });
  expect(shortcutRange("month", "2026-12-31")).toEqual({ from: "2026-12-01", to: "2026-12-31" });
});
