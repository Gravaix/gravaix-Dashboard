import type { Metadata } from "next";
import Link from "next/link";
import { Rechtstext } from "@/components/rechtstext";
import { FIRMA } from "@/lib/firma";

export const metadata: Metadata = { title: "Datenschutz", alternates: { canonical: "/datenschutz" } };

// ENTWURF – vor dem Livegang rechtlich prüfen lassen (siehe docs/webseite.md).

export default function DatenschutzPage() {
  return (
    <Rechtstext titel="Datenschutzerklärung">
      <p>
        Wir freuen uns über Ihr Interesse. Diese Seite erklärt, welche personenbezogenen Daten beim Besuch von gravaix.de und bei
        einer Anfrage verarbeitet werden – kurz gesagt: nur so viel wie nötig, ohne Tracking und ohne Werbe-Cookies.
      </p>

      <h2>1. Verantwortlicher</h2>
      <p>
        {FIRMA.name}, Inhaber {FIRMA.inhaber}
        <br />
        {FIRMA.strasse}, {FIRMA.ort}
        <br />
        Telefon {FIRMA.telefonAnzeige}, E-Mail <a href={`mailto:${FIRMA.email}`}>{FIRMA.email}</a>
      </p>

      <h2>2. Hosting</h2>
      <p>
        Diese Webseite läuft auf einem eigenen Server, den wir bei der IONOS SE (Elgendorfer Str. 57, 56410 Montabaur) gemietet
        haben. Der Server steht in einem Rechenzentrum in der Europäischen Union. Mit IONOS besteht ein Vertrag zur
        Auftragsverarbeitung nach Art. 28 DSGVO.
      </p>

      <h2>3. Aufruf der Webseite</h2>
      <p>
        Beim Aufruf überträgt Ihr Browser technisch notwendige Daten (z. B. IP-Adresse, Zeitpunkt, aufgerufene Seite, Browsertyp),
        damit die Seite ausgeliefert werden kann. Wir legen dazu keine dauerhaften Zugriffsprotokolle an. Rechtsgrundlage ist Art. 6
        Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren, funktionierenden Webseite).
      </p>
      <p>
        Wir verwenden <strong>keine Cookies</strong>, keine Analyse- oder Trackingdienste und keine Werbenetzwerke. Die Schriftarten
        liegen auf unserem Server; es werden keine Daten an Google Fonts oder ähnliche Dienste übertragen.
      </p>

      <h2>4. Kontaktformular</h2>
      <p>
        Wenn Sie uns über das <Link href="/kontakt">Kontaktformular</Link> schreiben, verarbeiten wir Ihre Angaben (Name, E-Mail,
        optional Firma und Telefon, Ihre Auswahl und Nachricht), um Ihre Anfrage zu beantworten und ein Angebot zu erstellen.
        Die Daten werden in unserem internen Auftragssystem auf demselben Server gespeichert und nicht an Dritte weitergegeben.
      </p>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Anbahnung eines Vertrags) bzw. lit. f DSGVO bei allgemeinen Anfragen. Zum
        Schutz vor Missbrauch wird Ihre IP-Adresse beim Absenden für höchstens eine Stunde im Arbeitsspeicher gehalten und nicht
        gespeichert.
      </p>
      <p>
        Wir löschen die Angaben, wenn die Anfrage erledigt ist und kein Auftrag zustande kommt. Kommt ein Auftrag zustande, gelten
        die gesetzlichen Aufbewahrungsfristen (bis zu zehn Jahre nach Handels- und Steuerrecht).
      </p>

      <h2>5. Kontakt per E-Mail, Telefon oder WhatsApp</h2>
      <p>
        Schreiben Sie uns eine E-Mail oder rufen Sie an, verarbeiten wir Ihre Angaben ebenso zur Bearbeitung Ihres Anliegens. Unser
        E-Mail-Postfach liegt bei IONOS.
      </p>
      <p>
        Der WhatsApp-Knopf öffnet WhatsApp, einen Dienst der WhatsApp Ireland Ltd. (Meta). Erst wenn Sie ihn anklicken, werden Daten
        an WhatsApp übertragen; dabei gelten die Datenschutzbestimmungen von WhatsApp. Wenn Sie das nicht möchten, nutzen Sie bitte
        Telefon, E-Mail oder das Kontaktformular.
      </p>

      <h2>6. Links zu anderen Seiten</h2>
      <p>
        Unser Werbeartikel-Katalog, unsere Google-Bewertungen sowie Instagram und TikTok liegen bei anderen Anbietern. Diese Seiten
        öffnen sich erst nach einem Klick; ab dann gelten die Datenschutzbestimmungen des jeweiligen Anbieters.
      </p>

      <h2>7. Ihre Rechte</h2>
      <p>Sie haben jederzeit das Recht auf</p>
      <ul>
        <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO),</li>
        <li>Berichtigung (Art. 16) und Löschung (Art. 17),</li>
        <li>Einschränkung der Verarbeitung (Art. 18) und Datenübertragbarkeit (Art. 20),</li>
        <li>Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO).</li>
      </ul>
      <p>
        Eine formlose Nachricht an <a href={`mailto:${FIRMA.email}`}>{FIRMA.email}</a> genügt. Außerdem können Sie sich bei einer
        Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der Landesbeauftragten für Datenschutz und Informationsfreiheit
        Nordrhein-Westfalen.
      </p>

      <p className="mt-10 text-sm">Stand: Oktober 2026</p>
    </Rechtstext>
  );
}
