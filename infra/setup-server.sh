#!/usr/bin/env bash
# Gravaix VPS – Ersteinrichtung und Absicherung
#
# Einmal als root auf dem frischen Ubuntu 24.04 ausführen:
#   bash setup-server.sh
#
# Was passiert:
#   1. System aktualisieren, Grundpakete installieren
#   2. Zeitzone Europe/Berlin, Swap-Datei
#   3. Eigener Nutzer mit sudo und SSH-Key
#   4. Firewall (nur SSH, HTTP, HTTPS offen)
#   5. Fail2ban gegen Login-Angriffe
#   6. Automatische Sicherheitsupdates
#   7. Docker + Docker Compose
#   8. SSH absichern: kein Root-Login, kein Passwort-Login (erst nach deinem Test)
#
# Das Skript kann gefahrlos mehrfach laufen.

set -euo pipefail

NEUER_NUTZER="celiano"
ZEITZONE="Europe/Berlin"
SWAP_GROESSE="4G"

[[ $EUID -eq 0 ]] || { echo "Bitte als root ausführen."; exit 1; }
# shellcheck source=/dev/null
. /etc/os-release
[[ "${ID:-}" == "ubuntu" ]] || { echo "Dieses Skript ist nur für Ubuntu."; exit 1; }
[[ -s /root/.ssh/authorized_keys ]] || { echo "Kein SSH-Key bei root hinterlegt – Abbruch, sonst sperrst du dich aus."; exit 1; }

schritt() { echo; echo "==> $*"; }

# ---------------------------------------------------------------------------
schritt "1/8 System aktualisieren"
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get -y -q -o Dpkg::Options::="--force-confold" upgrade
apt-get -y -q install ufw fail2ban python3-systemd unattended-upgrades \
  ca-certificates curl git htop

# ---------------------------------------------------------------------------
schritt "2/8 Zeitzone $ZEITZONE und Swap-Datei ($SWAP_GROESSE)"
timedatectl set-timezone "$ZEITZONE"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l "$SWAP_GROESSE" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
fi
grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab

# ---------------------------------------------------------------------------
schritt "3/8 Nutzer $NEUER_NUTZER anlegen"
if ! id "$NEUER_NUTZER" &>/dev/null; then
  adduser --disabled-password --gecos "" "$NEUER_NUTZER"
fi
usermod -aG sudo "$NEUER_NUTZER"
install -d -m 700 -o "$NEUER_NUTZER" -g "$NEUER_NUTZER" "/home/$NEUER_NUTZER/.ssh"
install -m 600 -o "$NEUER_NUTZER" -g "$NEUER_NUTZER" \
  /root/.ssh/authorized_keys "/home/$NEUER_NUTZER/.ssh/authorized_keys"

if [[ "$(passwd -S "$NEUER_NUTZER" | awk '{print $2}')" != "P" ]]; then
  echo
  echo "Lege jetzt ein Passwort für '$NEUER_NUTZER' fest."
  echo "Das brauchst du für 'sudo' (Admin-Befehle). Beim Tippen wird nichts angezeigt."
  until passwd "$NEUER_NUTZER"; do echo "Hat nicht geklappt, nochmal:"; done
fi

# ---------------------------------------------------------------------------
schritt "4/8 Firewall (ufw)"
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

# ---------------------------------------------------------------------------
schritt "5/8 Fail2ban"
cat > /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5
backend  = systemd

[sshd]
enabled = true
EOF
systemctl enable fail2ban >/dev/null
systemctl restart fail2ban

# ---------------------------------------------------------------------------
schritt "6/8 Automatische Sicherheitsupdates"
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
systemctl enable --now unattended-upgrades >/dev/null

# ---------------------------------------------------------------------------
schritt "7/8 Docker + Docker Compose"
if ! command -v docker >/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -q
  apt-get -y -q install docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin
fi
# Logs der Container begrenzen, damit die Platte nicht vollläuft
cat > /etc/docker/daemon.json <<'EOF'
{
  "log-driver": "local",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
EOF
systemctl enable docker >/dev/null
systemctl restart docker
usermod -aG docker "$NEUER_NUTZER"

# ---------------------------------------------------------------------------
schritt "8/8 SSH absichern"
SERVER_IP="$(hostname -I | awk '{print $1}')"
cat <<EOF

  WICHTIG – bevor es weitergeht:

  1. Dieses Fenster OFFEN lassen.
  2. Ein NEUES Terminal-Fenster auf dem Mac öffnen und eingeben:

       ssh $NEUER_NUTZER@$SERVER_IP

  3. Wenn du drin bist, dort eingeben:

       sudo whoami

     (Passwort von eben eingeben – die Ausgabe muss "root" sein)

EOF
read -r -p "  Hat beides geklappt? Dann 'ja' eingeben: " ANTWORT
if [[ "$ANTWORT" != "ja" ]]; then
  echo
  echo "Abgebrochen. Root-Login bleibt vorerst aktiv."
  echo "Alles andere ist eingerichtet. Skript kann gefahrlos nochmal laufen."
  exit 1
fi

# Dateien in sshd_config.d werden alphabetisch gelesen, der erste Wert gewinnt.
# Deshalb "00-", damit diese Regeln vor den Standardeinstellungen greifen.
cat > /etc/ssh/sshd_config.d/00-gravaix.conf <<EOF
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AllowUsers $NEUER_NUTZER
MaxAuthTries 3
X11Forwarding no
EOF
sshd -t
systemctl restart ssh

cat <<EOF

==> Fertig!

  Ab jetzt meldest du dich nur noch so an:
    ssh $NEUER_NUTZER@$SERVER_IP

  Root-Login und Passwort-Login sind gesperrt.
  Firewall: offen sind nur 22 (SSH), 80 und 443.

EOF
