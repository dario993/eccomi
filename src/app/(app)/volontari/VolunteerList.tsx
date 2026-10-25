"use client";

import { useState } from "react";
import { fold } from "@/components/AttendanceList";
import type { Group, Volunteer } from "@/lib/db";
import { VolunteerRow } from "./VolunteerRow";

export function VolunteerList({ volunteers, groups }: { volunteers: Volunteer[]; groups: Group[] }) {
  const [query, setQuery] = useState("");
  const q = fold(query.trim());
  const shown = q ? volunteers.filter((v) => fold(`${v.first_name} ${v.last_name}`).includes(q)) : volunteers;

  return (
    <>
      {volunteers.length > 0 && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca un nome"
          aria-label="Cerca un nome"
          className="mt-10 h-12 w-full bg-surface px-4 text-base outline-none focus:bg-white"
        />
      )}
      <ul className="mt-4 flex flex-col gap-1">
        {shown.map((v) => <VolunteerRow key={v.id} v={v} groups={groups} />)}
        {q && shown.length === 0 && <li className="py-6 text-muted">Nessun nome corrisponde a “{query}”.</li>}
      </ul>
    </>
  );
}
