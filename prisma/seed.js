/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const rolesData = require('./data/roles');
const usersData = require('./data/users');
const permissionsData = require('./data/permissions');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Running database seeding...');

  // -----------------------------
  // 1️⃣ Delete demo users if exist
  // -----------------------------
  const demoUsers = await prisma.user.findMany({
    where: { email: { in: ['demo@kt.com', 'owner@kt.com'] } },
    select: { id: true },
  });

  if (demoUsers.length > 0) {
    const userIds = demoUsers.map(u => u.id);

    // Delete related system logs
    await prisma.systemLog.deleteMany({
      where: { userId: { in: userIds } },
    });

    // Delete users
    await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });

    console.log('✅ Deleted demo users and related logs');
  }

  // -----------------------------
  // 2️⃣ Delete owner role if exists
  // -----------------------------
  const deletedRole = await prisma.userRole.deleteMany({
    where: { slug: 'owner' },
  });

  if (deletedRole.count > 0) {
    console.log('✅ Deleted owner role');
  }

  // -----------------------------
  // 3️⃣ Seed Roles
  // -----------------------------
  await Promise.all(
    rolesData.map(role =>
      prisma.userRole.upsert({
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
      })
    )
  );
  console.log('✅ Roles seeded');

  // -----------------------------
  // 4️⃣ Seed Permissions
  // -----------------------------
  await Promise.all(
    permissionsData.map(permission =>
      prisma.userPermission.upsert({
        where: { slug: permission.slug },
        update: {},
        create: {
          slug: permission.slug,
          name: permission.name,
          description: permission.description,
          createdAt: new Date(),
          createdByUserId: null,
        },
      })
    )
  );
  console.log('✅ Permissions seeded');

  // -----------------------------
  // 5️⃣ Seed Role-Permissions
  // -----------------------------
  const seededRoles = await prisma.userRole.findMany();
  const seededPermissions = await prisma.userPermission.findMany();

  const rolePermissionPromises = seededRoles.flatMap(role => {
    const numberOfPermissions = Math.floor(Math.random() * (12 - 3 + 1)) + 3;
    const randomizedPermissions = seededPermissions
      .sort(() => Math.random() - 0.5)
      .slice(0, numberOfPermissions);

    return randomizedPermissions.map(permission =>
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
      })
    );
  });

  await Promise.all(rolePermissionPromises);
  console.log('✅ UserRolePermissions seeded');

  // -----------------------------
  // 6️⃣ Seed Users
  // -----------------------------
  for (const user of usersData) {
    const role = await prisma.userRole.findFirst({
      where: { slug: user.roleSlug },
    });

    if (!role) {
      console.log(`⚠️ Skipping user ${user.email} - role '${user.roleSlug}' not found`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

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
  console.log('✅ Users seeded');

  // -----------------------------
  // 7️⃣ Seed System Logs
  // -----------------------------
  const users = await prisma.user.findMany({
    where: { role: { isDefault: false } },
  });

  const meaningfulVerbs = ['created', 'updated', 'deleted', 'requested', 'reset', 'terminated', 'fetched', 'reviewed'];

  const systemLogPromises = Array.from({ length: 20 }).map(() => {
    const entity = { type: 'user', id: faker.helpers.arrayElement(users).id };
    const event = faker.helpers.arrayElement(['CREATE', 'UPDATE', 'DELETE', 'FETCH']);
    const verbMap = {
      CREATE: ['created', 'added', 'initialized', 'generated'],
      UPDATE: ['updated', 'modified', 'changed', 'edited'],
      DELETE: ['deleted', 'removed', 'cleared', 'erased'],
      FETCH: ['fetched', 'retrieved', 'requested', 'accessed'],
    };
    const descriptionVerb = faker.helpers.arrayElement(verbMap[event] || meaningfulVerbs);

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
  console.log('✅ System logs seeded');

  // -----------------------------
  // 8️⃣ Seed Settings (safe upsert)
  // -----------------------------
  await prisma.systemSetting.upsert({
    where: { name: 'Metronic' },
    update: {},
    create: { name: 'Metronic' },
  });
  console.log('✅ Settings seeded');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
