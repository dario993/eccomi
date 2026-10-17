import { sql } from "./db";
import { daysBetween } from "./dates";
import type { Range } from "./range";
import { collator, compareVolunteers } from "./volunteers";

export type AttendanceRow = { volunteer_id: number; first_name: string; last_name: string; date: string; groups: string[] };

/** `title` is the group name; null only when nobody present belongs to a group (no heading needed). */
type Section<T> = { title: string | null } & T;

export type Summary =
  | { mode: "day"; range: Range; present: number; sections: Section<{ names: string[] }>[] }
  | { mode: "grid"; range: Range; days: string[]; sections: Section<{ rows: { name: string; marks: boolean[]; total: number }[] }>[] }
  | { mode: "totals"; range: Range; sections: Section<{ rows: { name: string; total: number }[] }>[] };

export const GRID_MAX_DAYS = 31;
export const UNGROUPED = "Senza gruppo";

type Person = { first_name: string; last_name: string; groups: string[]; dates: Set<string> };

/** A volunteer in several groups appears under each of them; ungrouped volunteers come last. */
function bySection(people: Person[]): Section<{ people: Person[] }>[] {
  const groups = new Map<string | null, Person[]>();
  for (const p of people) {
    for (const g of p.groups.length ? p.groups : [null]) groups.set(g, [...(groups.get(g) ?? []), p]);
  }
  const keys = [...groups.keys()].sort((a, b) => (a === null ? 1 : b === null ? -1 : collator.compare(a, b)));
  return keys.map((k) => ({
    title: k ?? (keys.length === 1 ? null : UNGROUPED),
    people: groups.get(k)!,
  }));
}

export function buildSummary(range: Range, rows: AttendanceRow[]): Summary {
  const people = new Map<number, Person>();
  for (const r of rows) {
    const p = people.get(r.volunteer_id) ?? { first_name: r.first_name, last_name: r.last_name, groups: r.groups, dates: new Set() };
    p.dates.add(r.date);
    people.set(r.volunteer_id, p);
  }
  const sorted = [...people.values()].sort(compareVolunteers);
  const sections = bySection(sorted);
  const name = (p: Person) => `${p.first_name} ${p.last_name}`.trim();

  if (range.from === range.to) {
    return { mode: "day", range, present: sorted.length, sections: sections.map((s) => ({ title: s.title, names: s.people.map(name) })) };
  }
  if (daysBetween(range.from, range.to) > GRID_MAX_DAYS) {
    return {
      mode: "totals",
      range,
      sections: sections.map((s) => ({ title: s.title, rows: s.people.map((p) => ({ name: name(p), total: p.dates.size })) })),
    };
  }
  const days = [...new Set(rows.map((r) => r.date))].sort();
  return {
    mode: "grid",
    range,
    days,
    sections: sections.map((s) => ({
      title: s.title,
      rows: s.people.map((p) => ({ name: name(p), marks: days.map((d) => p.dates.has(d)), total: p.dates.size })),
    })),
  };
}

export async function loadAttendances(range: Range): Promise<AttendanceRow[]> {
  return sql<AttendanceRow[]>`
    SELECT a.volunteer_id, v.first_name, v.last_name, a.date,
      ARRAY(SELECT g.name FROM group_members m JOIN groups g ON g.id = m.group_id WHERE m.volunteer_id = v.id) AS groups
    FROM attendances a JOIN volunteers v ON v.id = a.volunteer_id
    WHERE a.date BETWEEN ${range.from} AND ${range.to}`;
}
