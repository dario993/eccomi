import { beforeEach, expect, test } from "vitest";
import { resetDb } from "./db";
import { buildSummary, loadAttendances, type AttendanceRow } from "@/lib/summary";
import { setPresent } from "@/lib/attendance";
import { importVolunteers, listVolunteers, setActive } from "@/lib/volunteers";
import { addGroup, listGroups, setVolunteerGroups } from "@/lib/groups";

const row = (volunteer_id: number, first_name: string, last_name: string, date: string, groups: string[] = []): AttendanceRow => ({
  volunteer_id, first_name, last_name, date, groups,
});

test("single day lists present names sorted", () => {
  const s = buildSummary({ from: "2026-10-17", to: "2026-10-17" }, [
    row(2, "Zoe", "Bianchi", "2026-10-17"),
    row(1, "Anna", "Rossi", "2026-10-17"),
  ]);
  expect(s).toEqual({
    mode: "day",
    range: { from: "2026-10-17", to: "2026-10-17" },
    present: 2,
    sections: [{ title: null, names: ["Anna Rossi", "Zoe Bianchi"] }],
  });
});

test("up to 31 days gives a grid with only days that had someone", () => {
  const s = buildSummary({ from: "2026-10-01", to: "2026-10-31" }, [
    row(2, "Luca", "Bianchi", "2026-10-09"),
    row(1, "Anna", "Rossi", "2026-10-05"),
    row(1, "Anna", "Rossi", "2026-10-09"),
  ]);
  expect(s.mode).toBe("grid");
  if (s.mode !== "grid") return;
  expect(s.days).toEqual(["2026-10-05", "2026-10-09"]);
  expect(s.sections).toEqual([{
    title: null,
    rows: [
      { name: "Anna Rossi", marks: [true, true], total: 2 },
      { name: "Luca Bianchi", marks: [false, true], total: 1 },
    ],
  }]);
});

test("more than 31 days gives totals only", () => {
  const s = buildSummary({ from: "2026-10-01", to: "2026-11-01" }, [
    row(1, "Anna", "Rossi", "2026-10-05"),
    row(1, "Anna", "Rossi", "2026-11-01"),
  ]);
  expect(s).toEqual({
    mode: "totals",
    range: { from: "2026-10-01", to: "2026-11-01" },
    sections: [{ title: null, rows: [{ name: "Anna Rossi", total: 2 }] }],
  });
});

test("empty period and missing last name", () => {
  expect(buildSummary({ from: "2026-10-01", to: "2026-10-31" }, [])).toMatchObject({ mode: "grid", days: [], sections: [] });
  const s = buildSummary({ from: "2026-10-17", to: "2026-10-17" }, [row(1, "Pippo", "", "2026-10-17")]);
  expect(s).toMatchObject({ sections: [{ names: ["Pippo"] }] });
});

test("two volunteers with the same displayed name stay separate rows", () => {
  const s = buildSummary({ from: "2026-10-01", to: "2026-10-31" }, [
    row(1, "Anna", "Rossi", "2026-10-05"),
    row(2, "anna", "rossi", "2026-10-06"),
  ]);
  expect(s.mode === "grid" && s.sections[0].rows.length).toBe(2);
});

test("volunteers are listed under each of their groups, ungrouped last", () => {
  const s = buildSummary({ from: "2026-10-17", to: "2026-10-17" }, [
    row(1, "Anna", "Rossi", "2026-10-17", ["Cucina", "autisti"]),
    row(2, "Luca", "Bianchi", "2026-10-17", ["Cucina"]),
    row(3, "Zoe", "Neri", "2026-10-17"),
  ]);
  expect(s).toMatchObject({
    present: 3,
    sections: [
      { title: "autisti", names: ["Anna Rossi"] },
      { title: "Cucina", names: ["Anna Rossi", "Luca Bianchi"] },
      { title: "Senza gruppo", names: ["Zoe Neri"] },
    ],
  });
});

beforeEach(resetDb);

test("loadAttendances includes inactive volunteers and respects the range", async () => {
  await importVolunteers("Anna Rossi\nLuca Bianchi");
  const [anna, luca] = await listVolunteers();
  await setPresent(anna.id, "2026-10-05", true);
  await setPresent(luca.id, "2026-10-06", true);
  await setPresent(luca.id, "2026-11-01", true);
  await setActive(anna.id, false);
  const rows = await loadAttendances({ from: "2026-10-01", to: "2026-10-31" });
  expect(rows.map((r) => `${r.first_name} ${r.date}`).sort()).toEqual(["Anna 2026-10-05", "Luca 2026-10-06"]);
});

test("loadAttendances carries each volunteer's group names", async () => {
  await importVolunteers("Anna Rossi\nLuca Bianchi");
  await addGroup("Cucina");
  await addGroup("Autisti");
  const [anna, luca] = await listVolunteers();
  await setVolunteerGroups(anna.id, (await listGroups()).map((g) => g.id));
  await setPresent(anna.id, "2026-10-05", true);
  await setPresent(luca.id, "2026-10-05", true);
  const rows = await loadAttendances({ from: "2026-10-05", to: "2026-10-05" });
  expect(rows.map((r) => [r.first_name, [...r.groups].sort()]).sort()).toEqual([
    ["Anna", ["Autisti", "Cucina"]],
    ["Luca", []],
  ]);
});
