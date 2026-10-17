import { expect, test } from "vitest";
import { applySchema } from "@/lib/schema";
import { testSql } from "./db";

test("schema can be applied repeatedly on startup without losing data", async () => {
  await testSql`DROP TABLE IF EXISTS attendances, volunteers`;
  await applySchema(testSql);
  await testSql`INSERT INTO volunteers (first_name) VALUES ('Anna')`;
  await applySchema(testSql);
  expect((await testSql`SELECT first_name FROM volunteers`).map((r) => r.first_name)).toEqual(["Anna"]);
});
