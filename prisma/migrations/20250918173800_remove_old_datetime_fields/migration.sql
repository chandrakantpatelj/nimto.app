-- Ensure all events have startDateTime populated before making it required
UPDATE "Event" 
SET "startDateTime" = CASE 
    WHEN "startDateTime" IS NULL THEN 
        CASE 
            WHEN "time" IS NOT NULL AND "time" != '' AND "time" ~ '^[0-9]{1,2}:[0-9]{2}$' THEN 
                "date" + INTERVAL '1 hour' * EXTRACT(HOUR FROM "time"::TIME) + 
                INTERVAL '1 minute' * EXTRACT(MINUTE FROM "time"::TIME)
            ELSE "date"
        END
    ELSE "startDateTime"
END
WHERE "startDateTime" IS NULL;

-- Make startDateTime NOT NULL
ALTER TABLE "Event" ALTER COLUMN "startDateTime" SET NOT NULL;

-- Drop old date and time columns
ALTER TABLE "Event" DROP COLUMN "date";
ALTER TABLE "Event" DROP COLUMN "time";
