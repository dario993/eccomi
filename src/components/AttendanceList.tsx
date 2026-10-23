"use client";

import { useOptimistic, useState, useTransition } from "react";
import { togglePresence } from "@/app/(app)/actions";
import type { Volunteer } from "@/lib/db";

const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function AttendanceList({
  volunteers,
  presentIds,
  weekday,
}: {
  volunteers: Volunteer[];
  presentIds: number[];
  weekday: number;
}) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();
  const [present, setOptimistic] = useOptimistic(
    new Set(presentIds),
    (set: Set<number>, change: { id: number; present: boolean }) => {
      const next = new Set(set);
      if (change.present) next.add(change.id);
      else next.delete(change.id);
      return next;
    },
  );

  const tap = (id: number) => {
    const change = { id, present: !present.has(id) };
    setError(null);
    start(async () => {
      setOptimistic(change);
      try {
        await togglePresence(change.id, change.present);
      } catch {
        setError("Presenza non salvata. Controlla la connessione e tocca di nuovo.");
      }
    });
  };

  const q = fold(query.trim());
  // Expected today, plus anyone already marked present (so an off-day arrival doesn't vanish).
  const expected = volunteers.filter((v) => v.weekdays.includes(weekday) || presentIds.includes(v.id));
  const base = showAll ? volunteers : expected;
  const shown = q ? base.filter((v) => fold(`${v.first_name} ${v.last_name}`).includes(q)) : base;
  const count = expected.filter((v) => present.has(v.id)).length;

  return (
    <>
      <p className="mt-2 text-lg text-muted">
        <span className="font-semibold text-ink">{count}</span> {count === 1 ? "presente" : "presenti"} su{" "}
        {expected.length} {expected.length === 1 ? "previsto" : "previsti"}
      </p>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cerca un nome"
        aria-label="Cerca un nome"
        className="mt-6 h-12 w-full bg-surface px-4 text-base outline-none focus:bg-white"
      />
      <label className="mt-2 flex min-h-12 items-center gap-3 text-base">
        <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="size-5 accent-blue-deep" />
        Mostra anche chi non è previsto oggi
      </label>
      {error && <p role="alert" className="mt-3 text-danger">{error}</p>}
      <ul className="mt-4 flex flex-col gap-1">
        {shown.map((v) => {
          const on = present.has(v.id);
          return (
            <li key={v.id}>
              <button
                onClick={() => tap(v.id)}
                aria-pressed={on}
                className={`flex min-h-16 w-full items-center justify-between px-4 text-left text-xl transition-colors duration-150 ${
                  on ? "bg-blue text-white" : "bg-white active:bg-surface"
                }`}
              >
                <span>
                  {v.first_name} {v.last_name}
                </span>
                {on && <span className="text-base font-semibold">Eccomi</span>}
              </button>
            </li>
          );
        })}
        {shown.length === 0 && (
          <li className="py-6 text-muted">
            {q ? `Nessun nome corrisponde a “${query}”.` : "Nessuno previsto per oggi."}
            {!showAll && " Spunta “Mostra anche chi non è previsto oggi” per vedere tutti."}
          </li>
        )}
      </ul>
    </>
  );
}
