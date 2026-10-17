import { Fragment } from "react";
import { summaryToTable } from "@/lib/pdfTable";
import type { Summary } from "@/lib/summary";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function GroupTitle({ title }: { title: string | null }) {
  return title === null ? null : <h3 className="mt-6 mb-2 text-lg font-bold text-blue">{title}</h3>;
}

export function SummaryView({ summary }: { summary: Summary }) {
  if (summary.mode === "day") {
    return (
      <>
        <p className="text-lg text-muted">{plural(summary.present, "presente", "presenti")}</p>
        {summary.sections.length === 0 ? (
          <Empty />
        ) : (
          summary.sections.map((s, k) => (
            <section key={k} className="mt-4">
              <GroupTitle title={s.title} />
              <ul className="flex flex-col gap-1">
                {s.names.map((n, i) => (
                  <li key={i} className="bg-white px-4 py-3 text-lg">{n}</li>
                ))}
              </ul>
            </section>
          ))
        )}
      </>
    );
  }

  if (summary.sections.length === 0) return <Empty />;

  if (summary.mode === "totals") {
    return summary.sections.map((s, k) => (
      <section key={k}>
        <GroupTitle title={s.title} />
        <ul className="flex flex-col gap-1">
          {s.rows.map((r, i) => (
            <li key={i} className="flex justify-between bg-white px-4 py-3 text-lg">
              <span>{r.name}</span>
              <span className="font-semibold text-blue">{plural(r.total, "giorno", "giorni")}</span>
            </li>
          ))}
        </ul>
      </section>
    ));
  }

  const span = summary.days.length + 2;
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
          {summary.sections.map((s, k) => (
            <Fragment key={k}>
              {s.title !== null && (
                <tr>
                  <th scope="colgroup" colSpan={span} className="sticky left-0 pt-5 pb-1 text-left text-lg font-bold text-blue">
                    {s.title}
                  </th>
                </tr>
              )}
              {s.rows.map((r, i) => (
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
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Empty() {
  return <p className="mt-4 text-lg text-muted">Nessuna presenza nel periodo. Scegli un altro periodo qui sopra.</p>;
}
