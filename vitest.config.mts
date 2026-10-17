import { defineConfig } from "vitest/config";
import path from "node:path";

const testDb =
  process.env.TEST_DATABASE_URL ?? `postgres://${process.env.USER}@localhost:5432/eccomi_test`;

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: {
    env: { DATABASE_URL: testDb, TEST_DATABASE_URL: testDb },
    fileParallelism: false,
  },
});
