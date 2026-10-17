# Deploy

## Componenti
- `Dockerfile`: multi-stage `node:22-alpine` → `npm ci` → `npm run build` (output `standalone`) → runner come utente `node`, `TZ=Europe/Zurich`, porta 3000.
- `docker-compose.yml`: servizi `db` (`postgres:17-alpine`, volume `pgdata`, healthcheck, nessuna porta pubblicata) e `app` (build locale, porta `${APP_PORT:-3000}`, attende `db` healthy). Le variabili obbligatorie falliscono con messaggio chiaro se mancanti.

## Variabili
| Nome | Note |
|---|---|
| `POSTGRES_PASSWORD` | solo lettere e numeri (finisce nell'URL di connessione) |
| `APP_PASSWORD` | password condivisa per l'accesso |
| `SESSION_SECRET` | `openssl rand -hex 32`; cambiarla disconnette tutti |
| `APP_PORT` | porta pubblicata sul server (default 3000) |

## Portainer (produzione attuale)
1. Stacks → Add stack → **Repository**: `https://github.com/dario993/eccomi`, ref `refs/heads/main`, compose `docker-compose.yml`.
2. Environment variables: le quattro sopra.
3. Deploy the stack. Aggiornare: **Pull and redeploy** (o GitOps updates con polling).
4. Reverse proxy: `https://eccomi.hsdscp.duckdns.org` → `http://<ip-server>:<APP_PORT>`.

Nessun bind mount: lo schema DB lo crea l'app all'avvio (Portainer CE non supporta percorsi relativi negli stack Git).

## Docker compose a mano (alternativa)
```bash
git clone https://github.com/dario993/eccomi.git && cd eccomi
cp .env.example .env && nano .env
docker compose up -d --build
git pull && docker compose up -d --build   # aggiornamento
```

## Backup / ripristino
```bash
docker compose exec db pg_dump -U postgres eccomi > backup-$(date +%F).sql
docker compose exec -T db psql -U postgres eccomi < backup.sql
```
In Portainer: console del container `eccomi-db-1` con gli stessi comandi `pg_dump`/`psql`.

## Problemi noti
- Se `npm ci` fallisce nella build: nel `Dockerfile` usare `RUN npx npm@11 ci` (il lockfile è stato scritto con npm 11).
- Login rifiutato dietro proxy: verificare che il proxy inoltri `Host`/`X-Forwarded-Host`, o aggiornare `allowedOrigins` in `next.config.ts`.
