export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const [{ sql }, { applySchema }] = await Promise.all([import("./lib/db"), import("./lib/schema")]);
  await applySchema(sql);
}
