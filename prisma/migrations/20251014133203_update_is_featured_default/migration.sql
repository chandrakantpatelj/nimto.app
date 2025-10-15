-- Update isFeatured default value for Template table
-- This migration changes the default value from false to true

-- First, update existing templates that have isFeatured = false to true
-- (This ensures existing templates become featured by default)
UPDATE "Template" SET "isFeatured" = true WHERE "isFeatured" = false;

-- Note: The default value change in the schema will apply to new records
-- No ALTER TABLE statement needed as the column already exists
-- The default value is handled by Prisma schema, not database constraint
