import { dateiHeader } from "@/lib/datei-typen";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

/** Datei eines Auftrags ansehen bzw. herunterladen. */
export async function GET(_request: Request, { params }: RouteContext<"/api/auftraege/dateien/[dateiId]">) {
  const session = await getSession();
  if (!session?.user.twoFactorEnabled) return new Response("Nicht angemeldet", { status: 401 });

  const id = Number((await params).dateiId);
  if (!Number.isInteger(id) || id < 1) return new Response("Ungültige Datei", { status: 400 });
  const datei = await prisma.auftragDatei.findUnique({ where: { id } });
  if (!datei) return new Response("Datei nicht gefunden", { status: 404 });

  return new Response(new Uint8Array(datei.inhalt), { headers: dateiHeader(datei.name, datei.typ) });
}
