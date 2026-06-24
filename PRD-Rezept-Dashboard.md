# PRD – Rezept-Dashboard und dynamische Kochhilfe

**Produktname (Arbeitstitel):** Montys Rezepte  
**Stand:** 24.06.2026  
**Status:** Entwurf zur Freigabe – noch keine Bau- oder Deployment-Freigabe  
**Zieladresse:** `https://montolio.de/Rezepte/`

## 1. Ausgangslage

Im Projekt liegen aktuell:

- `bowl-dashboard-ipad-v3.html`: aktuelle, monolithische Teriyaki-Bowl-Anwendung
- `Sushi Bowl Teryaki/bowl-dashboard-ipad-v2.html`: ältere Version
- `Sushi Bowl Teryaki/.ftp-credentials`: vorhandene FTP-Konfiguration; darf weder veröffentlicht noch in ein öffentliches Repository übernommen werden

Die v3 berechnet bereits Zutaten, Gästeverteilung und einen rückwärts geplanten Ablauf. Sie enthält außerdem Druck- und Kopierfunktionen und ist responsiv angelegt. Rezeptdaten, Berechnungslogik, Darstellung und Ablaufsteuerung befinden sich jedoch gemeinsam in einer HTML-Datei. Dieser Aufbau ist für eine wachsende Rezeptsammlung nicht tragfähig.

Der alte Übergabeprompt nennt Vercel, Netlify oder GitHub Pages. Für dieses Produkt gilt stattdessen als Ziel der vorhandene Webspace unter `montolio.de/Rezepte/`.

## 2. Problem

Beim Kochen müssen Rezeptmengen, Vorbereitung und zeitliche Reihenfolge heute aus unterschiedlichen Stellen oder aus einem langen Rezepttext abgeleitet werden. Das erhöht insbesondere bei mehreren Komponenten und variabler Personenzahl die Fehlerwahrscheinlichkeit.

Gesucht ist keine bloße Rezeptablage, sondern eine auf dem iPad gut bedienbare Kochhilfe, die pro Rezept aus wenigen Eingaben drei konkrete Antworten erzeugt:

1. Welche Zutaten werden in welcher Menge benötigt?
2. Was muss für die Mise en Place vorbereitet werden?
3. In welcher logischen und zeitlichen Reihenfolge wird gekocht?

## 3. Produktvision

`Montys Rezepte` ist eine statische, schnelle und touchoptimierte Web-App für den persönlichen Einsatz in der Küche. Auf der Startseite werden Rezepte als Kacheln angeboten. Nach Auswahl eines Rezepts werden Personenzahl und rezeptabhängige Optionen eingestellt. Anschließend führt die App durch Zutaten, Mise en Place und Kochablauf.

Die Teriyaki Bowl ist das erste vollständig integrierte Rezept und Referenzimplementierung für alle späteren Rezepte.

## 4. Ziele und Erfolgskriterien

### Produktziele

- Ein Rezept lässt sich auf dem iPad mit wenigen Eingaben starten.
- Alle Mengen werden nachvollziehbar auf die gewählte Personenzahl skaliert.
- Deutsche Mengen- und Zeitdarstellung wird durchgängig verwendet.
- Mise en Place und Kochreihenfolge werden aus strukturierten Rezeptdaten erzeugt.
- Das System kann später um weitere Rezepte ergänzt werden, ohne die App-Oberfläche jeweils neu zu bauen.
- Die Anwendung läuft ohne Backend auf dem vorhandenen Webspace.

### Messbare Erfolgskriterien für den MVP

- Die Teriyaki Bowl ist die erste Kachel der Startseite.
- Der Kochmodus ist nach Rezeptauswahl mit höchstens drei primären Interaktionen erreichbar.
- Mengenberechnungen liefern für alle zulässigen Eingaben vollständige, endliche und nicht negative Werte.
- Bei ungültiger Gästeverteilung entstehen weder leere Bereiche noch stillschweigend falsche Ergebnisse.
- Auf einem iPad Pro 13" sind Hoch- und Querformat ohne horizontales Scrollen nutzbar.
- Primäre Touch-Ziele sind mindestens 44 × 44 CSS-Pixel groß.
- Nach einem Neuladen bleiben die zuletzt verwendeten Einstellungen und abgehakten Schritte lokal erhalten.
- Druckansicht und Kopierfunktion enthalten Zutaten, Mise en Place und Kochablauf.
- Die Anwendung ist unter `https://montolio.de/Rezepte/` erreichbar.
- Es werden keine Zugangsdaten oder Geheimnisse ausgeliefert.

