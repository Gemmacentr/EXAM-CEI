# Portfolio — Gemma Centrone

Struttura:
```
index.html
css/style.css
js/script.js
```

## Da sapere prima di pubblicarlo altrove

Nel codice ci sono ancora riferimenti a file ospitati su Claude
(`/_blob/...`), usati mentre il sito viveva come artifact:

- il video nella hero (`<video src="/_blob/...">`)
- il PDF del CV scaricabile (link nell'header, `href="/_blob/..."`)
- eventuali icone/favicon

Questi percorsi **funzionano solo dentro l'artifact di Claude** e
smettono di funzionare non appena carichi il progetto su un tuo
hosting. Prima di pubblicarlo altrove:

1. Sostituisci `src="/_blob/..."` del video con il percorso del tuo
   file (es. `assets/video-gemma.mp4`).
2. Sostituisci `href="/_blob/..."` del bottone CV con il percorso del
   tuo PDF (es. `assets/cv-gemma-centrone.pdf`).
3. Aggiorna email, LinkedIn, GitHub e numero WhatsApp con i tuoi dati
   reali (sono ancora segnaposto).

## Note tecniche

- Font caricati da Google Fonts (Cormorant Garamond, Inter, IBM Plex
  Mono) via `<link>` in `index.html`.
- Nessuna dipendenza/framework: HTML, CSS e JS scritti a mano.
- Il selettore lingua (IT/EN/ES) e la scelta dei cookie vengono
  salvati in `localStorage`.
- Rispetta `prefers-reduced-motion` e `prefers-color-scheme` (dark
  mode automatica).
