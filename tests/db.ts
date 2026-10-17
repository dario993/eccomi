import postgres from "postgres";
import { applySchema } from "@/lib/schema";

export const testSql = postgres(process.env.TEST_DATABASE_URL!, { onnotice: () => {} });

let ready: Promise<void> | undefined;

// Recreates the schema once per run (drops existing tables first).
function ensureSchema() {
  ready ??= (async () => {
    await testSql`DROP TABLE IF EXISTS group_members, groups, attendances, volunteers`;
    await applySchema(testSql);
  })();
  return ready;
}

export async function resetDb() {
  await ensureSchema();
  await testSql`TRUNCATE group_members, groups, attendances, volunteers RESTART IDENTITY`;
}
