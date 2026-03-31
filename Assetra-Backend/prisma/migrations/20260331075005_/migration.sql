/*
  Warnings:

  - The values [Credit,Advance] on the enum `PaymentMode` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ackStatus` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `creditAmount` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `stageId` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `balance` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paidAmount` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subCategory` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMode_new" AS ENUM ('Cash', 'Bank', 'Online', 'Cheque');
ALTER TABLE "Transaction" ALTER COLUMN "paymentMode" TYPE "PaymentMode_new" USING ("paymentMode"::text::"PaymentMode_new");
ALTER TYPE "PaymentMode" RENAME TO "PaymentMode_old";
ALTER TYPE "PaymentMode_new" RENAME TO "PaymentMode";
DROP TYPE "PaymentMode_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_stageId_fkey";

-- DropIndex
DROP INDEX "Transaction_stageId_idx";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "ackStatus",
DROP COLUMN "creditAmount",
DROP COLUMN "stageId",
ADD COLUMN     "balance" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "carriage" DECIMAL(12,2),
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "item" TEXT NOT NULL,
ADD COLUMN     "length" TEXT,
ADD COLUMN     "paidAmount" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "quantity" DECIMAL(12,2),
ADD COLUMN     "rate" DECIMAL(12,2),
ADD COLUMN     "stageName" TEXT,
ADD COLUMN     "subCategory" TEXT NOT NULL,
ADD COLUMN     "unit" TEXT;

-- DropEnum
DROP TYPE "AckStatus";