## 5. Nicht-Ziele des MVP

- Kein Benutzerkonto und keine Anmeldung
- Kein Backend und keine Datenbank
- Kein grafischer Rezepteditor im Browser
- Keine automatische Einkaufsliste über mehrere Rezepte
- Keine Vorratsverwaltung
- Keine Nährwert-, Kalorien- oder Kostenberechnung
- Keine Community-, Bewertungs- oder Kommentarfunktionen
- Keine automatische Veröffentlichung ohne vorherige Freigabe

Weitere Rezepte werden im MVP als strukturierte Dateien im Projekt ergänzt.

## 6. Zielnutzer und Nutzungskontext

### Primärer Nutzer

Andi beim privaten Kochen, hauptsächlich auf einem iPad Pro 13" im Querformat, teilweise im Hochformat.

### Nutzungssituation

- Bedienung mit nassen oder belegten Händen
- Gerät steht in einiger Entfernung auf der Arbeitsfläche
- Kurze Aufmerksamkeitsspannen während paralleler Kochvorgänge
- Wechsel zwischen Übersicht, Abhaken und konkreten Arbeitsschritten
- Potenziell instabile Internetverbindung in der Küche

Folgerungen: große Bedienelemente, hoher Kontrast, wenig Text pro aktivem Schritt, kein Hover als notwendige Interaktion und kein automatisches Abdunkeln durch appseitige Overlays.

## 7. Informationsarchitektur

### 7.1 Startseite / Rezept-Dashboard

Die Startseite zeigt eine Kachelansicht aller verfügbaren Rezepte.

Jede Kachel enthält:

- Rezeptname
- optionales Bild oder visuelle Kennzeichnung
- aktive Gesamtzeit
- Portions-Standardwert
- relevante Kennzeichnungen, zum Beispiel vegetarische Option
- Schaltfläche oder eindeutige gesamte Kachelaktion „Rezept öffnen“

Die erste Kachel lautet **Teriyaki Bowl**. Die technische Struktur muss mehrere weitere Kacheln unterstützen, auch wenn zum MVP nur dieses Rezept produktiv ist.

### 7.2 Rezept-Setup

Nach Auswahl eines Rezepts werden allgemeine und rezeptabhängige Eingaben angezeigt.

Allgemeine Eingaben:

- Personenzahl
- gewünschte Zielzeit „Fertig um“
- optionaler Zeitpuffer

Teriyaki-spezifische Eingaben:

- Vegetarier
- Fleischesser
- flexible Gäste automatisch als Rest
- vorhandenes Hähnchen in Gramm
- Hähnchenportion pro Fleischesser
- Tofuportion
- Tofu-Anteil für flexible Gäste
- Schärfegrad der Sriracha-Mayo
- optional später: Reis pro Person, Avocado-Faktor, Mango-Faktor, Edamame an/aus

Vor dem Start zeigt die App eine kompakte Plausibilitätsprüfung und die berechnete Startzeit.

### 7.3 Zutaten

Ausgabe in sinnvollen Gruppen, zum Beispiel:

- Reis und Reiswürzung
- Teriyaki-Sauce
- Proteine
- Sriracha-Mayo
- Toppings und Extras

Anforderungen:

- dynamische Mengen
- deutsche Einheiten
- einheitliche Rundung
- optionale Zutaten klar gekennzeichnet
- ausblendbare Zutaten werden bei Deaktivierung auch aus Mise en Place und Kochablauf entfernt
- kurze Erklärung bei nicht trivialen Berechnungen

### 7.4 Mise en Place

Die App erzeugt eine abhakebare Vorbereitungsliste. Sie enthält nicht bloß Zutaten, sondern konkrete Arbeitsaufträge mit Menge und Zielzustand.

Beispiele:

- `640 g Sushireis waschen und 20–30 Minuten abtropfen lassen`
- `600 g Tofu pressen und würfeln`
- `2 Gurken waschen und schneiden`
- `Teriyaki-Sauce aus den angezeigten Zutaten anrühren`
- `Getrennte Zange für Tofu und Hähnchen bereitlegen`

Bereits erledigte Aufgaben werden visuell zurückgenommen, bleiben aber lesbar.

