import { Huelle, KnopfLink, Ueberzeile } from "@/components/bausteine";

export default function NichtGefunden() {
  return (
    <Huelle className="py-24 text-center">
      <Ueberzeile>Fehler 404</Ueberzeile>
      <h1 className="font-display text-4xl tracking-tight">Diese Seite gibt es nicht (mehr).</h1>
      <p className="mt-4 text-muted-foreground">Vielleicht hilft Ihnen die Startseite weiter – oder Sie schreiben uns direkt.</p>
      <div className="mt-8 flex justify-center gap-3">
        <KnopfLink href="/">Zur Startseite</KnopfLink>
        <KnopfLink href="/kontakt" art="rahmen">
          Kontakt
        </KnopfLink>
      </div>
    </Huelle>
  );
}
