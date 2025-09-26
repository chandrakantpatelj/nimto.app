const { PrismaClient } = require('@prisma/client');
const permissionsData = require('./data/permissions');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding template permissions...');

  try {
    await Promise.all(
      permissionsData.map((permission) =>
        prisma.userPermission.upsert({
          where: { slug: permission.slug },
          update: {},
          create: permission,
        })
      )
    );

    console.log('✅ Template permissions seeded successfully!');
    console.log(`📊 Created/updated ${permissionsData.length} permissions`);
  } catch (error) {
    console.error('❌ Error seeding template permissions:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
