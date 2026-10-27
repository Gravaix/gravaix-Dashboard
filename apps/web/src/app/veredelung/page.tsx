import type { Metadata } from "next";
import { Eye, Layers, Paintbrush, Scissors, Sparkles } from "lucide-react";
import { Abschnitt, AnfrageBlock, Huelle, KnopfLink, Titel, Ueberzeile } from "@/components/bausteine";

export const metadata: Metadata = {
  title: "Werbeartikel mit Logo veredeln",
  description: "Lasergravur im eigenen Haus, Druck und Stick über spezialisierte Partner – die passende Veredelung für Ihre Werbeartikel aus Aachen.",
  alternates: { canonical: "/veredelung" },
};

const TECHNIKEN = [
  {
    id: "lasergravur",
    icon: Sparkles,
    name: "Lasergravur",
    ort: "Im eigenen Haus",
    text: "Präzise, langlebig und abriebfest – die Gravur blättert nicht ab und verblasst nicht wie ein oberflächlicher Aufdruck. Ideal für dauerhafte, einfarbige Kennzeichnung auf harten Materialien.",
  },
  {
    id: "druck",
    icon: Paintbrush,
    name: "Druck",
    ort: "Über Partner",
    text: "Für mehrfarbige Motive und große Flächen – vom Kugelschreiber bis zur Tasse.",
  },
  {
    id: "stick",
    icon: Scissors,
    name: "Stick",
    ort: "Über Partner",
    text: "Für Textilien mit hoher Beanspruchung oft die langlebigere Wahl – Caps, Shirts, Jacken und Taschen.",
  },
];

const ABLAUF = [
  { titel: "Beratung", text: "Wir besprechen Anlass, Zielgruppe und Budget und schlagen passende Produkte vor." },
  { titel: "Veredelungsart wählen", text: "Lasergravur im eigenen Haus oder Druck/Stick über unsere Partner – je nach Produkt und Wirkung." },
  { titel: "Vorschau & Freigabe", text: "Sie erhalten eine digitale Vorschau oder ein Muster, bevor produziert wird." },
  { titel: "Produktion & Lieferung", text: "Nach Ihrer Freigabe setzen wir die Veredelung um – zuverlässig und termingerecht." },
];

export default function VeredelungPage() {
  return (
    <>
      <Huelle className="py-14 sm:py-20">
        <Ueberzeile>Veredelung · Aachen</Ueberzeile>
        <h1 className="max-w-3xl font-display text-4xl leading-tight tracking-tight text-balance sm:text-5xl">
          Werbeartikel veredeln: Die passende Technik für Ihr Produkt.
        </h1>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TECHNIKEN.map(({ id, icon: Icon, name, ort, text }) => (
            <article key={id} id={id} className="scroll-mt-28 rounded-3xl border bg-card p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand/15 text-brand-dunkel">
                  <Icon className="size-5" />
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{ort}</span>
              </div>
              <h2 className="mt-5 font-display text-2xl">{name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </Huelle>

      <Abschnitt className="bg-muted">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Ueberzeile>Im eigenen Haus</Ueberzeile>
            <Titel>Präzise veredelt. Dauerhaft sichtbar.</Titel>
            <p className="mt-5 text-muted-foreground">
              Unsere Lasergravur entsteht in der eigenen Manufaktur in Aachen. Sie ist präzise, langlebig und abriebfest – sie
              blättert nicht ab und verblasst nicht wie ein oberflächlicher Aufdruck.
            </p>
            <div className="mt-8">
              <KnopfLink href="/kontakt">Unverbindlich anfragen</KnopfLink>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <li className="flex gap-4 rounded-3xl border bg-card p-6">
              <Eye className="mt-0.5 size-5 shrink-0 text-brand-dunkel" />
              <div>
                <h3 className="font-medium">Digitale Vorschau</h3>
                <p className="mt-1 text-sm text-muted-foreground">Musterfreigabe vor der Produktion – Sie sehen das Ergebnis, bevor es entsteht.</p>
              </div>
            </li>
            <li className="flex gap-4 rounded-3xl border bg-card p-6">
              <Layers className="mt-0.5 size-5 shrink-0 text-brand-dunkel" />
              <div>
                <h3 className="font-medium">Kleinserien möglich</h3>
                <p className="mt-1 text-sm text-muted-foreground">Auch kleine Stückzahlen setzen wir zuverlässig um.</p>
              </div>
            </li>
          </ul>
        </div>
      </Abschnitt>

      <Abschnitt>
        <Ueberzeile>So läuft die Veredelung ab</Ueberzeile>
        <Titel>Von der Idee bis zum fertigen Werbeartikel.</Titel>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ABLAUF.map((s, i) => (
            <li key={s.titel} className="rounded-3xl border p-6">
              <span className="font-display text-4xl text-brand">{i + 1}</span>
              <h3 className="mt-4 font-medium">{s.titel}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </Abschnitt>

      <Abschnitt className="pt-0 sm:pt-0">
        <div className="max-w-3xl">
          <Ueberzeile>Welche Veredelung passt?</Ueberzeile>
          <Titel>Eine kurze Orientierung.</Titel>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Nicht jede Veredelung passt zu jedem Produkt. Als Faustregel gilt: Für dauerhafte, einfarbige Kennzeichnung auf harten
            Materialien empfehlen wir die Lasergravur. Für mehrfarbige Motive auf großen Flächen eignet sich Druck. Für Textilien mit
            hoher Beanspruchung ist Stick oft die langlebigere Wahl. Im Zweifel beraten wir Sie gerne persönlich – unverbindlich und
            ohne Verkaufsdruck.
          </p>
        </div>
      </Abschnitt>

      <AnfrageBlock />
    </>
  );
}
