# Auftragsboard im Cockpit

Unter **Aufträge** (`https://cockpit.gravaix.de/auftraege`) stehen alle Aufträge
als Karten in fünf Spalten: **Anfrage → Angebot → Produktion → Versand → Erledigt**.

## So arbeitest du damit

- **Neuer Auftrag:** Knopf oben rechts. Pflicht sind nur „Was?“ und „Kunde“.
  Jeder Auftrag bekommt eine Nummer (z. B. `A-0007`), die du am Telefon oder im
  Betreff nennen kannst.
- **Angaben:** Produkt, Menge, Gravur/Druck (Text, Schrift, Position …) und
  Preis gesamt (netto). Den Preis kannst du wie gewohnt tippen: `249,90`,
  `1.234,50` oder `12`. Bis Ende 2026 ist netto gleich Endpreis (Kleinunternehmer).
- **Weiterschieben:** Mit den Pfeilen unten auf der Karte eine Spalte nach links
  oder rechts.
- **Bearbeiten:** Auf die Karte tippen. Dort lassen sich alle Angaben und der
  Status ändern.
- **Reihenfolge:** In jeder Spalte steht oben, was zuerst fällig ist. Überfällige
  Deadlines sind rot, heutige farbig markiert.
- **Erledigt:** Zeigt die letzten 15 erledigten Aufträge. Ältere bleiben in der
  Datenbank gespeichert.
- **Am Handy** stehen die Spalten nebeneinander, zum Wechseln nach links/rechts wischen.

Löschen gibt es bewusst (noch) nicht. Aufträge liegen in der Datenbank auf dem
Server und sind im täglichen Backup enthalten.

## Kommt als Nächstes

Logo-Dateien am Auftrag, Preis mit MwSt.-Schalter und „Auftrag aus Mail anlegen“ (siehe `ROADMAP.md`, Abschnitt 1.3).
