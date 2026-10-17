import { beforeEach, expect, test } from "vitest";
import { resetDb, testSql } from "./db";

beforeEach(resetDb);

test("a volunteer can be present only once per day", async () => {
  const [{ id }] = await testSql`INSERT INTO volunteers (first_name, last_name) VALUES ('Anna', 'Rossi') RETURNING id`;
  await testSql`INSERT INTO attendances (volunteer_id, date) VALUES (${id}, '2026-10-17')`;
  await expect(
    testSql`INSERT INTO attendances (volunteer_id, date) VALUES (${id}, '2026-10-17')`,
  ).rejects.toMatchObject({ code: "23505" });
});

test("volunteer names are unique ignoring case", async () => {
  await testSql`INSERT INTO volunteers (first_name, last_name) VALUES ('Anna', 'Rossi')`;
  await expect(
    testSql`INSERT INTO volunteers (first_name, last_name) VALUES ('anna', 'ROSSI')`,
  ).rejects.toMatchObject({ code: "23505" });
});
