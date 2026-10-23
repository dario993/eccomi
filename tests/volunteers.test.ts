import { beforeEach, expect, test } from "vitest";
import { resetDb } from "./db";
import { addVolunteer, deleteVolunteer, importVolunteers, listVolunteers, setActive, setWeekdays, updateVolunteer } from "@/lib/volunteers";
import { addGroup, listGroups, setVolunteerGroups } from "@/lib/groups";
import { presentIds, setPresent } from "@/lib/attendance";

beforeEach(resetDb);

test("import skips names already present", async () => {
  expect(await importVolunteers("Anna Rossi\nLuca Bianchi")).toEqual({ imported: 2, skipped: 0 });
  expect(await importVolunteers("ANNA ROSSI\nSara Neri")).toEqual({ imported: 1, skipped: 1 });
});

test("add and update report duplicates", async () => {
  await importVolunteers("Anna Rossi\nLuca Bianchi");
  expect(await addVolunteer("anna", "rossi")).toBe("duplicate");
  expect(await addVolunteer("  Sara ", " Neri ")).toBe("ok");
  const luca = (await listVolunteers()).find((v) => v.first_name === "Luca")!;
  expect(await updateVolunteer(luca.id, "Anna", "Rossi")).toBe("duplicate");
  expect(await updateVolunteer(luca.id, "Luca", "Verdi")).toBe("ok");
});

test("list is sorted by first name with Italian collation", async () => {
  await importVolunteers("Zoe Blu\nLuca Bianchi\nÉlise Neri\nAnna Rossi\nanna Bianchi");
  expect((await listVolunteers()).map((v) => `${v.first_name} ${v.last_name}`)).toEqual([
    "anna Bianchi", "Anna Rossi", "Élise Neri", "Luca Bianchi", "Zoe Blu",
  ]);
});

test("inactive volunteers are hidden only from the active list", async () => {
  await importVolunteers("Anna Rossi\nLuca Bianchi");
  const anna = (await listVolunteers())[0];
  await setActive(anna.id, false);
  expect((await listVolunteers({ activeOnly: true })).map((v) => v.first_name)).toEqual(["Luca"]);
  expect(await listVolunteers()).toHaveLength(2);
});

test("delete removes the volunteer with attendances and group memberships, keeps the others", async () => {
  await importVolunteers("Anna Rossi\nLuca Bianchi");
  await addGroup("Cucina");
  const [cucina] = await listGroups();
  const [anna, luca] = await listVolunteers();
  await setVolunteerGroups(anna.id, [cucina.id]);
  await setPresent(anna.id, "2026-10-01", true);
  await setPresent(luca.id, "2026-10-01", true);

  await deleteVolunteer(anna.id);

  expect((await listVolunteers()).map((v) => v.first_name)).toEqual(["Luca"]);
  expect([...(await presentIds("2026-10-01"))]).toEqual([luca.id]);
  expect(await listGroups()).toHaveLength(1);
  expect(await addVolunteer("Anna", "Rossi")).toBe("ok");
});

test("weekdays default to every day and can be changed (invalid values dropped)", async () => {
  await addVolunteer("Anna", "Rossi");
  const [anna] = await listVolunteers();
  expect(anna.weekdays).toEqual([1, 2, 3, 4, 5, 6, 7]);
  await setWeekdays(anna.id, [3, 1, 9, 0, 3]);
  expect((await listVolunteers())[0].weekdays).toEqual([1, 3]);
});
