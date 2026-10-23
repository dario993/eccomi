"use client";

import { useState, useTransition } from "react";
import type { Group, Volunteer } from "@/lib/db";
import { deleteVolunteerAction, setActiveAction, updateAction } from "./actions";

const DAYS = ["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"]; // index + 1 = ISO weekday

export function VolunteerRow({ v, groups }: { v: Volunteer; groups: Group[] }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  // 0 = no delete in progress, 1 = warning shown, 2 = final confirmation.
  const [confirmStep, setConfirmStep] = useState(0);
  const name = `${v.first_name} ${v.last_name}`.trim();

  if (editing) {
    return (
      <li className="bg-white p-4">
        <form
          action={(fd) =>
            start(async () => {
              const res = await updateAction(
                v.id,
                String(fd.get("first_name")),
                String(fd.get("last_name")),
                fd.getAll("group").map(Number),
                fd.getAll("weekday").map(Number),
              );
              if (res) setError(res.message);
              else setEditing(false);
            })
          }
          className="grid grid-cols-2 gap-2"
        >
          <input name="first_name" defaultValue={v.first_name} aria-label="Nome" required autoFocus className="h-12 bg-ground px-3 text-base" />
          <input name="last_name" defaultValue={v.last_name} aria-label="Cognome" className="h-12 bg-ground px-3 text-base" />
          <fieldset className="col-span-2 mt-2">
            <legend className="mb-1 text-muted">Giorni in cui è previsto</legend>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map((d, i) => (
                <label key={d} className="flex min-h-12 items-center justify-center bg-ground font-medium has-checked:bg-blue has-checked:text-white">
                  <input type="checkbox" name="weekday" value={i + 1} defaultChecked={v.weekdays.includes(i + 1)} className="sr-only" />
                  {d}
                </label>
              ))}
            </div>
          </fieldset>
          {groups.length > 0 && (
            <fieldset className="col-span-2 mt-2">
              <legend className="mb-1 text-muted">Gruppi</legend>
              <div className="flex flex-wrap gap-2">
                {groups.map((g) => (
                  <label key={g.id} className="flex min-h-12 items-center gap-2 bg-ground px-3 has-checked:bg-blue has-checked:text-white">
                    <input type="checkbox" name="group" value={g.id} defaultChecked={v.group_ids.includes(g.id)} className="size-5 accent-blue-deep" />
                    {g.name}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {error && <p role="alert" className="col-span-2 text-danger">{error}</p>}
          <button disabled={pending} className="h-12 bg-blue font-semibold text-white">Salva</button>
          <button type="button" onClick={() => { setEditing(false); setError(null); setConfirmStep(0); }} className="h-12 bg-surface font-medium">
            Annulla
          </button>
          {confirmStep === 0 ? (
            <button type="button" onClick={() => setConfirmStep(1)} className="col-span-2 mt-4 h-12 bg-surface font-medium text-danger">
              Elimina volontario
            </button>
          ) : (
            <div role="alertdialog" aria-label={`Elimina ${name}`} className="col-span-2 mt-4 flex flex-col gap-3 bg-danger p-4 text-white">
              {confirmStep === 1 ? (
                <p>
                  Stai per eliminare <strong>{name}</strong>. Verranno cancellate anche <strong>tutte le sue presenze</strong>,
                  anche nei riepiloghi passati. L&apos;operazione è irreversibile.
                  <span className="mt-2 block">Se vuoi solo toglierlo da Presenze, usa invece &ldquo;Non attivo&rdquo;.</span>
                </p>
              ) : (
                <p className="font-semibold">Ultima conferma: {name} e il suo storico verranno eliminati definitivamente.</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setConfirmStep(0)} className="h-12 bg-white font-medium text-ink">
                  Annulla
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => (confirmStep === 1 ? setConfirmStep(2) : start(() => deleteVolunteerAction(v.id)))}
                  className="h-12 bg-ink font-semibold text-white"
                >
                  {confirmStep === 1 ? "Continua" : "Elimina definitivamente"}
                </button>
              </div>
            </div>
          )}
        </form>
      </li>
    );
  }

  return (
    <li className={`flex items-center gap-2 ${v.active ? "bg-white" : "bg-surface"}`}>
      <button
        onClick={() => setEditing(true)}
        className={`min-h-14 flex-1 px-4 py-3 text-left text-lg ${v.active ? "" : "text-muted"}`}
        aria-label={`Modifica ${v.first_name} ${v.last_name}`}
      >
        {v.first_name} {v.last_name}
        {v.weekdays.length < 7 && (
          <span className="block text-sm text-muted">
            {v.weekdays.length === 0 ? "Nessun giorno" : v.weekdays.map((d) => DAYS[d - 1]).join(", ")}
          </span>
        )}
        {v.group_ids.length > 0 && (
          <span className="block text-sm text-muted">
            {groups.filter((g) => v.group_ids.includes(g.id)).map((g) => g.name).join(", ")}
          </span>
        )}
      </button>
      <button
        aria-pressed={v.active}
        disabled={pending}
        onClick={() => start(() => setActiveAction(v.id, !v.active))}
        className={`mr-2 h-10 w-28 shrink-0 text-sm font-semibold ${
          v.active ? "bg-surface text-blue" : "bg-white text-muted"
        }`}
      >
        {v.active ? "Attivo" : "Non attivo"}
      </button>
    </li>
  );
}
