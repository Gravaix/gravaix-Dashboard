# Gravaix Cockpit & Shop

Dieses Repo enthält das interne Gravaix-Cockpit (Phase 1) und später den Onlineshop (Phase 2). Die Roadmap steht in `ROADMAP.md`.

## Über Gravaix
- Gravaix Lasermanufaktur, Aachen: Lasergravur und Druck, Werbeartikel, personalisierte Geschenke
- Inhaber und einziger Nutzer: Celiano
- Steuer: Kleinunternehmer (§19 UStG) bis 31.12.2026, ab 01.01.2027 Regelbesteuerung → alles mit Preisen/Rechnungen muss MwSt. von Anfang an sauber umschaltbar können

## So arbeitest du mit Celiano
- Immer auf Deutsch, kurz und direkt, per du
- Celiano ist kein Entwickler: Fachbegriffe kurz erklären, Befehle zum Kopieren in Codeblöcke, immer sagen *wo* (lokal, Server, GitHub) ein Befehl ausgeführt wird
- Kleine Schritte: ein Feature fertig machen, testen lassen, committen, dann das nächste
- **Vorher fragen** bei allem, was Daten löschen, Server-Konfiguration ändern, DNS betrifft oder Mails versendet
- Nach jedem Schritt: was wurde gemacht, wie testet Celiano es, was kommt als Nächstes

## Infrastruktur
- Server: IONOS VPS L+ (4 vCores, 8 GB RAM, 240 GB NVMe), Ubuntu 24.04 LTS, Rechenzentrum Spanien (EU)
- Zugriff nur per SSH-Key, kein Passwort-Login, kein Root-Login
- Alles läuft in Docker Compose, Caddy als Reverse Proxy mit automatischem HTTPS
- Domains (DNS bei IONOS):
  - `cockpit.gravaix.de` → Cockpit (Phase 1)
  - `cal.gravaix.de` → Radicale CalDAV-Server
  - `shop.gravaix.de` → Shop (Phase 2)
  - `gravaix.de` (Hauptseite) läuft extern auf Onepage — **nicht anfassen**

## Stack
- Next.js (App Router) + TypeScript
- PostgreSQL + Prisma
- Tailwind CSS + shadcn/ui
- Login: Auth mit TOTP-Zwei-Faktor (z.B. Better Auth), nur ein Nutzer
- Mail: IONOS-Postfach info@gravaix.de über IMAP (imapflow) und SMTP (nodemailer)
- Kalender: Radicale (CalDAV) auf dem VPS, Zugriff aus dem Cockpit per tsdav; Sync mit Apple Kalender auf iPhone/Mac
- Hintergrundjobs (Mail-Sync, Erinnerungen): eigener Worker-Container
- Phase 2: Medusa als Shop-Backend, Stripe für Zahlungen

## Mail-Ordner (bestehen bereits im IONOS-Postfach)
1 Kunden & Anfragen (mit Unterordner Erledigt), 2 Lieferanten, 3 Versand & Tracking, 4 Rechnungen, 5 Lasergrafics Übernahme, 6 Tools & Abos, 7 Werbung & Akquise, Frings Gruppe

## Feste Regeln
- Das IONOS-Postfach bleibt die Quelle der Wahrheit. Das Cockpit ist ein Mail-Client, kein Ersatz. Mails nie automatisch löschen.
- Mails werden **nie** ohne ausdrückliche Freigabe durch Celiano versendet (auch keine KI-Entwürfe)
- Zugangsdaten nur in `.env` auf dem Server. Im Repo liegt nur `.env.example` ohne echte Werte. `.env` steht in `.gitignore`.
- Kundendaten bleiben auf dem VPS in der EU (DSGVO)
- Tägliches Backup von PostgreSQL und Radicale, Backups regelmäßig testen
- Kleine Commits mit verständlicher Beschreibung, neue Features auf eigenem Branch, Merge nach Celianos Test

## Ordnerstruktur (Ziel)
```
/apps/cockpit      Next.js-Cockpit
/apps/worker       Hintergrundjobs (Mail-Sync usw.)
/apps/shop         Phase 2: Storefront
/apps/medusa       Phase 2: Shop-Backend
/infra             docker-compose.yml, Caddyfile, Setup- und Backup-Skripte
/docs              Anleitungen für Celiano
```
