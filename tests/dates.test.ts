import { expect, test } from "vitest";
import { addDays, daysBetween, formatDateIt, formatRangeIt, isValidDate, todayZurich } from "@/lib/dates";

test("todayZurich uses the Zurich calendar day, not UTC", () => {
  expect(todayZurich(new Date("2026-10-17T22:30:00Z"))).toBe("2026-10-18"); // CEST, UTC+2
  expect(todayZurich(new Date("2026-12-31T23:30:00Z"))).toBe("2027-01-01"); // CET, UTC+1
  expect(todayZurich(new Date("2026-10-17T10:00:00Z"))).toBe("2026-10-17");
});

test("addDays crosses month and DST boundaries", () => {
  expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
  expect(addDays("2026-03-29", 1)).toBe("2026-03-30");
  expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
});

test("daysBetween is inclusive", () => {
  expect(daysBetween("2026-10-01", "2026-10-31")).toBe(31);
  expect(daysBetween("2026-10-05", "2026-10-05")).toBe(1);
});

test("isValidDate rejects malformed and impossible dates", () => {
  expect(isValidDate("2026-02-30")).toBe(false);
  expect(isValidDate("abc")).toBe(false);
  expect(isValidDate("2026-2-28")).toBe(false);
  expect(isValidDate("2026-02-28")).toBe(true);
});

test("formatDateIt", () => {
  expect(formatDateIt("2026-10-17", "long")).toBe("sabato 17 ottobre 2026");
  expect(formatDateIt("2026-10-05", "short")).toBe("05.10");
  expect(formatDateIt("2026-10-01", "medium")).toBe("1 ottobre 2026");
});

test("formatRangeIt", () => {
  expect(formatRangeIt("2026-10-01", "2026-10-31")).toBe("1 ottobre 2026 – 31 ottobre 2026");
  expect(formatRangeIt("2026-10-17", "2026-10-17")).toBe("sabato 17 ottobre 2026");
});
