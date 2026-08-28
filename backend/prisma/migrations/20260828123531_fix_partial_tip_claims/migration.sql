/*
  Warnings:

  - You are about to drop the column `lightningSendId` on the `Tip` table. All the data in the column will be lost.
  - You are about to drop the column `withdrawalId` on the `Tip` table. All the data in the column will be lost.
  - You are about to drop the column `withdrawnAt` on the `Tip` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tip" DROP CONSTRAINT "Tip_lightningSendId_fkey";

-- DropForeignKey
ALTER TABLE "Tip" DROP CONSTRAINT "Tip_withdrawalId_fkey";

-- AlterTable
ALTER TABLE "Tip" DROP COLUMN "lightningSendId",
DROP COLUMN "withdrawalId",
DROP COLUMN "withdrawnAt",
ADD COLUMN     "claimedSats" INTEGER NOT NULL DEFAULT 0;
