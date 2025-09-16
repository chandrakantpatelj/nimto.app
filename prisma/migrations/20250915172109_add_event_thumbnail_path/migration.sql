-- Add eventThumbnailPath column to Event table
-- This is a new field for storing S3 key for exported event thumbnail
ALTER TABLE "Event" ADD COLUMN "eventThumbnailPath" TEXT;
