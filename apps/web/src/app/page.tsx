import { ArrowRight, BadgeCheck, Gem, Handshake, Star } from "lucide-react";
import { Abschnitt, AnfrageBlock, BildPlatz, Huelle, KnopfLink, PfeilLink, Titel, Ueberzeile } from "@/components/bausteine";
import { FIRMA } from "@/lib/firma";

const LEISTUNGEN = [
  {
    zielgruppe: "B2B",
    titel: "Werbeartikel & Werbemittel",
    text: "Große Auswahl, veredelt mit Logo, Slogan oder QR-Code – passend zu Branche, Budget und Anlass.",
    link: { href: "/katalog", text: "Katalog durchblättern" },
  },
  {
    zielgruppe: "B2B & Privat",
    titel: "Lasergravur-Service",
    text: "Gravur und Zuschnitt auf Metall, Glas, Holz, Leder & mehr – Lohnbeschriftung, Einzelstücke und Geschenke.",
    link: { href: "/lasergravur-service", text: "Lasergravur entdecken" },
  },
];

const STIMMEN = [
  {
    text: "Von der ersten Kontaktaufnahme bis zum hochwertigen Endergebnis sind wir mit allem rundum zufrieden! Ausführliche Beratung zu einer individuellen Lösung für unser Anliegen, schneller Versand und einfach das „sich kümmern“ hat uns von Gravaix als Dienstleister überzeugt. Vielen Dank!",
    name: "Catharina Stevens",
    firma: "M3 Connect",
  },
  {
    text: "Wir haben Kugelschreiber bestellt, als auch Visitenkarten! Top Service, kann alles individuell gestaltet werden und die Lieferung war auch sehr schnell und zuverlässig! Kann ich nur weiterempfehlen!",
    name: "Nico Schiffers",
    firma: "Schiffers & Partner",
  },
  {
    text: "Ich bin rundum zufrieden! Die Zusammenarbeit mit Gravaix war von Anfang an schnell, freundlich und völlig unkompliziert. Meine Bierdeckel mit Logo wurden exakt nach meinen Vorstellungen umgesetzt – die Qualität ist hervorragend, das Ergebnis sieht toll aus. […] Ich kann Gravaix uneingeschränkt weiterempfehlen.",
    name: "Spyros Botsios",
    firma: "Imbiss Thessaloniki",
  },
];

const GRUENDE = [
  {
    icon: Handshake,
    titel: "Persönlicher Ansprechpartner",
    text: "Kurze Abstimmungswege und individuelle Beratung – von der Produktauswahl bis zur Freigabe.",
  },
  {
    icon: Gem,
    titel: "Lasergravur im eigenen Haus",
    text: "Präzise, langlebig und abriebfest. Blättert nicht ab und verblasst nicht wie ein oberflächlicher Aufdruck.",
  },
  {
    icon: BadgeCheck,
    titel: "Passende Auswahl",
    text: "Produkte passend zu Unternehmen, Zielgruppe, Budget und Anlass – auch in kleinen Stückzahlen.",
  },
];

const BRANCHEN = ["Handwerk", "Gastronomie", "Beauty", "Vereine", "Büro & Alltag", "Give Aways"];

