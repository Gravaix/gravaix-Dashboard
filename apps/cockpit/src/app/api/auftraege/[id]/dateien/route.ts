import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const MAX_DATEI = 25 * 1024 * 1024; // 25 MB pro Datei
const MAX_GESAMT = 60 * 1024 * 1024; // 60 MB pro Upload
const MAX_ANZAHL = 10;

/** Dateien zu einem Auftrag hochladen (Formular mit <input type="file" name="dateien" multiple>). */
export async function POST(request: Request, { params }: RouteContext<"/api/auftraege/[id]/dateien">) {
  const session = await getSession();
  if (!session?.user.twoFactorEnabled) return new Response("Nicht angemeldet", { status: 401 });

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return new Response("Ungültiger Auftrag", { status: 400 });
  const zurueck = (extra: Record<string, string>) =>
    Response.redirect(new URL(`/auftraege/${id}?${new URLSearchParams(extra)}#dateien`, request.url), 303);

  if (Number(request.headers.get("content-length") ?? 0) > MAX_GESAMT + 1024 * 1024) {
    return zurueck({ fehler: "Zu groß: höchstens 60 MB auf einmal." });
  }
  if (!(await prisma.auftrag.count({ where: { id } }))) return new Response("Auftrag nicht gefunden", { status: 404 });

  const dateien = (await request.formData()).getAll("dateien").filter((d): d is File => d instanceof File && d.size > 0);
  if (dateien.length === 0) return zurueck({ fehler: "Keine Datei ausgewählt." });
  if (dateien.length > MAX_ANZAHL) return zurueck({ fehler: `Höchstens ${MAX_ANZAHL} Dateien auf einmal.` });
  const zuGross = dateien.find((d) => d.size > MAX_DATEI);
  if (zuGross) return zurueck({ fehler: `„${zuGross.name}“ ist größer als 25 MB.` });

  for (const d of dateien) {
    await prisma.auftragDatei.create({
      data: {
        auftragId: id,
        name: d.name.slice(0, 255) || "datei",
        typ: d.type || "application/octet-stream",
        groesse: d.size,
        inhalt: new Uint8Array(await d.arrayBuffer()),
      },
    });
  }
  revalidatePath(`/auftraege/${id}`);
  return zurueck({ hochgeladen: String(dateien.length) });
}
