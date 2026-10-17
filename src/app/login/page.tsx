"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-between px-5 pb-10 pt-16">
      <div>
        <h1 className="text-6xl font-bold tracking-[-0.04em] text-blue">Eccomi</h1>
        <p className="mt-3 text-lg text-muted">Presenze dei volontari di Dare.</p>
      </div>
      <form action={action} className="flex flex-col gap-3">
        <label htmlFor="password" className="text-base font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          className="h-14 bg-surface px-4 text-lg outline-none focus:bg-white"
        />
        {error && <p role="alert" className="text-danger">{error}. Riprova.</p>}
        <button
          disabled={pending}
          className="mt-2 h-14 bg-blue text-lg font-semibold text-white active:bg-blue-deep disabled:opacity-60"
        >
          {pending ? "Accesso…" : "Entra"}
        </button>
      </form>
    </main>
  );
}
