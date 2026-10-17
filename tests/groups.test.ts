import { beforeEach, expect, test } from "vitest";
import { resetDb } from "./db";
import { addGroup, deleteGroup, listGroups, renameGroup, setVolunteerGroups } from "@/lib/groups";
import { importVolunteers, listVolunteers } from "@/lib/volunteers";

beforeEach(resetDb);

test("groups are sorted, trimmed and unique ignoring case", async () => {
  expect(await addGroup("  Cucina ")).toBe("ok");
  expect(await addGroup("autisti")).toBe("ok");
  expect(await addGroup("CUCINA")).toBe("duplicate");
  expect((await listGroups()).map((g) => g.name)).toEqual(["autisti", "Cucina"]);
  const [autisti] = await listGroups();
  expect(await renameGroup(autisti.id, "cucina")).toBe("duplicate");
  expect(await renameGroup(autisti.id, "Autisti")).toBe("ok");
});

test("a volunteer can belong to several groups; deleting a group keeps the volunteer", async () => {
  await importVolunteers("Anna Rossi");
  await addGroup("Cucina");
  await addGroup("Autisti");
  const [autisti, cucina] = await listGroups();
  const [anna] = await listVolunteers();
  expect(anna.group_ids).toEqual([]);

  await setVolunteerGroups(anna.id, [cucina.id, autisti.id]);
  expect((await listVolunteers())[0].group_ids.sort()).toEqual([autisti.id, cucina.id].sort());

  await setVolunteerGroups(anna.id, [cucina.id]);
  expect((await listVolunteers())[0].group_ids).toEqual([cucina.id]);

  await deleteGroup(cucina.id);
  expect(await listVolunteers()).toMatchObject([{ first_name: "Anna", group_ids: [] }]);
});
