-- CreateTable
CREATE TABLE "auftrag_datei" (
    "id" SERIAL NOT NULL,
    "auftragId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "groesse" INTEGER NOT NULL,
    "inhalt" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auftrag_datei_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auftrag_datei_auftragId_idx" ON "auftrag_datei"("auftragId");

-- AddForeignKey
ALTER TABLE "auftrag_datei" ADD CONSTRAINT "auftrag_datei_auftragId_fkey" FOREIGN KEY ("auftragId") REFERENCES "auftrag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
