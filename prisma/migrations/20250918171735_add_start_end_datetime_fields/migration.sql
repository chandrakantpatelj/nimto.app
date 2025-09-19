-- Add new DateTime fields (nullable initially)
ALTER TABLE "Event" ADD COLUMN "startDateTime" TIMESTAMP(3);
ALTER TABLE "Event" ADD COLUMN "endDateTime" TIMESTAMP(3);

-- Migrate existing data from date + time to startDateTime
UPDATE "Event" 
SET "startDateTime" = CASE 
    WHEN "time" IS NOT NULL AND "time" != '' AND "time" ~ '^[0-9]{1,2}:[0-9]{2}$' THEN 
        "date" + INTERVAL '1 hour' * EXTRACT(HOUR FROM "time"::TIME) + 
        INTERVAL '1 minute' * EXTRACT(MINUTE FROM "time"::TIME)
    ELSE "date"
END
WHERE "startDateTime" IS NULL;
