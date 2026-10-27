# Radicale – CalDAV-Kalenderserver für cal.gravaix.de
# (wird auf dem Server von docker compose gebaut)
FROM python:3.13-alpine
RUN pip install --no-cache-dir radicale==3.8.3 \
 && adduser -D -H -u 1000 radicale \
 && mkdir -p /data && chown radicale:radicale /data
COPY config /etc/radicale/config
COPY start.sh /start.sh
USER radicale
EXPOSE 5232
CMD ["/bin/sh", "/start.sh"]
