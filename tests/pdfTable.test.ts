import { expect, test } from "vitest";
import { MARK, summaryToTable } from "@/lib/pdfTable";
import type { Summary } from "@/lib/summary";

const oct = { from: "2026-10-01", to: "2026-10-31" };

test("single day", () => {
  const t = summaryToTable({ mode: "day", range: { from: "2026-10-17", to: "2026-10-17" }, names: ["Anna Rossi", "Luca Bianchi"] });
  expect(t).toMatchObject({
    title: "Dare – Eccomi",
    subtitle: "sabato 17 ottobre 2026 · 2 presenti",
    head: ["Volontario"],
    body: [["Anna Rossi"], ["Luca Bianchi"]],
    orientation: "portrait",
    filename: "presenze-2026-10-17.pdf",
  });
});

test("grid", () => {
  const s: Summary = {
    mode: "grid", range: oct, days: ["2026-10-05", "2026-10-09"],
    rows: [{ name: "Anna Rossi", marks: [true, false], total: 1 }],
  };
  expect(summaryToTable(s)).toMatchObject({
    subtitle: "1 ottobre 2026 – 31 ottobre 2026",
    head: ["Volontario", "05", "09", "Totale"],
    body: [["Anna Rossi", MARK, "", "1"]],
    orientation: "portrait",
    filename: "presenze-2026-10-01_2026-10-31.pdf",
  });
});

test("wide grid goes landscape", () => {
  const days = Array.from({ length: 11 }, (_, i) => `2026-10-${String(i + 1).padStart(2, "0")}`);
  const s: Summary = { mode: "grid", range: oct, days, rows: [] };
  expect(summaryToTable(s).orientation).toBe("landscape");
});

test("totals", () => {
  const s: Summary = { mode: "totals", range: { from: "2026-09-01", to: "2026-10-31" }, rows: [{ name: "Anna Rossi", total: 10 }] };
  expect(summaryToTable(s)).toMatchObject({ head: ["Volontario", "Giorni di presenza"], body: [["Anna Rossi", "10"]] });
});

test("grid spanning two months keeps the month in day headers", () => {
  const s: Summary = { mode: "grid", range: { from: "2026-10-20", to: "2026-11-10" }, days: ["2026-10-31", "2026-11-02"], rows: [] };
  expect(summaryToTable(s).head).toEqual(["Volontario", "31.10", "02.11", "Totale"]);
});
