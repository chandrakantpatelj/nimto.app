/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const rolesData = require('./data/roles');
const usersData = require('./data/users');
const permissionsData = require('./data/permissions');

const prisma = new PrismaClient();

async function main() {
  console.log('Running database seeding...');

  await prisma.$transaction(
    async (tx) => {
      // Ensure the owner role exists
      const ownerRole = await tx.userRole.upsert({
        where: { slug: 'owner' },
        update: {}, // No updates needed, ensures idempotency
        create: {
          slug: 'owner',
          name: 'Owner',
          description: 'The default system role with full access.',
          isProtected: true,
          isDefault: false, // Optional: set to false if it's not the default role
        },
      });

      // Create the owner user
      const hashedPassword = await bcrypt.hash('12345', 10);
      const demoPassword = await bcrypt.hash('demo123', 10);

      await tx.user.upsert({
        where: { email: 'demo@kt.com' },
        update: {}, // No updates needed, ensures idempotency
        create: {
          email: 'demo@kt.com',
          name: 'Demo',
          password: demoPassword,
          roleId: ownerRole.id,
          avatar: null, // Optional: Add avatar URL if available
          emailVerifiedAt: new Date(), // Optional: Mark email as verified
          status: 'ACTIVE',
        },
      });

      const ownerUser = await tx.user.upsert({
        where: { email: 'owner@kt.com' },
        update: {}, // No updates needed, ensures idempotency
        create: {
          email: 'owner@kt.com',
          name: 'System Owner',
          password: hashedPassword,
          roleId: ownerRole.id,
          avatar: null, // Optional: Add avatar URL if available
          emailVerifiedAt: new Date(), // Optional: Mark email as verified
          status: 'ACTIVE',
        },
      });

      // Seed UserRoles
      await tx.userRole.upsert({
        where: { slug: 'member' },
        update: {}, // No updates needed, ensures idempotency
        create: {
          slug: 'member',
          name: 'Member',
          description: 'Default member role',
          isDefault: true,
          isProtected: true,
          createdAt: new Date(),
        },
      });

      // Seed Roles
      for (const role of rolesData) {
        await tx.userRole.upsert({
          where: { slug: role.slug },
          update: {},
          create: {
            slug: role.slug,
            name: role.name,
            description: role.description,
            isDefault: role.isDefault || false,
            isProtected: role.isProtected || false,
            createdAt: new Date(),
            createdByUserId: ownerUser.id,
          },
        });
      }
      console.log('Roles seeded.');

      // Seed Permissions
      for (const permission of permissionsData) {
        await tx.userPermission.upsert({
          where: { slug: permission.slug },
          update: {},
          create: {
            slug: permission.slug,
            name: permission.name,
            description: permission.description,
            createdAt: new Date(),
            createdByUserId: ownerUser.id,
          },
        });
      }
      console.log('Permissions seeded.');

      // Seed Role Permissions
      const seededRoles = await tx.userRole.findMany();
      const seededPermissions = await tx.userPermission.findMany();

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
          tx.userRolePermission.upsert({
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
        const role = await tx.userRole.findFirst({
          where: { slug: user.roleSlug },
        });
        await tx.user.upsert({
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

      // Fetch admin users with roles that are not marked as isDefault
      const users = await tx.user.findMany({
        where: {
          role: {
            isDefault: false, // Exclude default roles
          },
        },
        include: {
          role: true, // Include role details if needed
        },
      });

      // Seed AuditLogs
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

        return tx.systemLog.create({
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

      // Seed Settings
      await tx.systemSetting.create({
        data: {
          name: 'Metronic',
        },
      });
      console.log('Settings seeded.');

      console.log('Database seeding completed!');
    },
    {
      timeout: 520000,
      maxWait: 520000,
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
