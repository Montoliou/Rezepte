# Änderungs-PRD – Einfache Proteinplanung und Einkaufsliste

**Stand:** 24.06.2026  
**Status:** Am 24.06.2026 freigegeben und in Umsetzung  
**Bezug:** `PRD-Rezept-Dashboard.md`

## 1. Problem

Die aktuelle Teriyaki-Bowl-Konfiguration fragt nach:

- Vegetariern
- Fleischessern
- flexiblen Gästen
- vorhandenem Hähnchen
- Hähnchenbedarf pro Person
- Tofubedarf pro Portion
- Tofuanteil flexibler Gäste
- Behandlung von Hähnchenüberschuss

Diese Logik versucht, fehlende und vorhandene Proteinmengen automatisch auszugleichen. Für die praktische Rezeptplanung ist das unnötig komplex. Der Nutzer möchte nicht den vorhandenen Bestand verwalten, sondern wissen, welche Mengen er für die geplanten Portionen benötigt.

## 2. Ziel

Die Proteinplanung wird auf vier direkte Eingaben reduziert:

1. Hähnchen für wie viele Personen?
2. Hähnchenmenge pro Person
3. Tofu für wie viele Personen?
4. Tofumenge pro Person

Die App berechnet daraus ausschließlich den benötigten Einkaufs- beziehungsweise Vorbereitungsbedarf.

```text
Hähnchen benötigt = Hähnchenportionen × Gramm je Hähnchenportion
Tofu benötigt = Tofuportionen × Gramm je Tofuportion
```

Es gibt keine Bestands-, Ersatz-, Überschuss- oder Prozentlogik mehr.

## 3. Empfohlenes Bedienmodell

### Allgemein

- Gesamtzahl Personen
- Fertig um
- Zeitpuffer

### Proteine

- **Hähnchen für:** Personen-Stepper, Standardwert abhängig von Gesamtpersonen
- **je Hähnchenportion:** Gramm, Standard `180 g`
- **Tofu für:** Personen-Stepper
- **je Tofuportion:** Gramm, Standard `150 g`

Direkt darunter:

```text
Du brauchst:
720 g Hähnchen
300 g Tofu
```

### Validierung

Empfohlene MVP-Regel:

```text
Hähnchenportionen + Tofuportionen = Gesamtpersonen
```

- Ist die Summe kleiner, zeigt die App: `Für 2 Personen ist noch kein Protein gewählt.`
- Ist die Summe größer, zeigt die App: `Es sind 2 zusätzliche Proteinportionen eingeplant.`
- Eine größere Summe bleibt zulässig, da eine Person beide Proteine essen kann.
- Es gibt keine automatische Korrektur.

Damit funktionieren die Extremfälle eindeutig:

- `8 Hähnchen / 0 Tofu` → kein Tofu
- `0 Hähnchen / 8 Tofu` → kein Hähnchen
- `4 Hähnchen / 4 Tofu` → jeweils vier Portionen
- `8 Hähnchen / 2 Tofu` → zwei zusätzliche Proteinportionen

## 4. Einkaufsliste

Die Zutatenansicht erhält zusätzlich eine klare Einkaufsliste.

### Inhalt

- nur tatsächlich benötigte Zutaten
- gleiche dynamische Mengen wie im Rezept
- gruppiert nach:
  - Reis und Vorrat
  - Proteine
  - Gemüse und Obst
  - Saucen und Würzung
  - optionale Zutaten
- deaktivierte Zutaten erscheinen nicht
- Zutaten mit `0` Menge erscheinen nicht

### Bedienung

- Positionen abhaken
- `Einkaufsliste kopieren`
- `Einkaufsliste teilen`
- optional `Alle Haken zurücksetzen`

Beispiel:

```text
Einkaufsliste – Teriyaki Bowl für 8 Personen

640 g Sushireis
720 g Hähnchen
300 g Naturtofu
4 Avocados
2 Gurken
2 Mangos
400 g Edamame
...
```

## 5. Apple-Erinnerungen

### MVP

Die Schaltfläche **„Einkaufsliste teilen“** verwendet die Web Share API:

```javascript
navigator.share({
  title: "Einkaufsliste – Teriyaki Bowl",
  text: einkaufsliste
});
```

Auf dem iPad öffnet dies das native Share-Sheet. Dort kann der Nutzer „Erinnerungen“ auswählen. Als Fallback steht „Einkaufsliste kopieren“ bereit.