### 7.5 Kochansicht

Die Kochansicht zeigt die logisch sortierte Reihenfolge mit:

- Uhrzeit oder relativem Zeitpunkt
- aktivem Arbeitsschritt
- benötigten Mengen direkt im Schritt
- Dauer
- Abhängigkeiten beziehungsweise Hinweis auf parallele Tätigkeiten
- Schaltfläche „Erledigt“
- nächstem sinnvollen Schritt
- optionalem Einzeltimer für Warte- und Garzeiten

Die Ansicht unterscheidet:

- vorbereitbar
- kurz vor dem Servieren
- direkt vor dem Servieren

Der Nutzer kann jederzeit zwischen Gesamtplan und fokussierter Schrittansicht wechseln.

### 7.6 Druck- und Kopieransicht

Eine druckfreundliche Ansicht enthält:

- Rezept und Konfiguration
- Zutatenmengen
- Mise-en-Place-Liste
- Ablaufplan mit Uhrzeiten
- kurze Zubereitungshinweise

Interaktive Bedienelemente werden nicht gedruckt. „Alles kopieren“ erzeugt strukturierten Klartext.

## 8. Funktionale Anforderungen

### FR-01 Rezeptkatalog

Die App lädt eine zentrale Rezeptliste und rendert daraus die Kacheln. Das erste Element ist die Teriyaki Bowl.

### FR-02 Dynamische Rezeptkonfiguration

Jedes Rezept definiert selbst, welche zusätzlichen Eingaben neben Personenzahl und Zielzeit benötigt werden.

### FR-03 Reaktive Berechnung

Änderungen an Eingaben aktualisieren Mengen, Hinweise, Mise en Place und Ablauf ohne Seitenneuladen.

### FR-04 Transparente Logik

Komplexe Berechnungen werden in verständlicher Form erklärt. Bei der Teriyaki Bowl betrifft das insbesondere die Verteilung von Hähnchen und Tofu.

### FR-05 Validierung

- Personenzahl muss mindestens 1 sein.
- Teilgruppen dürfen die Gesamtzahl nicht überschreiten.
- Negative Mengen sind nicht zulässig.
- Fehlende oder nicht numerische Werte werden sichtbar korrigiert oder mit verständlicher Meldung abgewiesen.
- Die App darf Eingaben nicht unbemerkt in fachlich andere Werte umwandeln.

Die aktuelle v3 reduziert bei einer zu großen Summe aus Vegetariern und Fleischessern automatisch zuerst die Fleischesser. Dieses Verhalten wird im neuen Produkt durch eine sichtbare Validierung ersetzt.

### FR-06 Mengenformatierung

Unterstützte Standardformate:

- g und kg
- ml und l
- TL und EL
- Stück
- Uhrzeiten im Format `13:00 Uhr`
- Dezimalzahlen mit Komma

Die Anzeige soll unpraktische Werte vermeiden. Beispiele:

- `1.250 g` wird als `1,25 kg` angezeigt.
- sehr kleine Flüssigkeitsmengen bleiben in TL/EL, größere werden in ml ausgegeben
- Stückmengen werden nach der je Zutat definierten Regel aufgerundet

### FR-07 Zeitplanung

Die Zielzeit wird rückwärts anhand der Rezeptschritte berechnet. Schritte unterstützen:

- Dauer
- Vorlauf
- Abhängigkeiten
- parallele Ausführung
- Halte- oder Ruhezeit
- Kennzeichnung als kritisch oder flexibel

Die Zeitplanung darf bei größeren Mengen nicht pauschal dieselben Bratzeiten wie bei kleinen Mengen verwenden. Rezeptmodule benötigen deshalb Kapazitäts- oder Chargenregeln.

### FR-08 Fortschritt

Mise-en-Place- und Kochschritte sind abhakbar. Der Fortschritt wird lokal gespeichert und kann gezielt zurückgesetzt werden.

### FR-09 Lokale Einstellungen

Die App speichert lokal:

- zuletzt gewähltes Rezept
- letzte Personenzahl und Rezeptoptionen
- laufenden Fortschritt
- bevorzugte Ansicht

Es werden keine personenbezogenen Daten an einen Server übertragen.

### FR-10 Robustheit

Wenn optionale Browserfunktionen wie Zwischenablage oder lokale Speicherung blockiert sind, bleibt die Kernfunktion nutzbar und zeigt einen klaren Hinweis.

