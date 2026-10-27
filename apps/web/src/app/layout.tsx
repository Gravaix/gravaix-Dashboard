import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import { Fuss } from "@/components/fuss";
import { Kopf } from "@/components/kopf";
import "./globals.css";

// Schriften werden beim Bauen heruntergeladen und vom eigenen Server ausgeliefert –
// Besucher laden nichts von Google (Datenschutz).
const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const display = Fraunces({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500"] });

// Seiten stündlich neu erzeugen – so wechseln z. B. Steuerhinweise am 01.01.2027 ohne neues Update.
export const revalidate = 3600;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.WEB_URL || "https://gravaix.de"),
  title: { default: "Lasergravur Aachen | Werbeartikel & Firmengeschenke gravieren", template: "%s | Gravaix" },
  description:
    "Ihr Werbemittel-Dienstleister im Kreis Aachen. Personalisierte Werbeartikel mit Lasergravur, Druck & Stickerei für Unternehmen in der Städteregion Aachen.",
  openGraph: { siteName: "Gravaix Lasermanufaktur", locale: "de_DE", type: "website" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf8f4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${sans.variable} ${display.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#inhalt" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-dunkel focus:px-4 focus:py-2 focus:text-white">
          Zum Inhalt springen
        </a>
        <Kopf />
        <main id="inhalt" className="flex-1">
          {children}
        </main>
        <Fuss />
      </body>
    </html>
  );
}
