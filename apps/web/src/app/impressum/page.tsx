import type { Metadata } from "next";
import { Rechtstext } from "@/components/rechtstext";
import { FIRMA, istKleinunternehmer } from "@/lib/firma";

export const metadata: Metadata = { title: "Impressum", alternates: { canonical: "/impressum" } };

export default function ImpressumPage() {
  return (
    <Rechtstext titel="Impressum">
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        {FIRMA.name}
        <br />
        Inhaber: {FIRMA.inhaber}
        <br />
        {FIRMA.strasse}
        <br />
        {FIRMA.ort}
        <br />
        Deutschland
      </p>

      <h2>Kontakt</h2>
      <p>
        Telefon: <a href={FIRMA.telefonLink}>{FIRMA.telefonAnzeige}</a>
        <br />
        E-Mail: <a href={`mailto:${FIRMA.email}`}>{FIRMA.email}</a>
      </p>

      <h2>Umsatzsteuer</h2>
      {istKleinunternehmer() ? (
        <p>Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).</p>
      ) : (
        // TODO ab 2027: Umsatzsteuer-Identifikationsnummer eintragen, sobald vorhanden
        <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: wird nachgetragen.</p>
      )}

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>
        {FIRMA.inhaber}
        <br />
        {FIRMA.strasse}, {FIRMA.ort}
      </p>

      <h2>Verbraucherstreitbeilegung</h2>
      <p>Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
    </Rechtstext>
  );
}