### FR-11 Navigation

Eine dauerhaft erreichbare Navigation ermöglicht den Wechsel zwischen:

- Rezepte
- Setup
- Zutaten
- Mise en Place
- Kochen

In der Kochansicht muss eine unbeabsichtigte Rückkehr oder ein Reset vermieden beziehungsweise bestätigt werden.

## 9. Fachlogik der Teriyaki Bowl

Die vorhandene v3 dient als Ausgangspunkt, wird aber nicht unverändert übernommen.

### 9.1 Gästeverteilung

```text
Flexible Gäste = Gesamtpersonen – Vegetarier – Fleischesser
```

Die Summe aus Vegetariern und Fleischessern darf die Gesamtpersonenzahl nicht überschreiten.

### 9.2 Hähnchen

Vorgeschlagene MVP-Regel:

```text
Hähnchenbedarf = Fleischesser × Hähnchenportion
einzuplanendes Hähnchen = Minimum aus vorhandenem Hähnchen und Hähnchenbedarf
vollständig abgedeckte Fleischesser = Abrunden(einzuplanendes Hähnchen / Hähnchenportion)
```

Überbestand wird angezeigt, aber nicht automatisch vollständig zum Kochen eingeplant. Eine Restmenge unterhalb einer vollen Portion kann als Zusatzmenge ausgewiesen werden.

### 9.3 Tofu

```text
nicht abgedeckte Fleischesser = Fleischesser – vollständig abgedeckte Fleischesser
flexible Tofuportionen = Aufrunden(flexible Gäste × Tofu-Anteil)
Tofuportionen = Vegetarier + nicht abgedeckte Fleischesser + flexible Tofuportionen
Tofumenge = Tofuportionen × Tofuportion
```

Damit bleibt Tofu die sichere Hauptoption, ohne pauschal für alle flexiblen Gäste eine volle Portion anzusetzen.

### 9.4 Sauce und Toppings

Die aktuellen v3-Faktoren werden als Startwerte übernommen, müssen aber vor Produktivfreigabe durch einen Testkoch für mindestens 2, 4 und 8 Personen bestätigt werden.

Die Teriyaki-Sauce soll perspektivisch anhand der tatsächlich zubereiteten Proteinmenge statt ausschließlich anhand der Gesamtpersonenzahl skalieren. Für das MVP wird eine fachlich bestätigte, explizit dokumentierte Regel benötigt.

### 9.5 Lebensmittelsicherheit und Trennung

- Tofu wird vor Hähnchen gebraten.
- Für vegetarische und fleischhaltige Komponenten werden getrennte Werkzeuge ausgewiesen.
- Der Hähnchenschritt enthält einen klaren Garhinweis; eine konkrete Kerntemperatur wird erst nach fachlicher Festlegung aufgenommen.
- Avocado wird möglichst spät geschnitten.

## 10. Rezeptmodell und Erweiterbarkeit

Die App trennt generische Oberfläche und rezeptabhängige Fachlogik.

Ein Rezeptmodul enthält mindestens:

- stabile Rezept-ID
- Name, Kurzbeschreibung und Kachelmetadaten
- Standardpersonenzahl
- Eingabefelder und Standardwerte
- Zutaten mit Gruppe, Basismenge, Einheit und Rundungsregel
- optionale Zutaten und Bedingungen
- rezeptabhängige Berechnungsfunktion
- Mise-en-Place-Aufgaben
- Kochschritte mit Dauer, Abhängigkeiten und Parallelisierbarkeit
- Hinweise, Warnungen und Servierlogik

Einfache Rezepte sollen rein proportional skalierbar sein. Komplexe Rezepte wie die Teriyaki Bowl dürfen eine eigene, getestete Berechnungsfunktion besitzen. Ausführbare Formeln werden nicht als frei interpretierter Text oder per `eval` verarbeitet.

## 11. UX- und Designanforderungen

- hochwertig, ruhig und funktional
- keine dekorativen Animationen
- klare visuelle Hierarchie
- große Schrift und hoher Kontrast
- Safe-Area-Unterstützung für iPad
- responsive Darstellung für iPad Hoch-/Querformat und Desktop
- Kochansicht mit möglichst wenig Scrollbedarf pro Schritt
- Status nicht nur über Farbe vermitteln
- sichtbarer Fokus für Tastaturbedienung
- semantisches HTML und verständliche Beschriftungen
- optionaler „Bildschirm wach halten“-Hinweis; eine technische Wake-Lock-Funktion nur bei verlässlicher Browserunterstützung

