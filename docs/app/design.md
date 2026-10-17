# Interfaccia e stile

Minimale, **mobile-first** (riferimento 375 px), colore principale blu. Linee guida dalle skill `frontend-design` e `design-taste-frontend` (regole di stile, non il flusso da landing page).

## Token (`src/app/globals.css`, `@theme`)

| Token | Valore | Uso |
|---|---|---|
| `ground` | `#f3f6fb` | sfondo pagina |
| `surface` | `#e6ecf5` | campi, pulsanti secondari, righe non attive |
| `ink` | `#0b1b33` | testo, barra di navigazione |
| `muted` | `#4a5a73` | testo secondario |
| `blue` | `#0052d6` | azione principale, presenza, accento |
| `blue-deep` | `#003c9e` | stato premuto |
| `danger` | `#b42318` | errori |

Font: **Schibsted Grotesk** (unico), via `next/font/google`. Cifre tabellari solo nelle tabelle (`tabular-nums`).

## Regole
- Niente gradienti, ombre a riposo, bordi/linee sottili, emoji, etichette maiuscole spaziate, eyebrow, numerazioni decorative.
- Superfici separate da **toni** (bianco su `ground`, `surface`), non da bordi.
- Angoli **squadrati** (nessun border-radius sui pulsanti), tranne il pallino presenza.
- Bersagli tocco ≥ 44 px; righe presenze ≥ 64 px.
- Focus visibile (`outline` blu 3 px); `prefers-reduced-motion` rispettato.
- Testi in italiano, verbi chiari ("Aggiungi volontario", "Esporta PDF"); errori che dicono cosa fare.

## Elemento firma
Nella lista Presenze la riga toccata diventa un campo blu pieno con la parola **"Eccomi"**: la risposta all'appello.

## Navigazione
Barra fissa in basso (`BottomNav`): Presenze · Volontari · Riepilogo; voce attiva su fondo blu.