Apple beschreibt, dass Inhalte beziehungsweise markierte Aufzählungen aus Safari über das Share-Sheet an Erinnerungen übergeben werden können. Auf unterstützten Geräten kann Apple Intelligence daraus einzelne Erinnerungsvorschläge erzeugen.

### Technische Einschränkung

Die Website kann nicht garantieren, dass jede Zeile ohne weiteren Nutzerschritt als eigene Erinnerung angelegt wird. Das Verhalten hängt von iPadOS, Share-Sheet und verfügbarer Apple-Intelligence-Funktion ab.

### Optionale Ausbaustufe

Ein Apple-Kurzbefehl:

1. nimmt den geteilten Text entgegen,
2. trennt ihn an Zeilenumbrüchen,
3. legt jede Zutatenzeile als eigene Erinnerung in einer auswählbaren Liste an.

Diese Ausbaustufe wird erst umgesetzt, wenn der normale Share-Sheet-Workflow auf Andis iPad nicht ausreicht.

## 6. Entfallende Funktionen

Aus Oberfläche, Berechnungslogik, lokalem Speicher und Tests werden entfernt:

- vorhandenes Hähnchen
- Hähnchenüberschuss
- Überschuss mitbraten
- flexible Gäste
- Tofuanteil flexibler Gäste
- automatische Ersatz-Tofuportionen
- Warnungen zur Abdeckung vorhandener Hähnchenmengen

Die Begriffe `Vegetarier` und `Fleischesser` werden in der Konfiguration durch `Hähnchenportionen` und `Tofuportionen` ersetzt.

## 7. Auswirkung auf andere Berechnungen

- Teriyaki-Sauce skaliert weiterhin nach der tatsächlich geplanten Gesamtproteinmenge.
- Bratdauer und Chargen skalieren weiterhin nach berechneten Hähnchen- und Tofumengen.
- Ohne Hähnchen entfallen Hähnchen-Zutaten, Mise-en-Place- und Kochschritte.
- Ohne Tofu entfallen Tofu-Zutaten, Mise-en-Place- und Kochschritte.
- Einkaufsliste, Zutatenansicht, Mise en Place und Kochablauf verwenden dieselbe zentrale Berechnung.

## 8. Migration gespeicherter Einstellungen

Alte Browserdaten werden einmalig umgerechnet:

```text
neue Hähnchenportionen = bisherige Fleischesser
neue Tofuportionen = bisherige Vegetarier
```

Flexible Gäste werden nicht automatisch verteilt. Falls dadurch weniger Proteinportionen als Gesamtpersonen entstehen, zeigt die neue Validierung den offenen Bedarf.

Alternativ können alte Einstellungen vollständig verworfen werden. Die automatische Migration ist nutzerfreundlicher und wird empfohlen.

## 9. Abnahmekriterien

1. Im Setup gibt es keine Abfrage nach vorhandenem Hähnchen mehr.
2. Hähnchen- und Tofuportionen werden direkt eingegeben.
3. Die benötigten Grammwerte sind unmittelbar sichtbar.
4. `0` Hähnchenportionen erzeugen keinerlei Hähnchenbedarf oder Hähnchenschritt.
5. `0` Tofuportionen erzeugen keinerlei Tofubedarf oder Tofuschritt.
6. Zusätzliche beziehungsweise fehlende Proteinportionen werden verständlich angezeigt, aber nicht automatisch korrigiert.
7. Eine dynamische Einkaufsliste enthält nur tatsächlich benötigte Zutaten.
8. Kopieren funktioniert.
9. Teilen öffnet auf unterstützten Geräten das native Share-Sheet.
10. Bei fehlender Web-Share-Unterstützung bleibt Kopieren als Fallback verfügbar.
11. Berechnungs-, Migrations- und Browsertests sind grün.
12. Nach gesonderter Freigabe werden Commit, Push und Deployment durchgeführt.

## 10. Produktentscheidung

Soll eine Person standardmäßig genau **eine** Proteinportion erhalten, oder dürfen Hähnchen- und Tofuportionen die Gesamtpersonenzahl bewusst überschreiten?

**Entschieden:** Überschreiten ist zulässig und wird transparent als zusätzliche Portionen angezeigt. Das passt zu einer Bowl-Bar, bei der jemand beide Varianten probieren kann.
