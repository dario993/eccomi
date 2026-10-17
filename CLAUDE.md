# Eccomi

Web app mobile-first per segnare le **presenze giornaliere dei volontari** dell'associazione di volontariato **Dare**.
Un responsabile, all'ingresso, apre l'app sul proprio telefono e tocca i nomi di chi arriva; poi consulta il riepilogo di un giorno o di un periodo e lo esporta in PDF.

@AGENTS.md

## In breve

- **Stack:** Next.js 16 (App Router, server components + server actions), React 19, Tailwind 4, PostgreSQL 17 tramite il driver `postgres` (SQL semplice, niente ORM), jsPDF, Vitest.
- **Accesso:** una sola password condivisa (`APP_PASSWORD`), cookie di sessione firmato da 90 giorni.
- **Sezioni:** Presenze (`/`), Volontari (`/volontari`), Riepilogo (`/riepilogo`), Login (`/login`).
- **Lingua UI:** italiano. **Fuso:** Europe/Zurich. **Colore principale:** blu.
- **Produzione:** Docker (stack Portainer dal repo GitHub `dario993/eccomi`), dietro reverse proxy su `https://eccomi.hsdscp.duckdns.org`.
- **Locale:** nessun Docker; Postgres da Homebrew, `npm run dev -- -H 0.0.0.0`.

## Comandi

```bash
npm run dev -- -H 0.0.0.0   # sviluppo (raggiungibile anche dal telefono in LAN)
npm test                    # Vitest, usa il DB eccomi_test (Postgres locale deve girare)
npx tsc --noEmit && npx eslint src
npm run build               # build standalone di produzione
```

## Regole da rispettare

- Le date sono sempre stringhe `YYYY-MM-DD`; "oggi" = `todayZurich()`. Mai `new Date()` per il giorno, mai `CURRENT_DATE` in SQL.
- Ogni pagina sotto `src/app/(app)/` **e** ogni server action chiamano `requireAuth()` (il layout da solo non basta).
- Lo schema DB è in `src/lib/schema.ts`, applicato a ogni avvio: solo istruzioni idempotenti.
- Il PDF e lo schermo derivano dallo stesso `Summary`: modificare entrambi tramite `summaryToTable`.
- Ordinamento volontari: per nome, poi cognome (`compareVolunteers`).
- Stile: niente gradienti, ombre, bordi sottili, emoji; superfici separate da toni.
- Logica nuova con un test (TDD); test di integrazione su `eccomi_test`.

## Documentazione

Indice completo: [docs/README.md](docs/README.md)

- [Funzionalità](docs/app/funzionalita.md): cosa fa l'app, schermata per schermata
- [Architettura](docs/app/architettura.md): struttura del codice, flusso dei dati, moduli
- [Database](docs/app/database.md): schema, vincoli, migrazioni
- [Sicurezza e accesso](docs/app/sicurezza.md): password, sessione, protezioni
- [Interfaccia e stile](docs/app/design.md): token, regole grafiche, componenti
- [Sviluppo e test](docs/app/sviluppo.md): setup locale, test, convenzioni
- [Deploy](docs/app/deploy.md): Docker, Portainer, aggiornamenti, backup
- [Decisioni](docs/app/decisioni.md): scelte fatte e motivazioni, cose rimandate
