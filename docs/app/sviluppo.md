# Sviluppo e test

## Setup locale (macOS, senza Docker)
```bash
brew install postgresql@17 && brew services start postgresql@17
createdb eccomi && createdb eccomi_test
npm install
```
`.env.local`:
```
DATABASE_URL=postgres://<utente>@localhost:5432/eccomi
APP_PASSWORD=eccomi
SESSION_SECRET=<stringa casuale>
```
Avvio: `npm run dev -- -H 0.0.0.0` → Mac `http://localhost:3000`, telefono `http://<ip-mac>:3000`. Lo schema si crea da solo all'avvio.

Nota npm: npm 10 va in crash aggiungendo alcune dipendenze (bug arborist `edgesOut`); usare `npx npm@11 i <pacchetto>`.

## Test
- `npm test` (Vitest). Config in `vitest.config.mts`: alias `@`, `DATABASE_URL` puntato a `eccomi_test`, file in serie.
- Unit: `dates`, `session`, `import`, `range`, `summary`, `pdfTable`, `login`.
- Integrazione DB: `schema`, `schema-apply`, `volunteers`, `attendance`, `summary` (usano `resetDb()` da `tests/db.ts`).
- `pages-auth.test.ts`: verifica che ogni pagina chiami `requireAuth()`.
- Verifica completa prima di un commit: `npm test && npx tsc --noEmit && npx eslint src && npm run build`.

## Convenzioni
- Next.js 16: leggere `node_modules/next/dist/docs/` prima di usare API (vedi `AGENTS.md`). `searchParams`, `cookies()` sono async.
- Logica pura in `src/lib`, testata; componenti sottili.
- Nessuna nuova dipendenza se bastano poche righe o una feature nativa (es. `<input type="date">`, link + form GET).
- Commit piccoli in stile `feat:` / `fix:` / `chore:`.