Die visuelle Sprache der v3 kann als Ausgangspunkt dienen. Humorvolle Texte werden reduziert, wenn sie während des Kochens Information verdrängen.

## 12. Technische Leitplanken

### Laufzeit

- statische Web-App
- HTML, CSS und Vanilla JavaScript
- kein Backend
- kein Laufzeit-Framework
- relative Pfade, damit die App korrekt unter `/Rezepte/` läuft

### Vorgeschlagene Struktur

```text
Rezepte/
├─ index.html
├─ README.md
├─ assets/
│  ├─ styles.css
│  ├─ app.js
│  └─ icons/
├─ lib/
│  ├─ format.js
│  ├─ validation.js
│  ├─ timeline.js
│  └─ storage.js
├─ recipes/
│  ├─ index.js
│  └─ teriyaki-bowl.js
├─ tests/
│  ├─ teriyaki-bowl.test.js
│  └─ timeline.test.js
└─ docs/
   └─ PRD-Rezept-Dashboard.md
```

Die genaue Ablage dieses PRD kann bei der Umsetzung in `docs/` verschoben werden.

### Offlinefähigkeit

Die App soll zunächst auch bei kurzfristigem Verbindungsverlust nach dem Laden weiterlaufen. Eine installierbare PWA mit Service Worker und Home-Screen-Icon ist als sinnvoller Bestandteil vorgesehen, sofern sie ohne komplizierten Build-Prozess umgesetzt werden kann.

### Tests

- Berechnungen werden als reine Funktionen implementiert.
- Automatisierte Tests decken typische Werte, Grenzwerte und fehlerhafte Eingaben ab.
- Browser-Smoke-Tests prüfen Navigation, Eingaben, Fortschritt, Druckansicht und responsive Darstellung.
- Die Teriyaki-Logik erhält feste Referenzfälle für mindestens 1, 2, 4, 8 und eine größere Personenzahl.

## 13. Deployment, Datenschutz und Sicherheit

- Ziel ist der vorhandene Webspace unter `montolio.de/Rezepte/`.
- Deployment erfolgt erst nach lokaler Abnahme und explizitem „proceed“.
- Vor dem ersten Überschreiben eines bestehenden Zielverzeichnisses wird dessen Inhalt gesichert oder inventarisiert.
- FTP-Zugangsdaten werden nicht in HTML, JavaScript, README, Deployment-Artefakte oder Versionsverwaltung übernommen.
- Nur explizit freigegebene statische Dateien werden hochgeladen.
- Ein kleines Deployment-Skript kann später vorgesehen werden; es liest Zugangsdaten ausschließlich aus einer lokalen, ignorierten Datei.
- Die Seite ist ohne Authentifizierung grundsätzlich öffentlich erreichbar. `noindex` kann Suchmaschinen fernhalten, ist aber kein Zugriffsschutz.
- Rollback erfolgt durch Wiederherstellung des vorherigen statischen Stands.

## 14. Abnahmekriterien des MVP

Der MVP ist abgenommen, wenn:

1. die Startseite unter `/Rezepte/` eine funktionierende erste Kachel „Teriyaki Bowl“ zeigt,
2. Personenzahl und alle freigegebenen Bowl-Optionen dynamisch berechnet werden,
3. Zutaten, Mise en Place und Kochablauf als getrennte, logisch verbundene Ansichten verfügbar sind,
4. Hähnchen- und Tofulogik transparent und anhand definierter Testfälle korrekt ist,
5. Sriracha-Mayo mit konkreten Zutaten und Mengen enthalten ist,
6. optionale Komponenten konsequent in allen Ansichten ein- oder ausgeblendet werden,
7. der Ablauf rückwärts von der Zielzeit gerechnet wird und Mengen beziehungsweise Chargen berücksichtigt,
8. Fortschritt und letzte Einstellungen lokal erhalten bleiben,
9. Druck und Kopieren funktionieren,
10. die App auf iPad Pro 13" in Hoch- und Querformat sowie auf Desktop sauber nutzbar ist,
11. automatisierte Berechnungstests und ein visueller Browser-Smoke-Test erfolgreich sind,
12. README und Deployment-Hinweise vorhanden sind,
13. keine Zugangsdaten im ausgelieferten Verzeichnis liegen,
14. die freigegebene Version nach separater Deployment-Freigabe auf `montolio.de/Rezepte/` erreichbar ist.

