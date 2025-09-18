const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function main() {
  console.log('Setting up database...');

  await prisma.$transaction(
    async (tx) => {
      // Demo users and owner role have been removed

      // Seed UserRoles
      const defaultRole = await tx.userRole.create({
        data: {
          slug: 'member',
          name: 'Member',
          description: 'Default member role',
          isDefault: true,
          isProtected: true,
          createdAt: new Date(),
        },
      });

      // Settings
      tx.setting.create({
        data: {
          name: 'Metronic',
        },
      });

      console.log('Database setup completed!');
    },
    {
      timeout: 120000,
      maxWait: 120000,
    },
  );
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
