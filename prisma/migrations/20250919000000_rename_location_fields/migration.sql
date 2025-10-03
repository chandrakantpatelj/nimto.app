-- Rename location column to locationAddress and add locationUnit
-- This migration preserves existing location data while adding the new structure

-- First, add the new columns
ALTER TABLE "Event" ADD COLUMN "locationAddress" TEXT;
ALTER TABLE "Event" ADD COLUMN "locationUnit" TEXT;
ALTER TABLE "Event" ADD COLUMN "showMap" BOOLEAN DEFAULT true;

-- Copy existing location data to locationAddress
UPDATE "Event" SET "locationAddress" = "location" WHERE "location" IS NOT NULL;

-- Drop the old location column
ALTER TABLE "Event" DROP COLUMN "location";

