import type { Metadata } from "next";
import { Check, Plus } from "lucide-react";
import { Abschnitt, AnfrageBlock, Huelle, KnopfLink, Titel, Ueberzeile } from "@/components/bausteine";
import { FIRMA, istKleinunternehmer } from "@/lib/firma";

export const metadata: Metadata = {
  title: "Lohngravur Aachen: Ihr Material, unser Laser",
  description:
    "Lasergravur in Aachen für Firmen und Privatkunden: Serienbeschriftung, Einzelstücke und Geschenke auf Metall, Glas, Holz, Leder und Schiefer – gerne auf Ihrem Material.",
  alternates: { canonical: "/lasergravur-service" },
};

const MATERIALIEN = [
  { name: "Metalle", text: "Präzise, dauerhaft und abriebfest in Edelstahl, Aluminium und Messing.", punkte: ["Hoher Kontrast, scharfe Kanten", "Kratz- und wetterfest", "Ideal für Schlüsselanhänger & Beschilderung"] },
  { name: "Glas", text: "Feine Gravur direkt im Glas – spülmaschinenfest, weil nichts aufgedruckt wird.", punkte: ["Gläser, Flaschen, Karaffen", "Muster vorab empfohlen"] },
  { name: "Holz", text: "Warme, natürliche Optik mit Tiefe – für Geschenke, Schilder und Verpackungen.", punkte: ["Gravur und Zuschnitt", "Schneidebretter, Boxen, Aufsteller"] },
  { name: "Leder", text: "Edle Prägeoptik ohne Farbe – für Patches, Etuis und Accessoires.", punkte: ["Echtleder und Kunstleder", "Logos und Namen"] },
  { name: "Schiefer", text: "Kontrastreiche, helle Gravur auf dunklem Naturstein.", punkte: ["Untersetzer, Tafeln, Schilder"] },
];

const WEGE = [
  { titel: "Lohnbeschriftung", gruppe: "B2B", text: "Serienbeschriftung von Bauteilen, Typenschildern und Produkten – auch auf Ihrem angelieferten Material." },
  { titel: "Einzelstücke & Sonderanfertigungen", gruppe: "B2B & Privat", text: "Einzelne Gravuren und Zuschnitte nach Ihrer Vorlage – vom Prototyp bis zum Unikat." },
  { titel: "Geschenke mit Gravur", gruppe: "Privat", text: "Persönliche Geschenkartikel mit Namen, Datum oder Motiv – für Anlässe, die in Erinnerung bleiben." },
];

function fragen() {
  return [
    {
      frage: "Was kostet eine individuelle Gravur auf einem mitgebrachten Gegenstand?",
      antwort: `Individuelle Gravuren auf mitgebrachten Gegenständen gibt es ab 25 €. Der Preis hängt vom Material und von der Größe ab. Schreiben Sie uns kurz, was graviert werden soll, dann nennen wir Ihnen den genauen Preis.${
        istKleinunternehmer() ? " Als Kleinunternehmer gemäß § 19 UStG weisen wir keine Umsatzsteuer aus." : " Alle Preise inkl. 19 % MwSt."
      }`,
    },
    { frage: "Kann ich eigene Gegenstände zum Gravieren mitbringen?", antwort: "Ja. Wir gravieren auf mitgebrachten Gegenständen, zum Beispiel auf Gläsern, Holz, Metall oder Schlüsselanhängern. Ob sich ein Material eignet, klären wir vorab mit Ihnen." },
    { frage: "Sind gravierte Gläser spülmaschinenfest?", antwort: "Ja. Die Gravur wird in das Glas eingebracht und nicht aufgedruckt, deshalb hält sie auch in der Spülmaschine." },
    { frage: "Brauche ich bei Glas vorab ein Muster?", antwort: "Bei Glas empfehlen wir vorab ein Muster, zum Beispiel eine Musterflasche. Das Ergebnis hängt stark von der Glasqualität ab, und jedes Glas reagiert anders auf den Laser." },
    { frage: "In welchem Format sollte mein Logo vorliegen?", antwort: "Am besten als Vektordatei, zum Beispiel SVG oder PDF. Auch andere Formate schauen wir uns gerne an." },
    { frage: "Wo arbeitet Gravaix und wohin liefern Sie?", antwort: "Die Gravaix Lasermanufaktur sitzt in Aachen, die Lasergravur entsteht im eigenen Haus. Wir arbeiten für Kunden in Aachen und der Städteregion Aachen, der Versand ist deutschlandweit möglich." },
    { frage: "Wie schnell bekomme ich ein Angebot?", antwort: "Sie erhalten Ihr individuelles Angebot innerhalb von 24 Stunden." },
    { frage: "Wann ist Gravaix erreichbar?", antwort: `${FIRMA.zeiten.replace("Mo–Fr", "Montag bis Freitag").replace("Sa", "samstags")}, telefonisch unter ${FIRMA.telefonAnzeige} oder per E-Mail an ${FIRMA.email}.` },
  ];
}

