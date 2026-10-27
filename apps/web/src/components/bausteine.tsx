import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

// Kleine Bausteine, aus denen die Seiten zusammengesetzt sind.

export function Huelle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

export function Abschnitt({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("py-16 sm:py-24", className)}>
      <Huelle>{children}</Huelle>
    </section>
  );
}

/** Kleine Zeile über einer Überschrift, z. B. „LASERGRAVUR · AACHEN“ */
export function Ueberzeile({ children, hell }: { children: React.ReactNode; hell?: boolean }) {
  return (
    <p className={cn("mb-3 text-xs font-semibold tracking-[0.25em] uppercase", hell ? "text-brand" : "text-brand-dunkel")}>
      {children}
    </p>
  );
}

export function Titel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("font-display text-3xl leading-tight tracking-tight sm:text-4xl", className)}>{children}</h2>;
}

export function KnopfLink({
  href,
  children,
  art = "voll",
  className,
}: {
  href: string;
  children: React.ReactNode;
  art?: "voll" | "rahmen" | "hell";
  className?: string;
}) {
  const extern = /^(https?:|mailto:|tel:)/.test(href);
  const klassen = cn(
    "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    art === "voll" && "bg-dunkel text-white hover:bg-brand-dunkel",
    art === "rahmen" && "border border-foreground/20 hover:border-foreground/50 hover:bg-foreground/5",
    art === "hell" && "bg-white text-dunkel hover:bg-brand hover:text-white",
    className,
  );
  if (extern) {
    return (
      <a href={href} className={klassen} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={klassen}>
      {children}
    </Link>
  );
}

export function PfeilLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-dunkel hover:text-foreground">
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/** Abschluss-Block „Jetzt anfragen“ – steht am Ende fast jeder Seite. */
export function AnfrageBlock({
  titel = "Noch unsicher, was passt?",
  text = "Gerne stellen wir Ihnen unverbindlich eine passende Produktauswahl für Ihr Unternehmen zusammen.",
  knopf = "Unverbindlich anfragen",
}: {
  titel?: string;
  text?: string;
  knopf?: string;
}) {
  return (
    <Abschnitt className="pt-0 sm:pt-0">
      <div className="relative overflow-hidden rounded-3xl bg-dunkel px-6 py-12 text-white sm:px-12 sm:py-16">
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-brand/25 blur-3xl" aria-hidden />
        <div className="relative max-w-2xl">
          <Titel>{titel}</Titel>
          <p className="mt-4 text-white/75">{text}</p>
          <div className="mt-8">
            <KnopfLink href="/kontakt" art="hell">
              {knopf}
              <ArrowRight className="size-4" />
            </KnopfLink>
          </div>
        </div>
      </div>
    </Abschnitt>
  );
}

/** Platz für ein Foto, solange die Bilder noch nicht von Onepage übernommen sind. */
export function BildPlatz({ text, className }: { text: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-end rounded-2xl bg-[radial-gradient(circle_at_30%_20%,var(--brand)_0%,transparent_55%),linear-gradient(135deg,oklch(0.3_0.02_60),oklch(0.18_0.01_60))] p-5 text-sm text-white/80",
        className,
      )}
      role="img"
      aria-label={text}
    >
      {text}
    </div>
  );
}
