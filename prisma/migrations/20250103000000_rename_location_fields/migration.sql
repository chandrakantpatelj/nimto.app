-- Rename location to locationAddress and add locationUnit
-- This migration preserves existing location data

-- Step 1: Add the new columns
ALTER TABLE "Event" ADD COLUMN "locationAddress" TEXT;
ALTER TABLE "Event" ADD COLUMN "locationUnit" TEXT;
ALTER TABLE "Event" ADD COLUMN "showMap" BOOLEAN DEFAULT true;

-- Step 2: Copy existing location data to locationAddress (if location column exists)
-- Note: This will only work if the old 'location' column still exists in the database
DO $$
BEGIN
    -- Check if location column exists and copy data
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'Event' AND column_name = 'location') THEN
        UPDATE "Event" SET "locationAddress" = "location" WHERE "location" IS NOT NULL;
    END IF;
END $$;

-- Step 3: Drop the old location column (if it exists)
DO $$
BEGIN
    -- Check if location column exists before dropping
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'Event' AND column_name = 'location') THEN
        ALTER TABLE "Event" DROP COLUMN "location";
    END IF;
END $$;
