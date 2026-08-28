-- CreateEnum
CREATE TYPE "TipStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESSFUL', 'FAILED');

-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "mobileMoneyNetwork" TEXT NOT NULL,
    "mobileMoneyNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tip" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "tipperName" TEXT,
    "message" TEXT,
    "amountSats" INTEGER NOT NULL,
    "status" "TipStatus" NOT NULL DEFAULT 'PENDING',
    "blinkPaymentHash" TEXT NOT NULL,
    "blinkPaymentRequest" TEXT NOT NULL,
    "withdrawalId" TEXT,
    "withdrawnAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Tip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "amountSats" INTEGER NOT NULL,
    "amountRwf" DOUBLE PRECISION NOT NULL,
    "exchangeRateUsed" DOUBLE PRECISION NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "flutterwaveTransferId" TEXT,
    "flutterwaveReference" TEXT NOT NULL,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_username_key" ON "Creator"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_email_key" ON "Creator"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tip_blinkPaymentHash_key" ON "Tip"("blinkPaymentHash");

-- CreateIndex
CREATE INDEX "Tip_creatorId_status_idx" ON "Tip"("creatorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Withdrawal_flutterwaveReference_key" ON "Withdrawal"("flutterwaveReference");

-- CreateIndex
CREATE INDEX "Withdrawal_creatorId_status_idx" ON "Withdrawal"("creatorId", "status");

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_withdrawalId_fkey" FOREIGN KEY ("withdrawalId") REFERENCES "Withdrawal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
