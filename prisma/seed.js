/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const rolesData = require('./data/roles');
const usersData = require('./data/users');
const permissionsData = require('./data/permissions');

// Initialize Prisma client with proper error handling
let prisma;
try {
  prisma = new PrismaClient();
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
  process.exit(1);
}

async function main() {
  console.log('Running database seeding...');

  // Delete demo users and owner role if they exist
  // First, delete related records to avoid foreign key constraints
  const demoUsers = await prisma.user.findMany({
    where: { email: { in: ['demo@kt.com', 'owner@kt.com'] } },
    select: { id: true }
  });

  if (demoUsers.length > 0) {
    const userIds = demoUsers.map(user => user.id);
    
    // Delete system logs first
    await prisma.systemLog.deleteMany({
      where: { userId: { in: userIds } }
    });
    
    // Delete users
    await prisma.user.deleteMany({
      where: { email: { in: ['demo@kt.com', 'owner@kt.com'] } }
    });
    
    console.log('✅ Deleted demo users and related records');
  }

  // Delete owner role
  const deletedRole = await prisma.userRole.deleteMany({
    where: { slug: 'owner' }
  });
  
  if (deletedRole.count > 0) {
    console.log('✅ Deleted owner role');
  }

  // Seed Roles
  for (const role of rolesData) {
    await prisma.userRole.upsert({
      where: { slug: role.slug },
      update: {},
      create: {
        slug: role.slug,
        name: role.name,
        description: role.description,
        isDefault: role.isDefault || false,
        isProtected: role.isProtected || false,
        createdAt: new Date(),
        createdByUserId: null,
      },
    });
  }
  console.log('Roles seeded.');

  // Seed Permissions
  for (const permission of permissionsData) {
    await prisma.userPermission.upsert({
      where: { slug: permission.slug },
      update: {},
      create: {
        slug: permission.slug,
        name: permission.name,
        description: permission.description,
        createdAt: new Date(),
        createdByUserId: null,
      },
    });
  }
  console.log('Permissions seeded.');

  // Seed Role Permissions
  const seededRoles = await prisma.userRole.findMany();
  const seededPermissions = await prisma.userPermission.findMany();

  const userRolePermissionPromises = seededRoles.flatMap((role) => {
    // Generate a random number between 3 and 12 (inclusive)
    const numberOfPermissions =
      Math.floor(Math.random() * (12 - 3 + 1)) + 3;

    // Randomly shuffle the permissions array and select the required number
    const randomizedPermissions = seededPermissions
      .sort(() => Math.random() - 0.5)
      .slice(0, numberOfPermissions);

    // Create promises for each selected permission
    return randomizedPermissions.map((permission) =>
      prisma.userRolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
          assignedAt: new Date(),
        },
      }),
    );
  });

  await Promise.all(userRolePermissionPromises);
  console.log('UserRolePermissions seeded.');

  // Seed Users
  for (const user of usersData) {
    const role = await prisma.userRole.findFirst({
      where: { slug: user.roleSlug },
    });
    
    // Skip users with non-existent roles or use a default role
    if (!role) {
      console.log(`Skipping user ${user.email} - role '${user.roleSlug}' not found`);
      continue;
    }
    
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        avatar: user.avatar ? '/media/avatars/' + user.avatar : null,
        roleId: role.id,
        emailVerifiedAt: new Date(),
        status: 'ACTIVE',
        createdAt: new Date(),
      },
    });
  }
  console.log('Users seeded.');

  // Seed System Logs
  const users = await prisma.user.findMany({
    where: {
      role: {
        isDefault: false, // Exclude default roles
      },
    },
    include: {
      role: true, // Include role details if needed
    },
  });

  const meaningfulVerbs = [
    'created',
    'updated',
    'deleted',
    'requested',
    'reset',
    'terminated',
    'fetched',
    'reviewed',
  ];

  const systemLogPromises = Array.from({ length: 20 }).map(() => {
    const entity = faker.helpers.arrayElement([
      { type: 'user', id: faker.helpers.arrayElement(users).id },
    ]);

    const event = faker.helpers.arrayElement([
      'CREATE',
      'UPDATE',
      'DELETE',
      'FETCH',
    ]);

    // Map meaningful verbs based on the event type
    const verbMap = {
      CREATE: ['created', 'added', 'initialized', 'generated'],
      UPDATE: ['updated', 'modified', 'changed', 'edited'],
      DELETE: ['deleted', 'removed', 'cleared', 'erased'],
      FETCH: ['fetched', 'retrieved', 'requested', 'accessed'],
    };

    const descriptionVerb = faker.helpers.arrayElement(
      verbMap[event] || meaningfulVerbs, // Fallback to the generic meaningfulVerbs
    );

    return prisma.systemLog.create({
      data: {
        event,
        userId: faker.helpers.arrayElement(users).id,
        entityId: entity.id,
        entityType: entity.type,
        description: `${entity.type} was ${descriptionVerb}`,
        createdAt: new Date(),
        ipAddress: faker.internet.ipv4(),
      },
    });
  });

  await Promise.all(systemLogPromises);
  console.log('System logs seeded.');

  // Seed Settings
  await prisma.systemSetting.create({
    data: {
      name: 'Metronic',
    },
  });
  console.log('Settings seeded.');

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
