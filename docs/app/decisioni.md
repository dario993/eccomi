# Decisioni

| Decisione | Motivo |
|---|---|
| Postgres semplice invece di Supabase | serve solo il database; Supabase self-hosted sono ~10 container |
| Password unica, niente utenti | richiesta: un responsabile, accesso semplice |
| Solo presente/assente per giorno, nessun orario | richiesta |
| Solo il giorno corrente si segna | semplicità; correzioni passate non richieste |
| Fuso Europe/Zurich | associazione in Svizzera |
| Ordinamento per nome | richiesta |
| Import: prima parola = nome | lista "Nome Cognome" per riga; casi particolari si correggono a mano |
| Disattivare invece di cancellare | conserva lo storico presenze |
| Griglia fino a 31 giorni, oltre solo totali | richiesta (oltre un mese vista minimale) |
| Colonne griglia solo giorni con presenze | leggibilità |
| Etichette giorno "05" dentro un mese, "05.10" a cavallo | 31 colonne devono stare in A4 orizzontale |
| PDF generato nel browser da `summaryToTable` | PDF identico allo schermo |
| `cacheComponents` di Next 16 disattivato | app interna tutta dinamica |
| `requireAuth()` in ogni pagina e action | il layout non basta (navigazioni client) |
| Schema applicato all'avvio dall'app | compatibile con Portainer CE (niente bind mount relativi) |
| Login 1 s di ritardo su errore | rallenta tentativi su dominio pubblico |
| Data minima valida 1900-01-01 | Postgres rifiuta l'anno 0 → errore 500 |

## Rimandati (piccoli)
- Import: doppioni dentro l'elenco incollato non contati in "già presenti".
- Nomi non normalizzati Unicode (NFC/NFD dello stesso nome = due persone).
- Un secondo telefono vede le presenze aggiornate solo cambiando pagina.
- Argomenti delle server action non validati nel tipo (chiamanti comunque autenticati).
