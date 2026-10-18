# Funzionalità

## Login (`/login`)
Un campo password. La password è unica e condivisa (`APP_PASSWORD`). Dopo l'accesso il telefono resta collegato per 90 giorni. "Esci" in alto a destra cancella il cookie. Una password errata risponde dopo 1 secondo.

## Presenze (`/`), schermata principale
- Titolo: data di oggi estesa (fuso Europe/Zurich), contatore "N presenti su M".
- Lista dei volontari **attivi**, ordinata per nome poi cognome; campo di ricerca (ignora maiuscole e accenti).
- **Un tocco = presente**: la riga diventa blu con la scritta "Eccomi". Un secondo tocco toglie la presenza.
- Aggiornamento ottimistico (`useOptimistic`): la UI cambia subito; se il salvataggio fallisce torna indietro con un messaggio.
- Si segna **solo il giorno corrente**; la data è calcolata sul server, mai inviata dal client.
- Una sola presenza per persona al giorno; nessun orario.

## Volontari (`/volontari`)
- Elenco di tutti i volontari (attivi e non), ordinati per nome.
- Bottone "Attivo / Non attivo" per riga: i non attivi spariscono da Presenze ma restano nei riepiloghi storici.
- Tocco sul nome → modifica nome, cognome e gruppi (caselle, anche più di uno) in linea. Sotto il nome compaiono i suoi gruppi.
- "Gruppi (N)": crea un gruppo; tocco su un gruppo → rinomina o elimina (eliminare non tocca volontari né presenze).
- "Aggiungi volontario": nome obbligatorio, cognome facoltativo.
- "Incolla un elenco": una persona per riga, **prima parola = nome, resto = cognome**; righe vuote e doppioni ignorati; esito "Importati N, già presenti M".
- "Elimina volontario" (in modifica): doppia conferma con avviso; cancella definitivamente il volontario **e tutte le sue presenze**. Per toglierlo solo da Presenze si usa "Non attivo". Nomi unici senza distinzione di maiuscole.

## Riepilogo (`/riepilogo`)
- Periodo nell'URL (`?from=YYYY-MM-DD&to=YYYY-MM-DD`). Scorciatoie: Oggi, Questa settimana (lun–dom), Questo mese; oppure "Da / A" con input data nativi.
- URL non validi → oggi. `from > to` → invertiti. Solo `from` → quel giorno.
- Tre modalità (`buildSummary` in `src/lib/summary.ts`):
  - **day** (un giorno): elenco dei presenti.
  - **grid** (2–31 giorni): griglia volontari × giorni con pallino e colonna Totale; solo giorni con almeno una presenza; prima colonna fissa, scorrimento orizzontale.
  - **totals** (oltre 31 giorni): per ogni volontario solo il numero di giorni di presenza.
- Include anche i volontari ora non attivi, se hanno presenze nel periodo.
- Raggruppato per gruppo (ordine alfabetico), "Senza gruppo" in fondo; chi sta in più gruppi compare in ciascuno. Se nessun presente ha un gruppo, nessuna intestazione. Il conteggio "N presenti" conta le persone una volta sola.

## Esporta PDF
Bottone in fondo al riepilogo. Generato nel browser con jsPDF + jspdf-autotable (import dinamico). Stessi dati dello schermo (`summaryToTable`), ogni gruppo preceduto da uno spazio vuoto e intestato da una riga blu con testo bianco. Titolo "ASSOCIAZIONE DARE – ECCOMI", sottotitolo "Presenze <periodo>" (per un giorno anche "– N presenti"), tabella con testata blu solo quando ci sono più colonne (nel giorno singolo nessuna riga "Volontario"), piè di pagina "Generato il … · Pagina N". Orizzontale oltre 10 giorni; stile compatto oltre 22 colonne. Nome file: `presenze-<giorno>.pdf` o `presenze-<da>_<a>.pdf`.
