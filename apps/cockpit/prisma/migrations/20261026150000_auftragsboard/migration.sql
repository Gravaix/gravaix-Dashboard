-- CreateEnum
CREATE TYPE "AuftragStatus" AS ENUM ('ANFRAGE', 'ANGEBOT', 'PRODUKTION', 'VERSAND', 'ERLEDIGT');

-- CreateTable
CREATE TABLE "auftrag" (
    "id" SERIAL NOT NULL,
    "titel" TEXT NOT NULL,
    "kunde" TEXT NOT NULL,
    "kundeEmail" TEXT,
    "status" "AuftragStatus" NOT NULL DEFAULT 'ANFRAGE',
    "deadline" DATE,
    "notizen" TEXT,
    "erledigtAm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auftrag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auftrag_status_idx" ON "auftrag"("status");
