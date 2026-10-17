"use client";

import { useActionState } from "react";
import { addAction, importAction, type FormResult } from "./actions";

function Message({ result }: { result: FormResult }) {
  if (!result) return null;
  return <p role="status" className={result.ok ? "text-blue" : "text-danger"}>{result.message}</p>;
}

export function AddVolunteerForm() {
  const [result, action, pending] = useActionState(addAction, null);
  return (
    <form action={action} className="grid grid-cols-2 gap-2">
      <input name="first_name" placeholder="Nome" aria-label="Nome" required className="h-12 bg-white px-3 text-base" />
      <input name="last_name" placeholder="Cognome" aria-label="Cognome" className="h-12 bg-white px-3 text-base" />
      <button disabled={pending} className="col-span-2 h-12 bg-blue font-semibold text-white active:bg-blue-deep">
        Aggiungi volontario
      </button>
      <div className="col-span-2"><Message result={result} /></div>
    </form>
  );
}

export function ImportForm() {
  const [result, action, pending] = useActionState(importAction, null);
  return (
    <details className="bg-surface">
      <summary className="cursor-pointer px-4 py-4 text-base font-medium">Incolla un elenco</summary>
      <form action={action} className="flex flex-col gap-2 px-4 pb-4">
        <label htmlFor="list" className="text-muted">Una persona per riga, nome e poi cognome.</label>
        <textarea id="list" name="list" rows={6} required className="bg-white p-3 text-base" placeholder={"Anna Rossi\nLuca Bianchi"} />
        <button disabled={pending} className="h-12 bg-blue font-semibold text-white">Importa elenco</button>
        <Message result={result} />
      </form>
    </details>
  );
}
