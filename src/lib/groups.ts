import { sql, type Group } from "./db";
import { clean, collator, isDuplicate } from "./volunteers";

export async function listGroups(): Promise<Group[]> {
  const rows = await sql<Group[]>`SELECT id, name FROM groups`;
  return [...rows].sort((a, b) => collator.compare(a.name, b.name));
}

export async function addGroup(name: string): Promise<"ok" | "duplicate"> {
  try {
    await sql`INSERT INTO groups (name) VALUES (${clean(name)})`;
    return "ok";
  } catch (e) {
    if (isDuplicate(e)) return "duplicate";
    throw e;
  }
}

export async function renameGroup(id: number, name: string): Promise<"ok" | "duplicate"> {
  try {
    await sql`UPDATE groups SET name = ${clean(name)} WHERE id = ${id}`;
    return "ok";
  } catch (e) {
    if (isDuplicate(e)) return "duplicate";
    throw e;
  }
}

/** Memberships go with the group; volunteers and attendances stay. */
export async function deleteGroup(id: number): Promise<void> {
  await sql`DELETE FROM groups WHERE id = ${id}`;
}

export async function setVolunteerGroups(volunteerId: number, groupIds: number[]): Promise<void> {
  await sql.begin(async (tx) => {
    await tx`DELETE FROM group_members WHERE volunteer_id = ${volunteerId}`;
    for (const g of groupIds) {
      await tx`INSERT INTO group_members (group_id, volunteer_id) VALUES (${g}, ${volunteerId})`;
    }
  });
}
