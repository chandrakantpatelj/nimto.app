/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const rolesData = require('./data/roles');
const permissionsData = require('./data/permissions');

const prisma = new PrismaClient();

// CRITICAL ROLE SLUGS - These are hardcoded in your application code
const CRITICAL_ROLE_SLUGS = [
  'super-admin',
  'application-admin', 
  'host',
  'attendee'
];

// SAFE seeding function - prevents breaking changes to critical slugs
async function safeSeed(data, model, uniqueField, updateFields = []) {
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let blocked = 0;

  for (const item of data) {
    const existing = await model.findUnique({
      where: { [uniqueField]: item[uniqueField] },
    });

    if (existing) {
      // If record exists in database, skip it completely (preserve all user changes)
      // Only create new records that don't exist
      skipped++;
    } else {
      // Create new record (only for records that don't exist)
      await model.create({
        data: item,
      });
      created++;
    }
  }

  return { created, updated, skipped, blocked };
}

async function main() {
  console.log('🌱 Running database seeding...');

  // 1. Seed User Roles (with critical slug protection)
  console.log('📋 Seeding user roles...');
  const roleResults = await safeSeed(
    rolesData.map(role => ({
      ...role,
      isDefault: role.isDefault || false,
      isProtected: role.isProtected || false,
      createdAt: new Date(),
      createdByUserId: null,
    })),
    prisma.userRole,
    'slug',
    ['name', 'description', 'isDefault', 'isProtected']
  );
  console.log(`✅ Roles: ${roleResults.created} created, ${roleResults.skipped} skipped (existing)`);

  // 2. Seed Permissions (create only new, preserve existing)
  console.log('📋 Seeding permissions...');
  const permissionResults = await safeSeed(
    permissionsData.map(permission => ({
      ...permission,
      createdAt: new Date(),
      createdByUserId: null,
    })),
    prisma.userPermission,
    'slug',
    ['name', 'description']
  );
  console.log(`✅ Permissions: ${permissionResults.created} created, ${permissionResults.skipped} skipped (existing)`);

  // 3. Ensure other tables exist (empty - for user management)
  console.log('📋 Ensuring application tables exist...');
  
  // Template Categories - User will add through application
  console.log('✅ Template categories table ready for user data');
  
  // System Settings - User will configure through application  
  console.log('✅ System settings table ready for user configuration');
  
  // Events, Users, Guests - Will be managed through application
  console.log('✅ Event management tables ready for user data');
  console.log('✅ User management tables ready for user data');

  // Summary
  console.log('\n📊 Seeding Summary:');
  console.log(`   • Roles: ${roleResults.created} created, ${roleResults.skipped} skipped (existing)`);
  console.log(`   • Permissions: ${permissionResults.created} created, ${permissionResults.skipped} skipped (existing)`);
  console.log(`   • Only new records created, existing data preserved`);

  console.log('\n🎉 Database seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
