import { beforeEach, expect, test } from "vitest";
import { resetDb } from "./db";
import { presentIds, setPresent } from "@/lib/attendance";
import { importVolunteers, listVolunteers, setActive } from "@/lib/volunteers";

const D = "2026-10-17";
let id: number;

beforeEach(async () => {
  await resetDb();
  await importVolunteers("Anna Rossi");
  id = (await listVolunteers())[0].id;
});

test("marking present twice keeps one row", async () => {
  await setPresent(id, D, true);
  await setPresent(id, D, true);
  expect([...(await presentIds(D))]).toEqual([id]);
});

test("concurrent marks do not error", async () => {
  await Promise.all([setPresent(id, D, true), setPresent(id, D, true)]);
  expect((await presentIds(D)).size).toBe(1);
});

test("unmarking works and is idempotent", async () => {
  await setPresent(id, D, false);
  await setPresent(id, D, true);
  await setPresent(id, D, false);
  expect((await presentIds(D)).has(id)).toBe(false);
});

test("presence is per day", async () => {
  await setPresent(id, D, true);
  expect((await presentIds("2026-10-18")).size).toBe(0);
});

test("deactivating a volunteer keeps today's presence", async () => {
  await setPresent(id, D, true);
  await setActive(id, false);
  expect((await presentIds(D)).has(id)).toBe(true);
});
