# Eccomi: design

Web app per segnare le presenze giornaliere dei volontari dell'associazione di volontariato **Dare**.

## Intento

Un responsabile, all'ingresso, apre l'app sul **proprio telefono** e segna con un tocco chi è arrivato. In seguito (lui o un altro) consulta il riepilogo di un giorno o di un periodo e lo **esporta in PDF** da inviare. L'obiettivo è sostituire un'operazione manuale con qualcosa di immediato: aprire l'app, toccare i nomi, fatto.

## Obiettivi

1. Anagrafica volontari: nome, cognome, flag **attivo**.
2. Schermata presenze del giorno: volontari attivi, ordinati per **nome**, un tocco = presente.
3. Riepilogo per giorno o periodo, con export PDF identico a quanto mostrato.
4. Deploy con Docker su un server proprio, aggiornabile da repository git.

## Non obiettivi

- Orari di entrata e uscita oppure ore svolte: si registra **solo presente / non presente per giorno**.
- Account per singolo responsabile, ruoli o log di chi ha segnato cosa.
- Supabase: scartato dall'utente in favore di Postgres semplice (vedi Vincoli).
- App nativa o PWA offline.

## Anti-obiettivi (sarebbe un fallimento anche se funziona)

- Segnare una presenza al telefono richiede più di un tocco, oppure la lista è scomoda da usare in piedi all'ingresso.
- Il PDF mostra dati diversi da quelli visibili a schermo.
- Disattivare un volontario fa sparire le sue presenze passate dai riepiloghi.

## Vincoli (decisi dall'utente)

- **Stack:** Next.js + React + Tailwind.
- **Database:** PostgreSQL semplice in Docker, non Supabase. Lo stesso `docker-compose.yml` deve funzionare **in locale** (dove non è installato nulla) e in produzione. Due servizi: `app` e `db`, con un volume persistente per i dati.
- **Accesso:** **una sola password condivisa**, nessun utente individuale.
- **Grafica:** minimale, colore principale **blu**. L'utente ha chiesto di usare la skill `design-taste-frontend` (taste-skill, già presente nel progetto in `.claude/skills/`).
- **Lingua UI:** italiano.

## Comportamento

### Accesso
- Pagina di login con un solo campo password. La password arriva da variabile d'ambiente (`APP_PASSWORD`).
- Dopo il login, cookie httpOnly firmato con durata lunga (*mia scelta: 90 giorni*), così il telefono del responsabile resta collegato.
- Tutte le pagine e le operazioni sui dati richiedono il cookie. Logout disponibile.

### Volontari (anagrafica)
- Elenco di tutti i volontari, ordinati per nome, con interruttore attivo/non attivo.
- Aggiunta e modifica di nome e cognome.
- Non è prevista la cancellazione fisica: si disattiva (*mia scelta, per non perdere lo storico; si può aggiungere la cancellazione solo per chi non ha presenze*).
- I nuovi volontari sono attivi per default (*mia scelta*).
- **Import iniziale:** l'utente ha già una lista con una persona per riga ("Nome Cognome"). Nella pagina Volontari c'è un'area di testo "Incolla elenco": ogni riga non vuota diventa un volontario attivo. La prima parola è il nome e il resto il cognome (*mia scelta: i casi particolari si correggono poi con la modifica*). Le righe già presenti (stesso nome e cognome) vengono saltate. Le presenze passate non si importano.

### Presenze (schermata principale, mobile-first)
- Mostra la data di oggi, il contatore "N presenti", un campo di ricerca e la lista dei volontari **attivi** ordinati per **nome** (poi cognome).
- Tocco su una riga = presente (evidenziata in blu). Un secondo tocco toglie la presenza, per correggere un errore.
- Al massimo una presenza per persona al giorno (vincolo univoco sul database).
- La "data di oggi" è calcolata nel fuso **Europe/Zurich** (*mia scelta: associazione svizzera; da cambiare se diverso*).
- Sempre e solo il giorno corrente: le correzioni su giorni passati non sono previste (*mia scelta, YAGNI; da aggiungere se serve*).

### Riepilogo
- Selettore periodo: scorciatoie **Oggi / Questa settimana / Questo mese** più intervallo personalizzato **da / a** (input date nativi).
- **Giorno singolo:** elenco dei presenti ordinato per nome, con il totale.
- **Periodo fino a 31 giorni (opzione C, scelta dall'utente):** griglia con i volontari sulle righe (ordinati per nome) e i giorni sulle colonne, un pallino per ogni presenza e una colonna **Totale**.
  - Colonne: solo i giorni con almeno una presenza (*mia scelta, per tenere leggibile un mese*).
  - Righe: chiunque abbia almeno una presenza nel periodo, **compresi i non attivi** (*mia scelta, coerente con l'anti-obiettivo*).
  - Su mobile la griglia scorre orizzontalmente, con la colonna dei nomi fissa.
- **Periodo oltre 31 giorni (richiesta dell'utente):** vista più minimale con un elenco per volontario (ordinato per nome) e il **solo numero di giorni di presenza** nel periodo, senza il dettaglio giorno per giorno. La soglia dei 31 giorni è *mia scelta*.
- **Esporta PDF:** stessi dati della vista corrente. Intestazione "Dare – Eccomi", periodo e data di generazione. Orizzontale quando la griglia è larga.

## Modello dati

```
volunteers(id, first_name, last_name, active bool default true, created_at)
attendances(volunteer_id → volunteers.id, date, created_at,
            PRIMARY KEY (volunteer_id, date))
```

## Deploy

- `Dockerfile` per l'app (build standalone di Next) e `docker-compose.yml` con `app` + `postgres`.
- Variabili: `DATABASE_URL`, `APP_PASSWORD`, `SESSION_SECRET`, con un `.env.example`.
- Lo schema si crea all'avvio (script SQL di init o migrazione eseguita all'avvio dell'app).
- Aggiornamento: `git pull && docker compose up -d --build`.
- HTTPS e dominio sono gestiti dal **reverse proxy già presente** sul server, che inoltra dall'indirizzo privato a `https://eccomi.hsdscp.duckdns.org`. Il compose pubblica solo la porta dell'app (configurabile, default 3000) e **non** espone Postgres. Il cookie è `secure` quando `NODE_ENV=production`, così in locale su http funziona.
- Istruzioni brevi in README: avvio locale, primo deploy, aggiornamento, backup con `pg_dump`.

## Lasciato al builder

- Libreria per accesso al DB (driver `postgres`/`pg` diretto o un ORM leggero) e meccanismo di migrazione.
- Libreria o metodo per generare il PDF (lato server o client), purché il risultato rispecchi la vista.
- Struttura delle pagine e navigazione (es. barra in basso su mobile con Presenze / Volontari / Riepilogo).
- Dettagli visivi entro "minimale, blu", seguendo la taste-skill. Nota: la skill si dichiara pensata per pagine pubbliche e non per schermate di app, quindi va usata per le regole di stile (niente ornamenti, tipografia, palette) e non per il suo flusso da landing page.
- Un test minimo sulla logica del riepilogo (griglia e totali) e sul vincolo di presenza unica.
