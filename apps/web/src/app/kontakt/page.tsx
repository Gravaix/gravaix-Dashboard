import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { AnfrageFormular } from "@/components/anfrage-formular";
import { Huelle, Ueberzeile } from "@/components/bausteine";
import { FIRMA } from "@/lib/firma";

export const metadata: Metadata = {
  title: "Kontakt – Ihre Gravur-Experten in Aachen",
  description: "Erzählen Sie uns von Ihrem Vorhaben – unverbindliches Angebot innerhalb von 24 Stunden. Telefon, WhatsApp oder E-Mail.",
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  const eintrag = "flex items-center gap-3 rounded-2xl border bg-card p-4 text-sm hover:border-foreground/30";
  return (
    <Huelle className="py-14 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[1.4fr_0.6fr]">
        <div>
          <Ueberzeile>Kontakt</Ueberzeile>
          <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">Erzählen Sie uns von Ihrem Vorhaben.</h1>
          <p className="mt-4 mb-10 max-w-xl text-lg text-muted-foreground">
            Gerne stellen wir Ihnen unverbindlich eine passende Produktauswahl für Ihr Unternehmen zusammen.
          </p>
          <AnfrageFormular />
        </div>
        <aside className="grid content-start gap-3 lg:pt-28">
          <h2 className="font-display text-2xl">Direkt erreichbar</h2>
          <p className="mb-2 text-sm text-muted-foreground">
            Sie sprechen direkt mit der Manufaktur in Aachen – kurze Wege, klare Absprachen, verlässliche Umsetzung.
          </p>
          <a href={FIRMA.telefonLink} className={eintrag}>
            <Phone className="size-4 text-brand-dunkel" />
            {FIRMA.telefonAnzeige}
          </a>
          <a href={FIRMA.whatsapp} target="_blank" rel="noopener" className={eintrag}>
            <MessageCircle className="size-4 text-brand-dunkel" />
            WhatsApp schreiben
          </a>
          <a href={`mailto:${FIRMA.email}`} className={eintrag}>
            <Mail className="size-4 text-brand-dunkel" />
            {FIRMA.email}
          </a>
          <p className="mt-4 text-sm text-muted-foreground">{FIRMA.zeiten}</p>
          <div className="mt-4 rounded-2xl bg-muted p-4 text-sm">
            <p className="font-medium">Gut zu wissen</p>
            <p className="mt-1 text-muted-foreground">Lasergravur entsteht im eigenen Haus. Druck und Stick setzen wir über spezialisierte Partner um.</p>
          </div>
        </aside>
      </div>
    </Huelle>
  );
}
