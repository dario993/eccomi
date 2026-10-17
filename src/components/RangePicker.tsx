import Link from "next/link";
import { shortcutRange, type Range } from "@/lib/range";

const SHORTCUTS = [
  { kind: "today", label: "Oggi" },
  { kind: "week", label: "Questa settimana" },
  { kind: "month", label: "Questo mese" },
] as const;

// Plain links and a GET form: the period lives in the URL, no client JS needed.
export function RangePicker({ range, today }: { range: Range; today: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {SHORTCUTS.map(({ kind, label }) => {
          const r = shortcutRange(kind, today);
          const active = r.from === range.from && r.to === range.to;
          return (
            <Link
              key={kind}
              href={`/riepilogo?from=${r.from}&to=${r.to}`}
              aria-current={active ? "true" : undefined}
              className={`flex h-11 items-center px-4 text-base font-medium ${active ? "bg-blue text-white" : "bg-surface"}`}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <form action="/riepilogo" className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-sm text-muted">
          Da
          <input type="date" name="from" defaultValue={range.from} required className="h-11 w-full min-w-0 bg-white px-2 text-base text-ink" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          A
          <input type="date" name="to" defaultValue={range.to} required className="h-11 w-full min-w-0 bg-white px-2 text-base text-ink" />
        </label>
        <button className="col-span-2 h-11 bg-ink font-semibold text-white">Mostra il periodo</button>
      </form>
    </div>
  );
}
