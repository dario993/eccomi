"use client";

import { useActionState, useState, useTransition } from "react";
import type { Group } from "@/lib/db";
import { addGroupAction, deleteGroupAction, renameGroupAction } from "./actions";

export function GroupsPanel({ groups }: { groups: Group[] }) {
  const [result, action, pending] = useActionState(addGroupAction, null);
  return (
    <details className="bg-surface">
      <summary className="cursor-pointer px-4 py-4 text-base font-medium">Gruppi ({groups.length})</summary>
      <div className="flex flex-col gap-2 px-4 pb-4">
        <p className="text-muted">Per assegnare i gruppi tocca il nome di un volontario.</p>
        <form action={action} className="flex gap-2">
          <input name="name" placeholder="Nuovo gruppo" aria-label="Nome del gruppo" required className="h-12 min-w-0 flex-1 bg-white px-3 text-base" />
          <button disabled={pending} className="h-12 shrink-0 bg-blue px-4 font-semibold text-white active:bg-blue-deep">Crea</button>
        </form>
        {result && <p role="status" className={result.ok ? "text-blue" : "text-danger"}>{result.message}</p>}
        <ul className="mt-2 flex flex-col gap-1">
          {groups.map((g) => <GroupRow key={g.id} g={g} />)}
        </ul>
      </div>
    </details>
  );
}

function GroupRow({ g }: { g: Group }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!editing) {
    return (
      <li>
        <button onClick={() => setEditing(true)} aria-label={`Modifica gruppo ${g.name}`} className="min-h-12 w-full bg-white px-4 py-3 text-left text-lg">
          {g.name}
        </button>
      </li>
    );
  }

  return (
    <li className="bg-white p-3">
      <form
        action={(fd) =>
          start(async () => {
            const res = await renameGroupAction(g.id, String(fd.get("name")));
            if (res) setError(res.message);
            else setEditing(false);
          })
        }
        className="grid grid-cols-3 gap-2"
      >
        <input name="name" defaultValue={g.name} aria-label="Nome del gruppo" required autoFocus className="col-span-3 h-12 bg-ground px-3 text-base" />
        {error && <p role="alert" className="col-span-3 text-danger">{error}</p>}
        <button disabled={pending} className="h-12 bg-blue font-semibold text-white">Salva</button>
        <button type="button" onClick={() => { setEditing(false); setError(null); }} className="h-12 bg-surface font-medium">
          Annulla
        </button>
        <button type="button" disabled={pending} onClick={() => start(() => deleteGroupAction(g.id))} className="h-12 bg-surface font-medium text-danger">
          Elimina
        </button>
      </form>
    </li>
  );
}
