import { prisma } from './prisma';

// Database connection middleware with timeout handling
export async function withDatabaseTimeout(operation, timeoutMs = 30000) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Database operation timeout')), timeoutMs);
  });

  try {
    const result = await Promise.race([
      operation(),
      timeoutPromise
    ]);
    return result;
  } catch (error) {
    console.error('Database operation failed:', error);
    
    // If it's a connection error, try to reconnect
    if (error.code === 'P1001' || error.message.includes('timeout')) {
      console.log('Attempting to reconnect to database...');
      try {
        await prisma.$disconnect();
        await prisma.$connect();
        console.log('Database reconnected successfully');
        
        // Retry the operation once
        return await operation();
      } catch (retryError) {
        console.error('Database reconnection failed:', retryError);
        throw new Error('Database connection failed after retry');
      }
    }
    
    throw error;
  }
}

// Wrapper for common database operations
export const db = {
  // User operations
  findUser: (where) => withDatabaseTimeout(() => prisma.user.findUnique({ where })),
  findUsers: (where = {}) => withDatabaseTimeout(() => prisma.user.findMany({ where })),
  createUser: (data) => withDatabaseTimeout(() => prisma.user.create({ data })),
  updateUser: (where, data) => withDatabaseTimeout(() => prisma.user.update({ where, data })),
  
  // Role operations
  findRole: (where) => withDatabaseTimeout(() => prisma.userRole.findFirst({ where })),
  findRoles: (where = {}) => withDatabaseTimeout(() => prisma.userRole.findMany({ where })),
  
  // Permission operations
  findPermissions: (where = {}) => withDatabaseTimeout(() => prisma.userPermission.findMany({ where })),
  
  // Custom operation wrapper
  execute: (operation) => withDatabaseTimeout(operation),
}; 