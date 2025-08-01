import { prisma } from '@/lib/prisma';

/**
 * Checks if a record is unique in a Prisma table.
 * @param table - Table name in Prisma schema.
 * @param fields - Fields to check for uniqueness.
 * @param exclude - Fields to exclude from the check.
 * @returns - `true` if unique, otherwise `false`.
 * @throws - Error if the table does not exist.
 */
export async function isUnique(table, fields, exclude) {
  if (!(table in prisma)) {
    throw new Error(`Table '${table}' does not exist in Prisma Client.`);
  }

  // Build the `where` clause
  const whereClause = {
    OR: Object.entries(fields).map(([key, value]) => ({ [key]: value })),
  };

  // Add the exclude clause if provided
  if (exclude) {
    whereClause['NOT'] = Object.entries(exclude).map(([key, value]) => ({
      [key]: value,
    }));
  }

  // Define a type for a Prisma model with a findFirst method.

  // Cast the dynamic model to that type.
  const model = prisma[table];

  // Now call findFirst.
  const record = await model.findFirst({
    where: whereClause,
  });

  return !record;
}

/**
 * Fetches the first record from the `setting` table.
 * @returns - Settings with related `role` data or `null`.
 */
export async function getSettings() {
  const settings = await prisma.systemSetting.findFirst();

  return settings;
}
