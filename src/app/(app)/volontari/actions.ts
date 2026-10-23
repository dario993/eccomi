"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/session";
import { addGroup, deleteGroup, renameGroup, setVolunteerGroups } from "@/lib/groups";
import { addVolunteer, deleteVolunteer, importVolunteers, setActive, setWeekdays, updateVolunteer } from "@/lib/volunteers";

const refresh = () => {
  revalidatePath("/volontari");
  revalidatePath("/");
};

export type FormResult = { ok: boolean; message: string } | null;

export async function addAction(_prev: FormResult, formData: FormData): Promise<FormResult> {
  await requireAuth();
  const first = String(formData.get("first_name") ?? "").trim();
  const last = String(formData.get("last_name") ?? "");
  if (!first) return { ok: false, message: "Inserisci almeno il nome." };
  const res = await addVolunteer(first, last);
  refresh();
  return res === "ok"
    ? { ok: true, message: `${first} aggiunto all'elenco.` }
    : { ok: false, message: "Questa persona è già nell'elenco." };
}

export async function importAction(_prev: FormResult, formData: FormData): Promise<FormResult> {
  await requireAuth();
  const { imported, skipped } = await importVolunteers(String(formData.get("list") ?? ""));
  refresh();
  return { ok: true, message: `Importati ${imported}, già presenti ${skipped}.` };
}

export async function updateAction(
  id: number,
  first: string,
  last: string,
  groupIds: number[],
  weekdays: number[],
): Promise<FormResult> {
  await requireAuth();
  if (!first.trim()) return { ok: false, message: "Il nome non può essere vuoto." };
  const res = await updateVolunteer(id, first, last);
  if (res === "ok") {
    await setVolunteerGroups(id, groupIds.filter(Number.isInteger));
    await setWeekdays(id, weekdays);
  }
  refresh();
  return res === "ok" ? null : { ok: false, message: "Esiste già una persona con questo nome." };
}

export async function addGroupAction(_prev: FormResult, formData: FormData): Promise<FormResult> {
  await requireAuth();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, message: "Inserisci il nome del gruppo." };
  const res = await addGroup(name);
  refresh();
  return res === "ok"
    ? { ok: true, message: `Gruppo ${name} creato. Assegnalo toccando un volontario.` }
    : { ok: false, message: "Esiste già un gruppo con questo nome." };
}

export async function renameGroupAction(id: number, name: string): Promise<FormResult> {
  await requireAuth();
  if (!name.trim()) return { ok: false, message: "Il nome non può essere vuoto." };
  const res = await renameGroup(id, name);
  refresh();
  return res === "ok" ? null : { ok: false, message: "Esiste già un gruppo con questo nome." };
}

export async function deleteGroupAction(id: number): Promise<void> {
  await requireAuth();
  await deleteGroup(id);
  refresh();
}

export async function setActiveAction(id: number, active: boolean): Promise<void> {
  await requireAuth();
  await setActive(id, active);
  refresh();
}

export async function deleteVolunteerAction(id: number): Promise<void> {
  await requireAuth();
  await deleteVolunteer(id);
  refresh();
  revalidatePath("/riepilogo");
}