## 15. Umsetzungsvorschlag in Phasen

### Phase 1 – Fundament und Teriyaki-MVP

- Bestand sichern und Zielstruktur anlegen
- generischen Rezeptkatalog bauen
- v3-Logik in ein Teriyaki-Rezeptmodul überführen und korrigieren
- Zutaten-, Mise-en-Place- und Kochansicht implementieren
- lokale Speicherung, Druck und Kopieren
- iPad- und Desktop-Tests

### Phase 2 – Offline und Betriebsreife

- PWA-Manifest und Offline-Cache
- Home-Screen-Icon
- Deployment-Skript mit sicherer Credential-Nutzung
- dokumentierter Backup- und Rollback-Prozess

### Phase 3 – Weitere Rezepte

- Rezeptvorlage und Dokumentation
- zweites Rezept als Belastungstest für die generische Architektur
- optional Kategorien, Suche und Favoriten ab einer sinnvollen Rezeptanzahl

## 16. Risiken und Gegenmaßnahmen

### Ungeprüfte Rezeptfaktoren

Die aktuelle v3 enthält plausible, aber nicht dokumentiert testgekochte Faktoren. Gegenmaßnahme: Referenzmengen fachlich bestätigen und Testfälle festschreiben.

### Zeitplan skaliert nicht mit Menge

Feste Bratzeiten funktionieren bei großen Portionen nicht. Gegenmaßnahme: Chargenregeln und klare Obergrenzen beziehungsweise Warnungen je Rezept.

### iPad schaltet den Bildschirm aus

Browser können das Wachhalten einschränken. Gegenmaßnahme: unterstützte Wake-Lock-Funktion optional nutzen und ansonsten einen klaren Hinweis geben.

### Statische Veröffentlichung ist öffentlich

Ohne Authentifizierung ist die URL grundsätzlich erreichbar. Gegenmaßnahme: Entscheidung über öffentliche Nutzung, `noindex` oder echten Zugriffsschutz auf Webspace-Ebene.

### Zugangsdaten im Projektordner

Die vorhandene `.ftp-credentials` ist ein sensibles Artefakt. Gegenmaßnahme: strikt vom Veröffentlichungsumfang und von Versionsverwaltung ausschließen.

## 17. Offene Entscheidungen vor Umsetzungsfreigabe

1. **Maximale Personenzahl:** Für welchen realistischen Bereich muss nicht nur die Mengen-, sondern auch die Zeitplanung belastbar sein?
2. **Hähnchen-Überbestand:** Soll überschüssiges Hähnchen vollständig zubereitet, nur angezeigt oder standardmäßig nicht eingeplant werden?
3. **Flexible Gäste:** Dürfen flexible Gäste zusätzlich vorhandenes Hähnchen einplanen, oder bleibt Hähnchen ausschließlich für ausgewiesene Fleischesser?
4. **Teriyaki-Sauce:** Soll sie anhand der Personenzahl oder der tatsächlichen Proteinmenge skaliert werden?
5. **Optionale Zutaten im MVP:** Welche der Optionen Reisfaktor, Avocado, Mango und Edamame müssen bereits in Version 1 veränderbar sein?
6. **Kochmodus:** Reicht eine abhakebare Zeitlinie oder sollen echte Start-/Pause-Timer pro Schritt zum MVP gehören?
7. **Offline/PWA:** Muss die App nach einmaligem Laden vollständig offline und als Home-Screen-App funktionieren?
8. **Zugriff:** Darf `montolio.de/Rezepte/` öffentlich aufrufbar sein, oder soll der Webspace einen Zugriffsschutz erhalten?
9. **Name und Schreibweise:** Produktname „Montys Rezepte“ und endgültig „Teriyaki“ statt des vorhandenen Ordnernamens „Teryaki“?

## 18. Freigabepunkt

Vor der Umsetzung werden die offenen Entscheidungen beantwortet und die fachlichen Referenzmengen der Teriyaki Bowl bestätigt. Erst danach folgen Umbau, Tests und – nach einer weiteren expliziten Freigabe – das FTP-Deployment.
