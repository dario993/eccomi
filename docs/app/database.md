# Database

PostgreSQL 17. Driver `postgres` (porsager), query SQL con template literal (parametri sempre escapati).

## Schema (`src/lib/schema.ts`)

```sql
volunteers(id serial PK, first_name text NOT NULL, last_name text NOT NULL DEFAULT '',
           active boolean NOT NULL DEFAULT true, created_at timestamptz)
UNIQUE INDEX volunteers_name_uniq ON volunteers (lower(first_name), lower(last_name))

attendances(volunteer_id int → volunteers.id, date date, created_at timestamptz,
            PRIMARY KEY (volunteer_id, date))
```

- Una presenza per persona per giorno: garantito dalla chiave primaria. `setPresent` usa `ON CONFLICT DO NOTHING` / `DELETE`.
- Doppioni di nome (case-insensitive) bloccati dall'indice univoco → errore `23505` tradotto in `'duplicate'`.
- I volontari non si cancellano (le presenze li referenziano), si disattivano.

## Applicazione dello schema
`src/instrumentation.ts` esegue `applySchema(sql)` a ogni avvio del server. Le istruzioni sono idempotenti (`IF NOT EXISTS`). Per cambiare lo schema in futuro aggiungere istruzioni idempotenti (es. `ALTER TABLE … ADD COLUMN IF NOT EXISTS`), mai distruttive.

## Date
Il tipo `date` è configurato in `db.ts` per restare stringa `YYYY-MM-DD` (nessuna conversione a `Date`, nessun problema di fuso).

## Database locali
- `eccomi`: sviluppo (`DATABASE_URL` in `.env.local`)
- `eccomi_test`: test; `tests/db.ts` ricrea lo schema a ogni esecuzione e svuota le tabelle prima di ogni test

## Comandi utili
```bash
psql eccomi -c "TRUNCATE attendances, volunteers RESTART IDENTITY"   # svuota (locale)
docker compose exec db pg_dump -U postgres eccomi > backup.sql        # backup (produzione)
```
