# Webseite gravaix.de (neu, Phase 2)

Die neue Webseite liegt in `apps/web` (Next.js, wie das Cockpit). Sie ersetzt später die
Onepage-Seite. **Noch nicht live** – `gravaix.de` läuft weiter auf Onepage.

## Was es gibt

| Seite | Adresse |
| --- | --- |
| Startseite | `/` |
| Veredelung (Lasergravur, Druck, Stick) | `/veredelung` |
| Lasergravur-Service mit FAQ | `/lasergravur-service` |
| Katalog (externer Blätterkatalog) | `/katalog` |
| Kontakt mit Anfrageformular | `/kontakt` |
| Impressum, Datenschutz | `/impressum`, `/datenschutz` |
| alte Adresse `/rechtsdokument` | leitet auf `/impressum` weiter |

Alle bisherigen Onepage-Adressen bleiben erhalten (siehe `docs/webseite-bestand.md`).

## Anfragen landen im Cockpit

Das Kontaktformular schickt die Anfrage an das Cockpit (`/api/anfrage`, nur mit dem
Schlüssel `ANFRAGE_TOKEN`). Dort entsteht ein Auftrag in der Spalte **Anfrage** mit allen
Angaben in den Notizen. Es wird **keine Mail** verschickt – auch keine Bestätigung an den Kunden.

Schutz vor Spam: unsichtbares Fallen-Feld, Mindest-Ausfüllzeit (3 Sekunden), höchstens
5 Anfragen pro Stunde je IP-Adresse.

## Steuer

Hinweise wie „Als Kleinunternehmer gemäß § 19 UStG …“ hängen an `istKleinunternehmer()` in
`apps/web/src/lib/firma.ts` und wechseln am 01.01.2027 von selbst (Seiten werden stündlich
neu erzeugt). Für 2027 im Impressum die USt-IdNr. nachtragen.

## Vor dem Livegang (offen)

- [ ] **Fotos und Video** von Onepage übernehmen (heute Platzhalter „Foto: …“)
- [ ] Material-Texte für Glas, Holz, Leder, Schiefer prüfen (neu formuliert, auf Onepage nicht auslesbar)
- [ ] **Impressum und Datenschutz rechtlich prüfen lassen** (Entwurf). Insbesondere: Besteht
      mit IONOS ein Vertrag zur Auftragsverarbeitung (AV-Vertrag)? Im IONOS-Kundenbereich
      unter Verträge/Datenschutz abschließen, falls nicht.
- [ ] Seite `/gastronomie` (auf Onepage noch Entwurf) – bei Bedarf übernehmen
- [ ] Testlauf auf dem Server unter einer Test-Adresse

## Testbetrieb unter neu.gravaix.de

Die Webseite läuft zum Testen unter `https://neu.gravaix.de`, geschützt mit Benutzer
`gravaix` und einem eigenen Passwort. Google nimmt sie nicht auf („noindex“).

**Passwort setzen oder ändern** (auf dem Server, `ssh celiano@cockpit.gravaix.de`):

```bash
cd ~/gravaix/infra && read -rsp "Neues Passwort für neu.gravaix.de: " PW && echo && HASH=$(docker run --rm caddy:2 caddy hash-password --plaintext "$PW") && unset PW && sed -i '/^WEB_TEST_HASH=/d' .env && printf "WEB_TEST_HASH='%s'\n" "$HASH" >> .env && grep -c '^WEB_TEST_HASH=' .env
```

Ergebnis muss `1` sein. Nach einer Änderung Caddy neu starten:

```bash
cd ~/gravaix/infra && docker compose up -d --force-recreate caddy
```

## Livegang – Schritte (jeweils nur mit Celianos Freigabe)

1. `ANFRAGE_TOKEN` in `infra/.env` auf dem Server eintragen (`openssl rand -hex 32`).
2. Dienst `web` in `infra/docker-compose.yml` ergänzen (Build `../apps/web`, Umgebung
   `ANFRAGE_TOKEN`, `COCKPIT_INTERN_URL=http://cockpit:3000`, `WEB_URL`).
3. Zum Testen eine Test-Adresse, z. B. `neu.gravaix.de`: DNS-Eintrag bei IONOS + Block im
   `Caddyfile` (mit `noindex`, damit Google die Testseite nicht findet).
4. Wenn alles passt: `gravaix.de` und `www.gravaix.de` im `Caddyfile` eintragen und den
   DNS-A-Eintrag bei IONOS auf den Server umstellen. **Die MX-Einträge (Mail) bleiben unverändert.**
5. Ein paar Tage beobachten, dann Onepage kündigen.
