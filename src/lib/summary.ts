import { sql } from "./db";
import { daysBetween } from "./dates";
import type { Range } from "./range";
import { compareVolunteers } from "./volunteers";

export type AttendanceRow = { volunteer_id: number; first_name: string; last_name: string; date: string };

export type Summary =
  | { mode: "day"; range: Range; names: string[] }
  | { mode: "grid"; range: Range; days: string[]; rows: { name: string; marks: boolean[]; total: number }[] }
  | { mode: "totals"; range: Range; rows: { name: string; total: number }[] };

export const GRID_MAX_DAYS = 31;

export function buildSummary(range: Range, rows: AttendanceRow[]): Summary {
  const people = new Map<number, { first_name: string; last_name: string; dates: Set<string> }>();
  for (const r of rows) {
    const p = people.get(r.volunteer_id) ?? { first_name: r.first_name, last_name: r.last_name, dates: new Set() };
    p.dates.add(r.date);
    people.set(r.volunteer_id, p);
  }
  const sorted = [...people.values()].sort(compareVolunteers);
  const name = (p: { first_name: string; last_name: string }) => `${p.first_name} ${p.last_name}`.trim();

  if (range.from === range.to) return { mode: "day", range, names: sorted.map(name) };
  if (daysBetween(range.from, range.to) > GRID_MAX_DAYS) {
    return { mode: "totals", range, rows: sorted.map((p) => ({ name: name(p), total: p.dates.size })) };
  }
  const days = [...new Set(rows.map((r) => r.date))].sort();
  return {
    mode: "grid",
    range,
    days,
    rows: sorted.map((p) => ({ name: name(p), marks: days.map((d) => p.dates.has(d)), total: p.dates.size })),
  };
}

export async function loadAttendances(range: Range): Promise<AttendanceRow[]> {
  return sql<AttendanceRow[]>`
    SELECT a.volunteer_id, v.first_name, v.last_name, a.date
    FROM attendances a JOIN volunteers v ON v.id = a.volunteer_id
    WHERE a.date BETWEEN ${range.from} AND ${range.to}`;
}
