# Cockpit auf dem Server einrichten

Einmalige Einrichtung, nachdem die Cockpit-App ins Repo gemergt wurde.
Alle Befehle laufen **auf dem Server** (per SSH vom Mac aus).

## 1. Auf den Server und Code holen

```bash
ssh celiano@DEINE-SERVER-IP
cd ~/gravaix && git pull
```

## 2. Zugangsdaten anlegen (nur beim ersten Mal)

Erzeugt die Datei `infra/.env` mit zufälligen, sicheren Werten:

```bash
cd ~/gravaix/infra
cp .env.example .env
sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(openssl rand -hex 32)|; s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=$(openssl rand -base64 32)|" .env
chmod 600 .env
```

Kontrolle (es darf kein `hier-ersetzen` mehr drinstehen):

```bash
cat .env
```

**Wichtig:** Den Inhalt der `.env` zusätzlich in deinem Passwort-Manager sichern.
Ohne `BETTER_AUTH_SECRET` müsste die Zwei-Faktor-Anmeldung neu eingerichtet werden.

## 3. Starten

```bash
cd ~/gravaix/infra
docker compose up -d --build
```

Beim ersten Mal dauert das einige Minuten (App wird gebaut). Danach prüfen:

```bash
docker compose ps
```

Alle drei Dienste (`caddy`, `cockpit`, `postgres`) sollten `running` bzw. `healthy` zeigen.

## 4. Deinen Zugang anlegen (nur beim ersten Mal)

```bash
docker compose exec cockpit npm run nutzer
```

Name und E-Mail mit Enter bestätigen (Vorgabe: Celiano / info@gravaix.de),
dann zweimal ein Passwort mit mindestens 12 Zeichen eingeben. Beim Tippen wird nichts angezeigt, das ist normal.

## 5. Erster Login

1. `https://cockpit.gravaix.de` öffnen → E-Mail + Passwort
2. Passwort noch einmal eingeben → QR-Code erscheint
3. QR-Code mit der Authenticator-App scannen (z. B. Apple Passwörter, Google Authenticator, 2FAS)
4. **Notfall-Codes sichern** (Passwort-Manager) – sie werden nur einmal angezeigt
5. Den 6-stelligen Code aus der App eingeben → fertig

Ab jetzt: Login immer mit Passwort + Code. Mit „Diesem Gerät 30 Tage vertrauen“
fragt das Cockpit auf deinem iPhone/Mac nur noch alle 30 Tage nach dem Code.

## Updates einspielen (jedes Mal nach einem Merge)

```bash
cd ~/gravaix && git pull && cd infra && docker compose up -d --build
```

## Notfall: Passwort vergessen oder Handy verloren

```bash
cd ~/gravaix/infra
docker compose exec cockpit npm run nutzer
```

Das Skript fragt, ob du das Passwort neu setzen und/oder die Zwei-Faktor-Anmeldung
zurücksetzen willst. Danach sind alle Geräte abgemeldet.

## Wenn etwas nicht klappt

Logs ansehen (mit Strg+C beenden):

```bash
docker compose logs -f cockpit
```
