import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : [],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Add connection timeout and retry settings
    __internal: {
      engine: {
        // Increase timeout for database operations
        queryEngineTimeout: 30000, // 30 seconds
        // Add connection pooling settings
        connectionLimit: 10,
        // Add retry settings
        retryAttempts: 3,
        retryDelay: 1000, // 1 second
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Add connection health check
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
  });

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
