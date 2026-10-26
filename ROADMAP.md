# Roadmap Gravaix Cockpit & Shop

Ein Schritt gilt erst als erledigt, wenn er auf dem Server läuft und Celiano ihn getestet hat.

## Phase 0: Fundament
- [x] GitHub-Repo `gravaix-dashboard` (privat) mit 2FA-Account
- [x] Claude Code mit Repo verbunden
- [x] IONOS VPS L+ gebucht (Ubuntu 24.04, 8 GB RAM, Rechenzentrum Spanien), SSH-Key per Cloud-Config hinterlegt
- [x] Server absichern: eigener Nutzer, SSH nur per Key, Firewall (ufw), Fail2ban, automatische Sicherheitsupdates
- [x] Docker + Docker Compose installieren (Caddy kommt als Container)
- [x] DNS bei IONOS: A-Records für `cockpit` und `cal` auf die VPS-IP
- [x] Deployment: Code per Deploy-Key auf den Server geholt, Caddy läuft mit HTTPS (Automatisierung folgt)
- [x] Tägliches Backup eingerichtet und einmal Wiederherstellung getestet (PostgreSQL, nachts 3:30, 14 Tage)
- [x] Backup-Kopie außerhalb des Servers: verschlüsselt im IONOS Object Storage Frankfurt (Objektsperre 30 Tage), Wiederherstellung getestet

## Phase 1: Cockpit (`cockpit.gravaix.de`)

### 1.1 Grundgerüst & Login
- [x] Next.js-App mit Layout und Navigation (Übersicht, Mails, Aufträge, Kalender)
- [x] Login mit Passwort + Zwei-Faktor (Authenticator-App)
- [x] Mobil gut bedienbar

### 1.2 Mails
- [ ] IONOS-Postfach anbinden (IMAP), Ordner anzeigen
- [ ] Mails lesen, suchen, Anhänge öffnen
- [ ] Antworten und neue Mails senden (SMTP)
- [ ] Mails in Ordner verschieben, als erledigt markieren

### 1.3 Auftragsboard
- [ ] Kanban: Anfrage → Angebot → Produktion → Versand → Erledigt
- [ ] Auftrag mit Kunde, Produkt, Menge, Gravurdaten/Logo-Dateien, Deadline, Preis, Notizen
- [ ] Mit einem Klick aus einer Mail einen Auftrag anlegen (Mail bleibt verknüpft)
- [ ] Preise mit MwSt.-Schalter (Kleinunternehmer bis 2026 / Regelbesteuerung ab 2027)

### 1.4 Kalender
- [ ] Radicale unter `cal.gravaix.de` mit Login
- [ ] Kalender: Aufträge, Termine, Privat
- [ ] Kalenderansicht im Cockpit (Tag/Woche/Monat), Termine anlegen und bearbeiten
- [ ] Sync mit Apple Kalender auf iPhone und Mac (Anleitung in `/docs`)
- [ ] Termin direkt aus einer Mail anlegen
- [ ] Deadlines aus dem Auftragsboard erscheinen automatisch im Kalender

### 1.5 Übersicht
- [ ] Neue Anfragen, offene Aufträge nach Status, Termine heute/diese Woche, fällige Deadlines

### 1.6 KI-Assistent (optional)
- [ ] Neue Mails vorsortieren und Anfragen erkennen (Claude API)
- [ ] Antwortentwürfe vorschlagen, Versand nur nach Freigabe
- [ ] Aus Anfrage-Mails Auftragsdaten vorausfüllen

## Phase 2: Shop (`shop.gravaix.de`)
- [ ] Medusa-Backend mit Produkten, Varianten, Lager, MwSt.
- [ ] Next.js-Shop: Startseite, Kategorien, Produktseiten, Warenkorb, Checkout
- [ ] Gravur-Editor: Logo-Upload, Text, Schriftauswahl, Live-Vorschau auf dem Produkt, Export als laserfertige SVG
- [ ] Stripe (Karte, Apple/Google Pay, Klarna, SEPA), ggf. PayPal
- [ ] Rechtliches: Impressum, AGB, Widerruf (Ausnahme personalisierte Ware), Datenschutz, Button „zahlungspflichtig bestellen“, Cookie-Hinweis
- [ ] Bestell- und Versandmails
- [ ] Shop-Bestellungen landen automatisch im Auftragsboard
- [ ] Testbestellungen, dann Launch

## Später / Ideen
- Etsy- und eBay-Bestellungen ins Auftragsboard holen
- Makito-Katalog per API in den Shop
- Social-Media-Content-Planung im Cockpit
