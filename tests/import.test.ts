import { expect, test } from "vitest";
import { parseNameList } from "@/lib/import";

test("splits lines into first name and the rest as last name", () => {
  expect(parseNameList("Anna Rossi\nLuca  Bianchi \n\n")).toEqual([
    { first_name: "Anna", last_name: "Rossi" },
    { first_name: "Luca", last_name: "Bianchi" },
  ]);
  expect(parseNameList("Maria Grazia Rossi")).toEqual([{ first_name: "Maria", last_name: "Grazia Rossi" }]);
  expect(parseNameList("Pippo")).toEqual([{ first_name: "Pippo", last_name: "" }]);
});

test("drops duplicates within the list ignoring case, and handles CRLF and blanks", () => {
  expect(parseNameList("Anna Rossi\r\nanna rossi")).toEqual([{ first_name: "Anna", last_name: "Rossi" }]);
  expect(parseNameList("  \t  ")).toEqual([]);
});
