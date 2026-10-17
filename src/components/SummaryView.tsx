import { summaryToTable } from "@/lib/pdfTable";
import type { Summary } from "@/lib/summary";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function SummaryView({ summary }: { summary: Summary }) {
  if (summary.mode === "day") {
    return (
      <>
        <p className="text-lg text-muted">{plural(summary.names.length, "presente", "presenti")}</p>
        {summary.names.length === 0 ? (
          <Empty />
        ) : (
          <ul className="mt-4 flex flex-col gap-1">
            {summary.names.map((n, i) => (
              <li key={i} className="bg-white px-4 py-3 text-lg">{n}</li>
            ))}
          </ul>
        )}
      </>
    );
  }

  if (summary.rows.length === 0) return <Empty />;

  if (summary.mode === "totals") {
    return (
      <ul className="flex flex-col gap-1">
        {summary.rows.map((r, i) => (
          <li key={i} className="flex justify-between bg-white px-4 py-3 text-lg">
            <span>{r.name}</span>
            <span className="font-semibold text-blue">{plural(r.total, "giorno", "giorni")}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className="border-separate border-spacing-y-1 text-base tabular-nums">
        <thead>
          <tr className="text-sm text-muted">
            <th scope="col" className="sticky left-0 bg-ground py-2 pr-3 text-left font-medium">Volontario</th>
            {/* Same day labels as the PDF */}
            {summaryToTable(summary).head.slice(1, -1).map((label, i) => (
              <th key={summary.days[i]} scope="col" className="px-2 py-2 font-medium">{label}</th>
            ))}
            <th scope="col" className="px-3 py-2 text-right font-medium">Totale</th>
          </tr>
        </thead>
        <tbody>
          {summary.rows.map((r, i) => (
            <tr key={i} className="bg-white">
              <th scope="row" className="sticky left-0 whitespace-nowrap bg-white py-3 pl-3 pr-4 text-left font-normal">
                {r.name}
              </th>
              {r.marks.map((m, j) => (
                <td key={j} className="px-2 text-center">
                  {m ? <span aria-label="presente" className="inline-block size-3 rounded-full bg-blue" /> : null}
                </td>
              ))}
              <td className="px-3 text-right font-semibold text-blue">{r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Empty() {
  return <p className="mt-4 text-lg text-muted">Nessuna presenza nel periodo. Scegli un altro periodo qui sopra.</p>;
}
