import postgres from "postgres";
import { readFileSync } from "node:fs";

export const testSql = postgres(process.env.TEST_DATABASE_URL!, { onnotice: () => {} });

let ready: Promise<void> | undefined;

// Applies db/init/01-schema.sql once per run (drops existing tables first).
function ensureSchema() {
  ready ??= (async () => {
    await testSql`DROP TABLE IF EXISTS attendances, volunteers`;
    await testSql.unsafe(readFileSync("db/init/01-schema.sql", "utf8"));
  })();
  return ready;
}

export async function resetDb() {
  await ensureSchema();
  await testSql`TRUNCATE attendances, volunteers RESTART IDENTITY`;
}
