// Feste Angaben zu Gravaix – an einer Stelle, damit Kopf, Fuß, Kontakt und Impressum gleich bleiben.

export const FIRMA = {
  name: "Gravaix Lasermanufaktur",
  inhaber: "Celiano Brunkartz",
  strasse: "Buschstr. 64",
  ort: "52078 Aachen",
  telefonAnzeige: "01575 7321059",
  telefonLink: "tel:+4915757321059",
  whatsapp: "https://wa.me/4915757321059",
  email: "info@gravaix.de",
  zeiten: "Mo–Fr 9–17 Uhr, Sa 10–14 Uhr",
  gebiet: "Aachen & Städteregion, Versand deutschlandweit",
  instagram: "https://www.instagram.com/gravaix_",
  tiktok: "https://www.tiktok.com/@gravaix",
  google: "https://www.google.com/search?q=gravaix+aachen",
  katalog: "https://generalcatalogue2026.eu/graviax1/",
};

export const NAVIGATION = [
  { href: "/veredelung", name: "Veredelung" },
  { href: "/lasergravur-service", name: "Lasergravur-Service" },
  { href: "/katalog", name: "Katalog" },
  { href: "/kontakt", name: "Kontakt" },
];

/**
 * Kleinunternehmer (§ 19 UStG) bis 31.12.2026, danach Regelbesteuerung.
 * Alle Steuerhinweise auf der Seite hängen an dieser Funktion.
 */
export function istKleinunternehmer(jetzt = new Date()) {
  return jetzt.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" }) <= "2026-12-31";
}
