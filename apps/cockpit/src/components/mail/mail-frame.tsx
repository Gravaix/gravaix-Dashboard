"use client";

import { useCallback, useRef } from "react";

/**
 * Zeigt HTML-Mails abgeschottet an:
 * - sandbox ohne "allow-scripts": Skripte in der Mail laufen nie
 * - Content-Security-Policy: nichts wird von außen geladen (keine Tracking-Pixel),
 *   außer Bilder, wenn ausdrücklich erlaubt
 * - Links öffnen in einem neuen Tab
 */
export function MailFrame({ html, bilderErlaubt }: { html: string; bilderErlaubt: boolean }) {
  const ref = useRef<HTMLIFrameElement>(null);

  const csp = [
    "default-src 'none'",
    `img-src data:${bilderErlaubt ? " https: http:" : ""}`,
    "style-src 'unsafe-inline'",
    "font-src data:",
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");

  // <meta>-Tags der Mail entfernen (z. B. "refresh", das still eine fremde Seite laden würde).
  const inhalt = html.replace(/<meta\b[^>]*>/gi, "");

  const doc = `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<base target="_blank">
<style>html,body{margin:0;padding:0;background:#fff;color:#111;font:15px/1.5 -apple-system,system-ui,sans-serif;overflow-wrap:anywhere}
body{padding:16px}img{max-width:100%;height:auto}table{max-width:100%}pre{white-space:pre-wrap}</style>
</head><body>${inhalt}</body></html>`;

  const anpassen = useCallback(() => {
    const el = ref.current;
    const body = el?.contentDocument?.documentElement;
    if (el && body) el.style.height = `${body.scrollHeight + 2}px`;
  }, []);

  return (
    <iframe
      ref={ref}
      title="Inhalt der Mail"
      srcDoc={doc}
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="no-referrer"
      onLoad={() => {
        anpassen();
        // Nach dem Laden von Bildern nochmal anpassen
        setTimeout(anpassen, 500);
        setTimeout(anpassen, 2000);
      }}
      className="block min-h-40 w-full rounded-lg border bg-white"
    />
  );
}
