import { beforeEach, expect, test } from "vitest";
import { resetDb } from "./db";
import { addVolunteer, importVolunteers, listVolunteers, setActive, updateVolunteer } from "@/lib/volunteers";

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
