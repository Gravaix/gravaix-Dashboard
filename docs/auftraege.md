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
- **Dateien:** Im geöffneten Auftrag unten „Dateien hinzufügen“ – Logos,
  Druckvorlagen (SVG, PDF, AI, EPS …) oder Fotos, bis 25 MB pro Datei, mehrere
  auf einmal. Bilder zeigen ein Vorschaubild, Antippen öffnet bzw. lädt herunter.
  Das ✕ entfernt eine Datei (mit Rückfrage). Die Dateien liegen in der Datenbank
  und sind damit im täglichen Backup und in der externen Kopie enthalten.
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

## Auftrag aus einer Mail anlegen

- In einer Mail auf **„Auftrag anlegen“** tippen. Das Formular ist vorausgefüllt:
  Betreff als Titel, Absender als Kunde mit E-Mail, der Text der Mail in den Notizen.
- **Anhänge** (z. B. Logos) sind angehakt und werden beim Speichern an den Auftrag
  gehängt. Was du nicht brauchst, einfach abhaken.
- Die Mail bleibt **verknüpft**: Im Auftrag steht oben „Verknüpfte Mail“, in der
  Mail (und in allen Antworten im selben Verlauf) steht der Auftrag. Das klappt auch,
  wenn die Mail später nach „Erledigt“ oder in einen anderen Ordner verschoben wird.
- Bei Mails aus „Gesendet“ wird der Empfänger als Kunde eingetragen.

## Kommt als Nächstes

Preis mit MwSt.-Schalter (siehe `ROADMAP.md`, Abschnitt 1.3).
