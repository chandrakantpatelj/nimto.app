-- Migration to preserve location data during schema change
-- This ensures no data loss when renaming location to locationAddress

-- Add new columns first
ALTER TABLE "Event" ADD COLUMN "locationAddress" TEXT;
ALTER TABLE "Event" ADD COLUMN "locationUnit" TEXT;
ALTER TABLE "Event" ADD COLUMN "showMap" BOOLEAN DEFAULT true;

-- Copy existing location data to locationAddress
UPDATE "Event" SET "locationAddress" = "location" WHERE "location" IS NOT NULL;

-- Now safely drop the old location column
ALTER TABLE "Event" DROP COLUMN "location";
