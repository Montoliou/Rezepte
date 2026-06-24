# Montys Rezepte

Statische, iPad-optimierte Rezept- und Kochhilfe. Die erste integrierte Rezeptkachel ist die Teriyaki Bowl.

## Funktionen

- dynamische Zutatenmengen für 1–30 Personen
- getrennte Planung für Vegetarier, Fleischesser und flexible Gäste
- transparente Hähnchen-/Tofu-Verteilung
- Zutaten-, Mise-en-Place- und Kochansicht
- rückwärts von der Zielzeit berechneter Ablauf
- Chargenregeln für größere Proteinmengen
- Timer und abhakebarer Fortschritt
- lokale Speicherung im Browser
- Druck- und Kopieransicht
- PWA-Manifest und Offline-Cache

## Lokal starten

Voraussetzung: Node.js 20 oder neuer.

```powershell
npm run serve
```

Anschließend öffnen:

```text
http://127.0.0.1:4173/
```

Es gibt keinen Build-Schritt und keine Laufzeit-Abhängigkeiten.

## Tests

```powershell
npm test
```

Die Tests prüfen unter anderem:

- den Referenzfall für acht Personen
- fehlendes und überschüssiges Hähnchen
- Ersatz-Tofu
- widersprüchliche Gästezahlen
- optionale Zutaten
- große Gruppen und Chargen
- Mengen- und Zeitformatierung

## Projektstruktur

```text
index.html                    App-Shell und semantische Ansichten
assets/app.js                 UI-Zustand und Interaktionen
assets/styles.css             Designsystem und responsive Darstellung
assets/images/                Rezeptbilder
assets/icons/                 App-Icon
recipes/                      Rezeptdaten und Fachlogik
lib/                          Formatierung, Zeitplan und lokaler Speicher
tests/                        automatisierte Berechnungstests
docs/design-concepts/         visuelle Referenzkonzepte
manifest.webmanifest          PWA-Konfiguration
sw.js                         Offline-Cache
scripts/serve.mjs             lokaler statischer Server
```

Neue Rezepte werden in `recipes/` ergänzt und in `recipes/index.js` registriert. Ein komplexes Rezept darf eine eigene Berechnungsfunktion besitzen; UI und Navigation bleiben generisch.

## Deployment auf montolio.de

Zielpfad:

```text
https://montolio.de/Rezepte/
```

Die App verwendet relative Pfade und kann deshalb als Inhalt des Webspace-Verzeichnisses `/Rezepte/` hochgeladen werden.

Vor dem Deployment:

1. `npm test` ausführen.
2. App lokal auf iPad und Desktop prüfen.
3. vorhandenen Inhalt des Zielverzeichnisses inventarisieren oder sichern.
4. nur die für die Laufzeit benötigten Dateien hochladen.
5. anschließend Startseite, Rezeptbild, JavaScript-Module und Service Worker über HTTPS prüfen.

Nicht hochladen:

- `.ftp-credentials`
- `tests/`
- `docs/`
- alte Dashboard-Versionen
- lokale Entwicklungsdateien

Die vorhandenen FTP-Zugangsdaten bleiben ausschließlich lokal. Das Deployment wird erst nach separater Freigabe ausgeführt.

## Cache-Hinweis

Bei einer Veröffentlichung muss der Wert `CACHE_NAME` in `sw.js` bei jeder produktiven Änderung erhöht werden. So erhalten bereits installierte iPad-Versionen zuverlässig den neuen Stand.
