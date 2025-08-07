-- CreateTable
CREATE TABLE "public"."Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "jsonContent" TEXT,
    "backgroundStyle" TEXT,
    "htmlContent" TEXT,
    "background" TEXT,
    "pageBackground" TEXT,
    "previewImageUrl" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isSystemTemplate" BOOLEAN NOT NULL DEFAULT false,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isTrashed" BOOLEAN NOT NULL DEFAULT false,
    "imagePath" TEXT,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Template_category_idx" ON "public"."Template"("category");

-- CreateIndex
CREATE INDEX "Template_isPremium_idx" ON "public"."Template"("isPremium");

-- CreateIndex
CREATE INDEX "Template_createdByUserId_idx" ON "public"."Template"("createdByUserId");
