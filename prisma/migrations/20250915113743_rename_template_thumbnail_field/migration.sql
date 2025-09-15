-- Add templateImageThumbnailPath column to Template table
-- This is a new field for storing S3 key for exported template thumbnail

ALTER TABLE "Template" ADD COLUMN "templateImageThumbnailPath" TEXT;
