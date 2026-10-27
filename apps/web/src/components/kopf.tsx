import Link from "next/link";
import { Menu, MessageCircle, Phone } from "lucide-react";
import { FIRMA, NAVIGATION } from "@/lib/firma";

export function Logo() {
  return (
    <Link href="/" className="leading-none" aria-label="Gravaix – zur Startseite">
      <span className="block font-display text-2xl tracking-[0.18em]">GRAVAIX</span>
      <span className="block text-[10px] tracking-[0.32em] text-muted-foreground uppercase">Lasermanufaktur</span>
    </Link>
  );
}

export function Kopf() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm lg:flex" aria-label="Hauptmenü">
          {NAVIGATION.map((n) => (
            <Link key={n.href} href={n.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {n.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={FIRMA.whatsapp}
            target="_blank"
            rel="noopener"
            className="hidden size-10 items-center justify-center rounded-full border hover:bg-muted sm:flex"
            aria-label="WhatsApp schreiben"
          >
            <MessageCircle className="size-4" />
          </a>
          <Link
            href="/kontakt"
            className="hidden h-10 items-center rounded-full bg-dunkel px-5 text-sm font-medium text-white hover:bg-brand-dunkel sm:inline-flex"
          >
            Anfrage stellen
          </Link>
          <a href={FIRMA.telefonLink} className="flex size-10 items-center justify-center rounded-full border hover:bg-muted sm:hidden" aria-label="Anrufen">
            <Phone className="size-4" />
          </a>
          {/* Handy-Menü ohne JavaScript: aufklappbar */}
          <details className="group relative lg:hidden">
            <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border hover:bg-muted [&::-webkit-details-marker]:hidden" aria-label="Menü">
              <Menu className="size-4" />
            </summary>
            <nav className="absolute top-12 right-0 grid w-64 gap-1 rounded-2xl border bg-card p-2 shadow-xl" aria-label="Menü">
              <Link href="/" className="rounded-xl px-4 py-3 text-sm hover:bg-muted">
                Startseite
              </Link>
              {NAVIGATION.map((n) => (
                <Link key={n.href} href={n.href} className="rounded-xl px-4 py-3 text-sm hover:bg-muted">
                  {n.name}
                </Link>
              ))}
              <Link href="/kontakt" className="mt-1 rounded-xl bg-dunkel px-4 py-3 text-center text-sm font-medium text-white">
                Anfrage stellen
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
