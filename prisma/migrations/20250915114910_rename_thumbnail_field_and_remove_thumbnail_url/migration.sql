-- Rename templateImageThumbnailPath to templateThumbnailPath and remove thumbnailUrl
-- This preserves existing data while updating field names

-- First, add the new column with the same type as the old one
ALTER TABLE "Template" ADD COLUMN "templateThumbnailPath" TEXT;

-- Copy data from old column to new column (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Template' AND column_name = 'templateImageThumbnailPath') THEN
        UPDATE "Template" SET "templateThumbnailPath" = "templateImageThumbnailPath" WHERE "templateImageThumbnailPath" IS NOT NULL;
        ALTER TABLE "Template" DROP COLUMN "templateImageThumbnailPath";
    END IF;
END $$;

-- Remove the thumbnailUrl column from Template table
ALTER TABLE "Template" DROP COLUMN IF EXISTS "thumbnailUrl";
