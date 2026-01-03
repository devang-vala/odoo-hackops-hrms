-- AlterTable
ALTER TABLE "User" ADD COLUMN     "companyLogo" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "isFirstLogin" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "joiningYear" INTEGER,
ADD COLUMN     "serialNumber" INTEGER;
