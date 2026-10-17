import { sql, type Volunteer } from "./db";
import { parseNameList } from "./import";

const collator = new Intl.Collator("it", { sensitivity: "base" });

export function compareVolunteers(
  a: { first_name: string; last_name: string },
  b: { first_name: string; last_name: string },
): number {
  return collator.compare(a.first_name, b.first_name) || collator.compare(a.last_name, b.last_name);
}

const clean = (s: string) => s.trim().replace(/\s+/g, " ");

const isDuplicate = (e: unknown) => (e as { code?: string }).code === "23505";

export async function listVolunteers(opts: { activeOnly?: boolean } = {}): Promise<Volunteer[]> {
  const rows = await sql<Volunteer[]>`
    SELECT id, first_name, last_name, active FROM volunteers
    ${opts.activeOnly ? sql`WHERE active` : sql``}`;
  return [...rows].sort(compareVolunteers);
}

export async function addVolunteer(first: string, last: string): Promise<"ok" | "duplicate"> {
  try {
    await sql`INSERT INTO volunteers (first_name, last_name) VALUES (${clean(first)}, ${clean(last)})`;
    return "ok";
  } catch (e) {
    if (isDuplicate(e)) return "duplicate";
    throw e;
  }
}

export async function updateVolunteer(id: number, first: string, last: string): Promise<"ok" | "duplicate"> {
  try {
    await sql`UPDATE volunteers SET first_name = ${clean(first)}, last_name = ${clean(last)} WHERE id = ${id}`;
    return "ok";
  } catch (e) {
    if (isDuplicate(e)) return "duplicate";
    throw e;
  }
}

export async function setActive(id: number, active: boolean): Promise<void> {
  await sql`UPDATE volunteers SET active = ${active} WHERE id = ${id}`;
}

export async function importVolunteers(text: string): Promise<{ imported: number; skipped: number }> {
  const entries = parseNameList(text);
  let imported = 0;
  for (const e of entries) {
    const res = await sql`
      INSERT INTO volunteers (first_name, last_name) VALUES (${e.first_name}, ${e.last_name})
      ON CONFLICT DO NOTHING`;
    imported += res.count;
  }
  return { imported, skipped: entries.length - imported };
}
