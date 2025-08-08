-- AddForeignKey
ALTER TABLE "public"."Template" ADD CONSTRAINT "Template_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
