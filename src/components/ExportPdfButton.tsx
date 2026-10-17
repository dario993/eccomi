"use client";

import { useState } from "react";
import { formatDateIt, todayZurich } from "@/lib/dates";
import { MARK, summaryToTable } from "@/lib/pdfTable";
import type { Summary } from "@/lib/summary";

const BLUE: [number, number, number] = [0, 82, 214];
const INK: [number, number, number] = [11, 27, 51];

export async function buildPdf(summary: Summary) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const t = summaryToTable(summary);
  const doc = new jsPDF({ orientation: t.orientation, unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  doc.setFont("helvetica", "bold").setFontSize(20).setTextColor(...BLUE).text(t.title, 14, 18);
  doc.setFont("helvetica", "normal").setFontSize(12).setTextColor(...INK).text(t.subtitle, 14, 26);

  const centred = t.head.length > 2;
  const dense = t.head.length > 22; // a full month: shrink so every day fits on the page
  autoTable(doc, {
    startY: 32,
    head: [t.head],
    body: t.body.length ? t.body : [["Nessuna presenza nel periodo"]],
    theme: "plain",
    margin: { left: 14, right: 14 },
    styles: { font: "helvetica", fontSize: dense ? 8 : 10, textColor: INK, cellPadding: dense ? 1.2 : 2 },
    headStyles: { fillColor: BLUE, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [243, 246, 251] },
    columnStyles: centred ? { 0: { halign: "left", minCellWidth: 40 } } : {},
    didParseCell: (d) => {
      if (centred && d.column.index > 0) d.cell.styles.halign = "center";
      if (d.cell.raw === MARK) d.cell.text = []; // Helvetica has no bullet glyph: draw it instead
    },
    didDrawCell: (d) => {
      if (d.section === "body" && d.cell.raw === MARK) {
        doc.setFillColor(...BLUE).circle(d.cell.x + d.cell.width / 2, d.cell.y + d.cell.height / 2, 1.3, "F");
      }
    },
    didDrawPage: () => {
      doc.setFontSize(8).setTextColor(74, 90, 115).text(`Generato il ${formatDateIt(todayZurich(), "medium")}`, 14, pageH - 8);
      doc.text(`Pagina ${doc.getNumberOfPages()}`, pageW - 14, pageH - 8, { align: "right" });
    },
  });
  return { doc, filename: t.filename };
}

export function ExportPdfButton({ summary }: { summary: Summary }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  return (
    <div>
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(false);
          try {
            const { doc, filename } = await buildPdf(summary);
            doc.save(filename);
          } catch {
            setError(true);
          } finally {
            setBusy(false);
          }
        }}
        className="h-12 w-full bg-blue font-semibold text-white active:bg-blue-deep disabled:opacity-60"
      >
        {busy ? "Preparo il PDF…" : "Esporta PDF"}
      </button>
      {error && <p role="alert" className="mt-2 text-danger">PDF non creato. Riprova.</p>}
    </div>
  );
}