export default function Startseite() {
  return (
    <>
      {/* Kopfbereich */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--brand)_22%,transparent),transparent_60%)]" aria-hidden />
        <Huelle className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div>
            <Ueberzeile>Werbeartikel · Lasergravur · Aachen</Ueberzeile>
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Lasergravur &amp; Werbeartikel aus Aachen – präzise, persönlich und hochwertig.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Gravaix verbindet eine große Auswahl an Werbeartikeln mit persönlicher Beratung und präziser Lasergravur aus der
              eigenen Manufaktur – für Markenauftritte, die im Alltag tatsächlich genutzt werden.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <KnopfLink href="/kontakt">
                Unverbindlich anfragen
                <ArrowRight className="size-4" />
              </KnopfLink>
              <KnopfLink href="/veredelung" art="rahmen">
                Veredelung entdecken
              </KnopfLink>
            </div>
            <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex text-brand" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </span>
              Bewertet mit 5 Sternen auf Google
            </p>
          </div>
          <BildPlatz text="Foto: Laser in der Manufaktur" className="aspect-[4/5] max-h-[34rem] w-full sm:aspect-[4/3] lg:aspect-[4/5]" />
        </Huelle>
      </section>

      {/* Zwei Leistungen */}
      <Abschnitt className="bg-muted">
        <div className="max-w-2xl">
          <Ueberzeile>Zwei Leistungen, ein Ansprechpartner</Ueberzeile>
          <Titel>Werbeartikel oder Lasergravur – was suchen Sie?</Titel>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {LEISTUNGEN.map((l) => (
            <article key={l.titel} className="flex flex-col rounded-3xl border bg-card p-6 sm:p-8">
              <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{l.zielgruppe}</span>
              <h3 className="mt-5 font-display text-2xl">{l.titel}</h3>
              <p className="mt-3 flex-1 text-muted-foreground">{l.text}</p>
              <div className="mt-6">
                <PfeilLink href={l.link.href}>{l.link.text}</PfeilLink>
              </div>
            </article>
          ))}
        </div>
      </Abschnitt>

      {/* Fertige Arbeiten */}
      <Abschnitt>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Ueberzeile>Fertige Arbeiten</Ueberzeile>
            <Titel>Aus unserer Manufaktur.</Titel>
          </div>
          <PfeilLink href="/lasergravur-service">Was wir gravieren</PfeilLink>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {["Gravur auf Edelstahl", "Glas mit Logo", "Holz-Schneidebrett", "Lederpatch"].map((t, i) => (
            <BildPlatz key={t} text={t} className={i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"} />
          ))}
        </div>
      </Abschnitt>

      {/* Kundenstimmen */}
      <Abschnitt className="bg-muted">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Ueberzeile>Kundenstimmen</Ueberzeile>
            <Titel>Was Kunden über Gravaix sagen.</Titel>
          </div>
          <a href={FIRMA.google} target="_blank" rel="noopener" className="text-sm font-medium text-brand-dunkel hover:text-foreground">
            Alle Bewertungen auf Google ↗
          </a>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {STIMMEN.map((s) => (
            <figure key={s.name} className="flex flex-col rounded-3xl border bg-card p-6 sm:p-8">
              <div className="flex text-brand" aria-label="5 von 5 Sternen">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed">„{s.text}“</blockquote>
              <figcaption className="mt-6 text-sm">
                <span className="font-medium">{s.name}</span>
                <span className="text-muted-foreground"> · {s.firma}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Abschnitt>

      {/* Warum Gravaix */}
      <Abschnitt>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Ueberzeile>Warum Gravaix</Ueberzeile>
            <Titel>Ihr Werbeartikel-Partner in Aachen – persönlich statt anonym.</Titel>
            <p className="mt-5 text-muted-foreground">
              Regionale Nähe, ein fester Ansprechpartner und eine digitale Vorschau vor der Produktion – damit Ihr Werbeartikel
              genau so wird, wie Sie ihn sich vorstellen.
            </p>
            <div className="mt-8">
              <KnopfLink href="/kontakt" art="rahmen">
                Beratung vereinbaren
              </KnopfLink>
            </div>
          </div>
          <ul className="grid gap-4">
            {GRUENDE.map(({ icon: Icon, titel, text }) => (
              <li key={titel} className="flex gap-5 rounded-3xl border bg-card p-6">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand-dunkel">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-medium">{titel}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Abschnitt>

      {/* Branchen */}
      <Abschnitt className="pt-0 sm:pt-0">
        <div className="rounded-3xl border p-6 sm:p-10">
          <Ueberzeile>Für Ihre Branche</Ueberzeile>
          <Titel>Werbeartikel für nahezu jede Branche.</Titel>
          <p className="mt-3 text-muted-foreground">Personalisiert mit Logo, Namen oder QR-Code.</p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {BRANCHEN.map((b) => (
              <li key={b} className="rounded-full border bg-card px-4 py-2 text-sm">
                {b}
              </li>
            ))}
          </ul>
        </div>
      </Abschnitt>

      <AnfrageBlock
        titel="Persönlich für Unternehmen gemacht."
        text="Erzählen Sie uns von Ihrem Vorhaben – Sie erhalten Ihr individuelles Angebot innerhalb von 24 Stunden."
      />
    </>
  );
}
