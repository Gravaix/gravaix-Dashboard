import { Huelle } from "@/components/bausteine";

/** Rahmen für Impressum und Datenschutz: ruhige Lesespalte. */
export function Rechtstext({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <Huelle className="py-14 sm:py-20">
      <article className="mx-auto max-w-3xl text-[15px] leading-relaxed [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3 [&_p]:text-muted-foreground [&_ul]:mb-3 [&_ul]:text-muted-foreground">
        <h1 className="mb-8 font-display text-4xl tracking-tight">{titel}</h1>
        {children}
      </article>
    </Huelle>
  );
}
