-- CreateEnum
CREATE TYPE "LightningSendStatus" AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED');

-- AlterTable
ALTER TABLE "Tip" ADD COLUMN     "lightningSendId" TEXT;

-- CreateTable
CREATE TABLE "LightningSend" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "amountSats" INTEGER NOT NULL,
    "destination" TEXT NOT NULL,
    "status" "LightningSendStatus" NOT NULL DEFAULT 'PENDING',
    "blinkPaymentHash" TEXT,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "LightningSend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LightningSend_creatorId_status_idx" ON "LightningSend"("creatorId", "status");

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_lightningSendId_fkey" FOREIGN KEY ("lightningSendId") REFERENCES "LightningSend"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightningSend" ADD CONSTRAINT "LightningSend_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
