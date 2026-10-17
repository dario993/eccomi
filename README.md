# Eccomi

App per segnare le presenze giornaliere dei volontari dell'associazione **Dare**.
Next.js + PostgreSQL. In locale gira senza Docker, mentre in produzione si usa `docker compose`.

## Sviluppo locale (macOS, senza Docker)

Requisiti: Node 20.9+ e Homebrew.

```bash
brew install postgresql@17
brew services start postgresql@17
createdb eccomi && createdb eccomi_test
npm install
```

Crea `.env.local`:

```
DATABASE_URL=postgres://<tuo-utente>@localhost:5432/eccomi
APP_PASSWORD=una-password
SESSION_SECRET=una-stringa-casuale-lunga
```

```bash
npm run dev    # http://localhost:3000
npm test       # usa il database eccomi_test (lo schema viene ricreato a ogni esecuzione)
```

## Primo deploy sul server

```bash
git clone <repo> eccomi && cd eccomi
cp .env.example .env    # imposta password vere: POSTGRES_PASSWORD solo lettere e numeri
docker compose up -d --build
```

L'app risponde sulla porta `APP_PORT` (default 3000). Il reverse proxy esistente inoltra
`https://eccomi.hsdscp.duckdns.org` verso `http://<ip-server>:APP_PORT`.
Il database non pubblica porte: lo raggiunge solo il container dell'app.

Per generare un `SESSION_SECRET`: `openssl rand -hex 32`. Se lo cambi, tutti dovranno rifare l'accesso.

## Deploy con Portainer

1. **Stacks → Add stack**, nome `eccomi`, metodo **Repository**.
2. Repository URL `https://github.com/dario993/eccomi`, reference `refs/heads/main`, compose path `docker-compose.yml`.
3. In **Environment variables** aggiungi `POSTGRES_PASSWORD`, `APP_PASSWORD`, `SESSION_SECRET`, `APP_PORT`.
4. **Deploy the stack**. Per aggiornare: apri lo stack → **Pull and redeploy** (oppure attiva GitOps updates).

## Aggiornamento

```bash
git pull && docker compose up -d --build
```

## Backup e ripristino

```bash
docker compose exec db pg_dump -U postgres eccomi > backup-$(date +%F).sql
docker compose exec -T db psql -U postgres eccomi < backup.sql
```

## Note

- Le tabelle vengono create dall'app stessa a ogni avvio (`src/lib/schema.ts`, istruzioni idempotenti).
  Eventuali modifiche future allo schema vanno aggiunte lì in forma idempotente.
- Le presenze usano il giorno del fuso Europe/Zurich.
