# Sicurezza e accesso

- **Password unica** da `APP_PASSWORD`. Confronto con SHA-256 + `timingSafeEqual`. Password errata → risposta dopo 1 s (rallenta i tentativi).
- **Sessione:** cookie `eccomi_session` = `<scadenzaMs>.<HMAC-SHA256>` firmato con `SESSION_SECRET`; httpOnly, sameSite `lax`, `secure` in produzione, durata 90 giorni. Nessuno stato lato server: cambiare `SESSION_SECRET` disconnette tutti.
- **Controllo accesso:** `requireAuth()` (in `src/lib/session.ts`) va chiamato
  - in **ogni pagina** di `src/app/(app)/` (le navigazioni client non rieseguono il layout: senza questo i dati sono leggibili senza login; coperto da `tests/pages-auth.test.ts`);
  - all'inizio di **ogni server action**.
- **CSRF / proxy:** `next.config.ts` → `experimental.serverActions.allowedOrigins: ["eccomi.hsdscp.duckdns.org"]`.
- **Sviluppo:** `allowedDevOrigins: ["192.168.*.*"]` permette ai telefoni in LAN di caricare il JS del dev server (solo in dev).
- **Segreti:** `.env`, `.env.local` esclusi da git. Il repository è pubblico: mai committare password.
- **Postgres** in produzione non pubblica porte: solo il container `app` lo raggiunge.
