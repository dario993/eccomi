import { sql } from "./db";

export async function presentIds(date: string): Promise<Set<number>> {
  const rows = await sql<{ volunteer_id: number }[]>`SELECT volunteer_id FROM attendances WHERE date = ${date}`;
  return new Set(rows.map((r) => r.volunteer_id));
}

/** Idempotent: marking an already-present volunteer (or unmarking an absent one) is a no-op. */
export async function setPresent(volunteerId: number, date: string, present: boolean): Promise<void> {
  if (present) {
    await sql`INSERT INTO attendances (volunteer_id, date) VALUES (${volunteerId}, ${date}) ON CONFLICT DO NOTHING`;
  } else {
    await sql`DELETE FROM attendances WHERE volunteer_id = ${volunteerId} AND date = ${date}`;
  }
}
