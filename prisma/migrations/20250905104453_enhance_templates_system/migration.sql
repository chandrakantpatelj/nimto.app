-- CreateEnum
CREATE TYPE "public"."EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."GuestResponse" AS ENUM ('YES', 'NO', 'MAYBE');

-- CreateEnum
CREATE TYPE "public"."GuestStatus" AS ENUM ('PENDING', 'INVITED', 'CONFIRMED', 'DECLINED', 'MAYBE');

-- AlterTable
ALTER TABLE "public"."Template" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "colors" TEXT[],
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isNew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTrending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keywords" TEXT[],
ADD COLUMN     "orientation" TEXT NOT NULL DEFAULT 'portrait',
ADD COLUMN     "popularity" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "thumbnailUrl" TEXT;

-- CreateTable
CREATE TABLE "public"."TemplateCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "location" TEXT,
    "templateId" TEXT,
    "jsonContent" TEXT,
    "backgroundStyle" TEXT,
    "htmlContent" TEXT,
    "background" TEXT,
    "pageBackground" TEXT,
    "imagePath" TEXT,
    "status" "public"."EventStatus" NOT NULL DEFAULT 'DRAFT',
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isTrashed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Guest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "status" "public"."GuestStatus" NOT NULL DEFAULT 'PENDING',
    "eventId" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "response" "public"."GuestResponse",

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TemplateCategory_slug_key" ON "public"."TemplateCategory"("slug");

-- CreateIndex
CREATE INDEX "TemplateCategory_isActive_idx" ON "public"."TemplateCategory"("isActive");

-- CreateIndex
CREATE INDEX "Event_createdByUserId_idx" ON "public"."Event"("createdByUserId");

-- CreateIndex
CREATE INDEX "Event_templateId_idx" ON "public"."Event"("templateId");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "public"."Event"("status");

-- CreateIndex
CREATE INDEX "Guest_eventId_idx" ON "public"."Guest"("eventId");

-- CreateIndex
CREATE INDEX "Guest_status_idx" ON "public"."Guest"("status");

-- CreateIndex
CREATE INDEX "Template_orientation_idx" ON "public"."Template"("orientation");

-- CreateIndex
CREATE INDEX "Template_isTrending_idx" ON "public"."Template"("isTrending");

-- CreateIndex
CREATE INDEX "Template_isFeatured_idx" ON "public"."Template"("isFeatured");

-- CreateIndex
CREATE INDEX "Template_isNew_idx" ON "public"."Template"("isNew");

-- CreateIndex
CREATE INDEX "Template_popularity_idx" ON "public"."Template"("popularity");

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Guest" ADD CONSTRAINT "Guest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
