import { formatDateIt, formatRangeIt } from "./dates";
import type { Summary } from "./summary";

export const MARK = "●";
const LANDSCAPE_AFTER_DAYS = 10;

export type PdfTable = {
  title: string;
  subtitle: string;
  head: string[];
  body: string[][];
  orientation: "portrait" | "landscape";
  filename: string;
};

/** The PDF is built from the same Summary the page renders, so the two always match. */
export function summaryToTable(s: Summary): PdfTable {
  const { from, to } = s.range;
  const base = {
    title: "Dare – Eccomi",
    subtitle: formatRangeIt(from, to),
    filename: from === to ? `presenze-${from}.pdf` : `presenze-${from}_${to}.pdf`,
    orientation: "portrait" as const,
  };
  if (s.mode === "day") {
    const n = s.names.length;
    return { ...base, subtitle: `${base.subtitle} · ${n} ${n === 1 ? "presente" : "presenti"}`, head: ["Volontario"], body: s.names.map((n) => [n]) };
  }
  if (s.mode === "totals") {
    return { ...base, head: ["Volontario", "Giorni di presenza"], body: s.rows.map((r) => [r.name, String(r.total)]) };
  }
  // Within one month the subtitle already names it, so day numbers alone keep 31 columns on one page.
  const oneMonth = from.slice(0, 7) === to.slice(0, 7);
  return {
    ...base,
    head: ["Volontario", ...s.days.map((d) => (oneMonth ? d.slice(8, 10) : formatDateIt(d, "short"))), "Totale"],
    body: s.rows.map((r) => [r.name, ...r.marks.map((m) => (m ? MARK : "")), String(r.total)]),
    orientation: s.days.length > LANDSCAPE_AFTER_DAYS ? "landscape" : "portrait",
  };
}
