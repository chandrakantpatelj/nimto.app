import { prisma } from '@/lib/prisma';

export async function systemLog(
  { event, userId, entityId, entityType, description, ipAddress, meta },
  tx, // Optional transaction
) {
  try {
    // Use transaction if available, otherwise use Prisma client
    const connection = tx ?? prisma;

    await connection.systemLog.create({
      data: {
        event,
        userId,
        entityId,
        entityType,
        description,
        ipAddress,
        meta,
      },
    });
  } catch (error) {
    console.error('[LOG] Failed to log activity:', error);
  }
}
