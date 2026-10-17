# Architettura

Un'unica app Next.js 16 (App Router). Le pagine sono **server components** che leggono il DB direttamente; le scritture passano per **server actions**. Nessuna API REST, nessun ORM. `cacheComponents` è disattivato: tutte le pagine sono dinamiche.

## Struttura

```
src/
  app/
    layout.tsx               root: font Schibsted Grotesk, lang="it", metadata
    globals.css              token Tailwind (@theme) e regole base
    login/                   page.tsx (client, useActionState) + actions.ts (login, logout)
    (app)/                   route group autenticato
      layout.tsx             header + BottomNav; chiama requireAuth()
      page.tsx               Presenze
      actions.ts             togglePresence
      volontari/             page.tsx, actions.ts, VolunteerRow.tsx, VolunteerForms.tsx
      riepilogo/page.tsx     legge searchParams → parseRange → buildSummary
  components/                AttendanceList, BottomNav, RangePicker, SummaryView, ExportPdfButton
  lib/                       logica (vedi sotto)
  instrumentation.ts         all'avvio del server applica lo schema DB
tests/                       Vitest (unit + integrazione su eccomi_test)
```

## Moduli `src/lib`

| File | Responsabilità |
|---|---|
| `db.ts` | istanza `sql` (postgres.js), singleton; tipo `date` lasciato come stringa |
| `schema.ts` | SQL idempotente + `applySchema()` |
| `dates.ts` | `todayZurich`, `addDays`, `daysBetween`, `isValidDate` (≥ 1900), `formatDateIt`, `formatRangeIt` |
| `session.ts` | token HMAC, `verifySessionToken`, `requireAuth()` |
| `volunteers.ts` | CRUD volontari, `compareVolunteers`, `importVolunteers` |
| `import.ts` | `parseNameList` (pura) |
| `attendance.ts` | `presentIds(date)`, `setPresent(id, date, present)` idempotente |
| `range.ts` | `parseRange`, `shortcutRange` |
| `summary.ts` | tipi `Summary`, `buildSummary` (pura), `loadAttendances` |
| `pdfTable.ts` | `summaryToTable` (pura): testata, righe, orientamento, nome file |

## Flusso tipico: tocco su un nome
`AttendanceList` (client) → `setOptimistic` → server action `togglePresence(id, present)` → `requireAuth()` → `setPresent(id, todayZurich(), present)` → `revalidatePath("/")` → la pagina server rilegge `presentIds`.

## Flusso riepilogo
`page.tsx` → `parseRange(searchParams, today)` → `loadAttendances(range)` → `buildSummary` → `SummaryView` (schermo) e `ExportPdfButton` (PDF via `summaryToTable`).
