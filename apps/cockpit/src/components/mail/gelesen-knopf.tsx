"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Mail, MailOpen } from "lucide-react";
import { gelesenMarkieren } from "@/app/(cockpit)/mails/actions";
import { Button } from "@/components/ui/button";

/**
 * Beim Öffnen wird eine ungelesene Mail als gelesen markiert (wie in Apple Mail).
 * Der Knopf stellt sie bei Bedarf wieder auf ungelesen.
 */
export function GelesenKnopf({ pfad, uid, gelesen: anfangs }: { pfad: string; uid: number; gelesen: boolean }) {
  const [gelesen, setGelesen] = useState(anfangs);
  const [fehler, setFehler] = useState(false);
  const [laeuft, starten] = useTransition();
  const erledigt = useRef(false);

  function setzen(wert: boolean) {
    setFehler(false);
    starten(async () => {
      try {
        await gelesenMarkieren(pfad, uid, wert);
        setGelesen(wert);
      } catch {
        setFehler(true);
      }
    });
  }

  useEffect(() => {
    if (anfangs || erledigt.current) return;
    erledigt.current = true;
    setzen(true);
    // nur einmal beim Öffnen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" disabled={laeuft} onClick={() => setzen(!gelesen)}>
        {gelesen ? <Mail /> : <MailOpen />}
        {gelesen ? "Als ungelesen markieren" : "Als gelesen markieren"}
      </Button>
      {fehler && <span className="text-xs text-destructive">Hat nicht geklappt, bitte nochmal.</span>}
    </div>
  );
}
