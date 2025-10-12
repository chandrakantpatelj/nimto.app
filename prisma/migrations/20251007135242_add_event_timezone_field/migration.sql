-- Add timezone column to Event table
-- This migration adds timezone support for events
-- Safe to run on existing databases

-- Add timezone column with default value
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- Update existing events to have UTC timezone (if they don't have one)
UPDATE "Event" SET "timezone" = 'UTC' WHERE "timezone" IS NULL OR "timezone" = '';