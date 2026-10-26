"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type Vorschlag = { name?: string; adresse: string };

const MAX_VORSCHLAEGE = 8;

/** „Max Muster <max@firma.de>“ – ohne Namen, wenn der Name Zeichen enthält, die beim Trennen stören. */
function eintrag(k: Vorschlag) {
  return k.name && !/[,;<>"]/.test(k.name) ? `${k.name} <${k.adresse}>` : k.adresse;
}

/**
 * Eingabefeld für eine oder mehrere Adressen (mit Komma getrennt). Beim Tippen werden
 * bekannte Adressen aus dem Postfach vorgeschlagen – Auswahl mit Klick, Pfeiltasten + Enter oder Tab.
 */
export function AdressFeld({
  id,
  name,
  defaultValue,
  required,
  placeholder,
  vorschlaege,
  onAuswahl,
}: {
  id: string;
  name: string;
  defaultValue: string;
  required?: boolean;
  placeholder?: string;
  vorschlaege: Vorschlag[];
  onAuswahl?: () => void;
}) {
  const [wert, setWert] = useState(defaultValue);
  const [offen, setOffen] = useState(false);
  const [aktiv, setAktiv] = useState(0);
  const listeId = useId();

  // Nur das Stück nach dem letzten Komma wird ergänzt.
  const trenner = Math.max(wert.lastIndexOf(","), wert.lastIndexOf(";"));
  const suche = wert.slice(trenner + 1).trim().toLowerCase();
  const schonDrin = new Set(
    wert
      .slice(0, trenner + 1)
      .toLowerCase()
      .match(/[^\s<>,;]+@[^\s<>,;]+/g) ?? [],
  );
  const treffer =
    suche.length < 1
      ? []
      : vorschlaege
          .filter((k) => !schonDrin.has(k.adresse) && (k.adresse.includes(suche) || k.name?.toLowerCase().includes(suche)))
          .slice(0, MAX_VORSCHLAEGE);
  const zeigen = offen && treffer.length > 0;

  function waehlen(k: Vorschlag) {
    setWert(`${wert.slice(0, trenner + 1)}${trenner >= 0 ? " " : ""}${eintrag(k)}, `);
    setOffen(false);
    setAktiv(0);
    onAuswahl?.();
  }

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        value={wert}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={zeigen}
        aria-controls={listeId}
        aria-autocomplete="list"
        className="h-10"
        onChange={(e) => {
          setWert(e.target.value);
          setOffen(true);
          setAktiv(0);
        }}
        onFocus={() => setOffen(true)}
        onBlur={() => setOffen(false)}
        onKeyDown={(e) => {
          if (!zeigen) return;
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            const schritt = e.key === "ArrowDown" ? 1 : -1;
            setAktiv((aktiv + schritt + treffer.length) % treffer.length);
          } else if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            waehlen(treffer[aktiv]);
          } else if (e.key === "Escape") {
            setOffen(false);
          }
        }}
      />
      {zeigen && (
        <ul
          id={listeId}
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-auto rounded-lg border bg-popover p-1 text-sm shadow-lg"
        >
          {treffer.map((k, i) => (
            <li
              key={k.adresse}
              role="option"
              aria-selected={i === aktiv}
              // mousedown statt click: sonst schließt das Verlassen des Feldes die Liste vorher
              onMouseDown={(e) => {
                e.preventDefault();
                waehlen(k);
              }}
              onMouseEnter={() => setAktiv(i)}
              className={cn("cursor-pointer rounded-md px-2 py-1.5", i === aktiv && "bg-muted")}
            >
              {k.name && <span className="font-medium">{k.name} </span>}
              <span className="text-muted-foreground">{k.adresse}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
