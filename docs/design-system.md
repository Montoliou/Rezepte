# Designsystem – Montys Rezepte

Abgeleitet aus den Konzepten in `docs/design-concepts/`.

## Visuelle Richtung

- ruhige, hochwertige Küchenanwendung statt klassischem Admin-Dashboard
- nahezu weißer, leicht kühler Hintergrund
- dunkles Tannengrün für Text und Salbeigrün für Aktionen
- Terrakotta ausschließlich für fachliche Hinweise und Warnungen
- offene Flächen und Linien statt verschachtelter Karten
- Serifenschrift für Marke, Rezepttitel und aktive Kochschritte
- System-Sans-Serif für Formulare und erklärenden Text

## Haupttokens

```text
Hintergrund     #f8f9f6
Fläche          #ffffff
Text dunkel     #14221c
Primärfarbe     #52764b
Primär dunkel   #355d35
Primär weich    #e7eee3
Warnung         #ba552d
Linie           #d8ddd7
```

## Komponenten

- ruhiger Kopfbereich mit maximal zwei Navigationsaktionen
- horizontale Rezeptkarte mit großem Bild und klarer Hauptaktion
- Personen-Stepper mit großen Touch-Zielen
- offenes Zweispalten-Setup: Eingaben links, Ergebnis rechts
- drei gleichwertige Kochphasen
- fokussierter aktueller Schritt links, Zeitlinie rechts
- Touch-Ziele mindestens 44 × 44 CSS-Pixel

## Responsive Verhalten

- iPad quer: Zweispaltenlayouts
- iPad hoch: Rezeptkarte bleibt zweispaltig, Setup und Kochmodus stapeln unter 900 px
- Smartphone: einspaltige Formulare, reduzierte Navigation und gestapelte Timeraktionen

## Bewusste Abweichungen von den Konzeptbildern

- Rezeptbereich unterstützt 1–30 statt 2–12 Personen.
- Das Setup enthält zusätzliche fachliche Optionen und kann deshalb vertikal scrollen.
- Die reale Bowl-Fotografie wurde separat generiert und nicht aus dem Konzeptbild ausgeschnitten.
