import { ExportPdfButton } from "@/components/ExportPdfButton";
import { RangePicker } from "@/components/RangePicker";
import { SummaryView } from "@/components/SummaryView";
import { formatRangeIt, todayZurich } from "@/lib/dates";
import { parseRange } from "@/lib/range";
import { buildSummary, loadAttendances } from "@/lib/summary";

export default async function RiepilogoPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const today = todayZurich();
  const range = parseRange(await searchParams, today);
  const summary = buildSummary(range, await loadAttendances(range));
  return (
    <>
      <h1 className="text-4xl font-bold tracking-[-0.03em]">Riepilogo</h1>
      <div className="mt-6">
        <RangePicker range={range} today={today} />
      </div>
      <h2 className="mt-10 text-2xl font-bold tracking-[-0.02em] first-letter:uppercase">{formatRangeIt(range.from, range.to)}</h2>
      <div className="mt-2">
        <SummaryView summary={summary} />
      </div>
      <div className="mt-8">
        <ExportPdfButton summary={summary} />
      </div>
    </>
  );
}
