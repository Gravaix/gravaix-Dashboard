# Automatische Updates (Deployment)

Der Server schaut **alle 5 Minuten** auf GitHub nach, ob es auf `main` eine neue
Version gibt. Wenn ja, spielt er sie selbst auf. Du musst nach einem Merge auf
GitHub nichts mehr auf dem Server tun (außer neue Einträge in `infra/.env`,
wenn ein Feature das braucht – das sage ich dir dann).

Ablauf bei einer neuen Version (`infra/deploy.sh`):

1. Backup der Datenbank (wie das nächtliche, inkl. Kopie nach Frankfurt)
2. Neue Version holen
3. Container neu bauen und starten – scheitert der Build, läuft die alte Version weiter
4. Prüfen, ob `cockpit.gravaix.de` wieder antwortet

GitHub hat dabei **keinen Zugang zum Server** – der Server holt sich die Updates selbst.

## Einmalig einrichten (auf dem Server)

```bash
(crontab -l 2>/dev/null | grep -v gravaix/infra/deploy.sh; echo "*/5 * * * * $HOME/gravaix/infra/deploy.sh >> $HOME/deploy.log 2>&1") | crontab -
crontab -l
```

Es sollten zwei Zeilen erscheinen: das Backup (`30 3 * * *`) und das Update (`*/5 * * * *`).

## Nachsehen, was passiert ist

```bash
tail -n 20 ~/deploy.log
```

Steht dort nichts Neues, gab es auch keine neue Version – das Skript schreibt nur,
wenn es etwas tut.

## Wenn ein Update fehlschlägt

Im Log steht `ABBRUCH`, `FEHLER` oder `WARNUNG` mit dem Grund. Die fehlgeschlagene
Version wird **nicht** alle 5 Minuten neu versucht (sonst entstünden dauernd Backups).
Die nächste neue Version auf GitHub wird wieder normal aufgespielt.

Dieselbe Version nochmal versuchen (z. B. nach einem Netzwerkproblem):

```bash
~/gravaix/infra/deploy.sh --erneut
```

Bei Fehlern: die letzten Zeilen aus `~/deploy.log` an Claude schicken.

## Wichtig

- Auf dem Server **keine Dateien im Repo-Ordner `~/gravaix` von Hand ändern**
  (außer `infra/.env`). Sonst bricht das Update zur Sicherheit ab.
- Ausschalten (z. B. für Wartung): Zeile mit `deploy.sh` entfernen mit
  `crontab -l | grep -v gravaix/infra/deploy.sh | crontab -`
