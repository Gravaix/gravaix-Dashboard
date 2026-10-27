import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { AnfrageBlock, Huelle, KnopfLink, Ueberzeile } from "@/components/bausteine";
import { FIRMA } from "@/lib/firma";

export const metadata: Metadata = {
  title: "Katalog: Individuelle Werbemittel & Gravur-Design",
  description: "Unser Werbeartikel-Katalog 2026 – von Technik über Trinkgefäße bis Textilien. Auf Wunsch beraten wir Sie persönlich zur passenden Auswahl.",
  alternates: { canonical: "/katalog" },
};

const KAPITEL: [string, number][] = [
  ["Rucksäcke, Gürteltaschen, Umhängetaschen & Lanyards", 6],
  ["Technik", 72],
  ["Technik-Zubehör", 134],
  ["Business & Büro", 150],
  ["Notizbücher, Blöcke & Haftnotizen", 194],
  ["Trinkgefäße", 238],
  ["Tassen & Becher", 290],
  ["To Go", 332],
  ["Taschen", 356],
  ["Schreibgeräte", 396],
  ["Sport", 454],
  ["Outdoor & Picknick", 492],
  ["Reise", 514],
  ["Deko & Stil", 540],
  ["Zuhause", 552],
  ["Bar-, Wein- & Hotelzubehör", 576],
  ["Trophäen, Geschenke & Premium-Artikel", 604],
  ["Körperpflege, Wellness & Pharma", 660],
  ["Kinder", 696],
  ["Haustiere", 746],
  ["Auto", 754],
  ["Werkzeug & Heimwerken", 768],
  ["Landwirtschaft", 788],
  ["Kopfbedeckungen", 802],
  ["Sommer", 832],
  ["Regen & Kälte", 890],
  ["Events, Feiern & öffentliche Veranstaltungen", 924],
  ["Sonder-Sublimation", 944],
  ["Verpackung", 964],
  ["Textilien", 981],
  ["Weihnachten", 1114],
  ["Einzigartige Angebote", 1124],
];

export default function KatalogPage() {
  return (
    <>
      <Huelle className="py-14 sm:py-20">
        <Ueberzeile>Katalog</Ueberzeile>
        <h1 className="max-w-3xl font-display text-4xl leading-tight tracking-tight sm:text-5xl">Unser Werbeartikel-Katalog 2026.</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Blättern Sie durch unser gesamtes Sortiment – von Werbeartikeln bis zu veredelbaren Produkten für nahezu jede Branche. Auf
          Wunsch beraten wir Sie persönlich zur passenden Auswahl.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <KnopfLink href={FIRMA.katalog}>
            Katalog öffnen
            <ExternalLink className="size-4" />
          </KnopfLink>
          <KnopfLink href="/kontakt" art="rahmen">
            Auswahl anfragen
          </KnopfLink>
        </div>

        <h2 className="mt-16 mb-4 text-xs font-semibold tracking-[0.25em] text-brand-dunkel uppercase">Kapitel im Katalog</h2>
        <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {KAPITEL.map(([name, seite]) => (
            <li key={name} className="border-b">
              <a
                href={`${FIRMA.katalog}#page/${seite}`}
                target="_blank"
                rel="noopener"
                className="flex items-baseline justify-between gap-4 py-3 text-sm hover:text-brand-dunkel"
              >
                {name}
                <span className="text-xs text-muted-foreground tabular-nums">S. {seite}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">Die Kapitel öffnen den Katalog in einem neuen Tab an der jeweiligen Seite.</p>
      </Huelle>
      <AnfrageBlock
        titel="Nicht das Richtige gefunden?"
        text="Der Katalog zeigt eine Auswahl unseres Sortiments. Gerne stellen wir Ihnen unverbindlich eine passende Produktauswahl zusammen – abgestimmt auf Branche, Budget und Anlass."
      />
    </>
  );
}
