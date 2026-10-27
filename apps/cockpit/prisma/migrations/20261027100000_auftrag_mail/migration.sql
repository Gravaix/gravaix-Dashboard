-- AlterTable
ALTER TABLE "auftrag" ADD COLUMN     "mailBetreff" TEXT,
ADD COLUMN     "mailMessageId" TEXT,
ADD COLUMN     "mailOrdner" TEXT,
ADD COLUMN     "mailUid" INTEGER;

-- CreateIndex
CREATE INDEX "auftrag_mailMessageId_idx" ON "auftrag"("mailMessageId");