export default function LasergravurPage() {
  const faq = fragen();
  // Strukturierte Daten: Google kann die Fragen direkt in den Suchergebnissen zeigen.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.frage, acceptedAnswer: { "@type": "Answer", text: f.antwort } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Huelle className="py-14 sm:py-20">
        <Ueberzeile>Lasergravur-Service · Aachen</Ueberzeile>
        <h1 className="max-w-3xl font-display text-4xl leading-tight tracking-tight text-balance sm:text-5xl">
          Lasergravur in Aachen. Für Firmen und Privatkunden.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Ob Serienbeschriftung, Einzelstück oder Geschenk mit persönlicher Gravur – wir lasern in der eigenen Manufaktur. Gerne
          auch auf Ihrem mitgebrachten Material.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <KnopfLink href="/kontakt">Unverbindlich anfragen</KnopfLink>
          <KnopfLink href="/veredelung" art="rahmen">
            Werbeartikel veredeln
          </KnopfLink>
        </div>
      </Huelle>

      <Abschnitt className="bg-muted">
        <Ueberzeile>Materialien</Ueberzeile>
        <Titel>Was wir gravieren und zuschneiden.</Titel>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MATERIALIEN.map((m) => (
            <article key={m.name} className="rounded-3xl border bg-card p-6">
              <h3 className="font-display text-2xl">{m.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{m.text}</p>
              <ul className="mt-4 grid gap-1.5 text-sm">
                {m.punkte.map((p) => (
                  <li key={p} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-dunkel" />
                    {p}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Abschnitt>

      <Abschnitt>
        <Ueberzeile>Für jeden Anlass</Ueberzeile>
        <Titel>Drei Wege zu Ihrer Gravur.</Titel>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {WEGE.map((w) => (
            <article key={w.titel} className="rounded-3xl border p-6">
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{w.gruppe}</span>
              <h3 className="mt-4 font-medium">{w.titel}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{w.text}</p>
            </article>
          ))}
        </div>
      </Abschnitt>

      <Abschnitt className="pt-0 sm:pt-0">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Ueberzeile>Häufige Fragen</Ueberzeile>
            <Titel>Fragen zur Lasergravur, kurz beantwortet.</Titel>
          </div>
          <div className="divide-y rounded-3xl border bg-card">
            {faq.map((f) => (
              <details key={f.frage} className="group p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                  {f.frage}
                  <Plus className="mt-0.5 size-4 shrink-0 transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.antwort}</p>
              </details>
            ))}
          </div>
        </div>
      </Abschnitt>

      <AnfrageBlock titel="Material schon vorhanden?" text="Bringen Sie Ihr Werkstück vorbei – wir prüfen kurz, ob es lasergeeignet ist." knopf="Anfrage stellen" />
    </>
  );
}
