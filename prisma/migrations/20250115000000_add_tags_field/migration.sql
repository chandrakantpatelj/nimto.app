-- Add tags field to Template table
-- This migration adds a new tags field as a string array

-- Add the tags column as a string array
ALTER TABLE "Template" ADD COLUMN "tags" TEXT[] DEFAULT '{}';

-- Note: The default value is an empty array
-- Existing templates will have an empty tags array
