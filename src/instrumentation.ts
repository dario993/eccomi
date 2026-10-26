export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const [{ sql }, { applySchema }] = await Promise.all([import("./lib/db"), import("./lib/schema")]);
  // On host/Docker restart both containers start together (depends_on is ignored), so wait for Postgres.
  for (let attempt = 1; ; attempt++) {
    try {
      return await applySchema(sql);
    } catch (e) {
      if (attempt >= 30) throw e;
      console.warn(`Database non pronto (tentativo ${attempt}/30): ${(e as Error).message}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}
