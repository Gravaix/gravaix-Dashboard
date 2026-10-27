import Link from "next/link";
import { FIRMA } from "@/lib/firma";
import { Logo } from "@/components/kopf";

export function Fuss() {
  const spalte = "grid content-start gap-2 text-sm";
  const kopf = "mb-1 text-xs font-semibold tracking-[0.2em] text-white/50 uppercase";
  const link = "text-white/80 hover:text-white";
  return (
    <footer className="mt-auto bg-dunkel text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="grid content-start gap-4">
          <div className="[&_span]:text-white [&_span+span]:text-white/50">
            <Logo />
          </div>
          <p className="text-sm text-white/70">
            Werbeartikel, die Unternehmen sichtbar machen – persönlich beraten, hochwertig veredelt und zuverlässig umgesetzt.
          </p>
          <div className="flex gap-4 text-sm">
            <a href={FIRMA.instagram} target="_blank" rel="noopener" className={link}>
              Instagram
            </a>
            <a href={FIRMA.tiktok} target="_blank" rel="noopener" className={link}>
              TikTok
            </a>
          </div>
        </div>
        <div className={spalte}>
          <p className={kopf}>Leistungen</p>
          <Link href="/veredelung" className={link}>
            Lasergravur
          </Link>
          <Link href="/veredelung#druck" className={link}>
            Druck &amp; Stick
          </Link>
          <Link href="/lasergravur-service" className={link}>
            Gravuren &amp; Zuschnitte
          </Link>
          <Link href="/katalog" className={link}>
            Werbeartikel-Katalog
          </Link>
          <Link href="/kontakt" className={link}>
            Beratung
          </Link>
        </div>
        <div className={spalte}>
          <p className={kopf}>Kontakt</p>
          <span className="text-white/80">{FIRMA.name}</span>
          <a href={FIRMA.telefonLink} className={link}>
            {FIRMA.telefonAnzeige}
          </a>
          <a href={FIRMA.whatsapp} target="_blank" rel="noopener" className={link}>
            WhatsApp
          </a>
          <a href={`mailto:${FIRMA.email}`} className={link}>
            {FIRMA.email}
          </a>
        </div>
        <div className={spalte}>
          <p className={kopf}>Erreichbar</p>
          <span className="text-white/80">{FIRMA.zeiten}</span>
          <span className="text-white/80">{FIRMA.gebiet}</span>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-white/50 sm:px-6">
          <p className="max-w-4xl">
            Gravaix ist Ihr Partner für Werbeartikel, Werbemittel und Lasergravur in Aachen: personalisierte Produkte mit Logo,
            Lasergravur auf Metall, Glas, Holz, Kunststoff, Keramik, Leder und Stein, Laserzuschnitte sowie Lohnbeschriftung –
            für Unternehmen, Handwerk, Gastronomie, Vereine und Privatkunden in Aachen und der Städteregion.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            <span>© {new Date().getFullYear()} {FIRMA.name}</span>
            <Link href="/impressum" className="hover:text-white">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-white">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
