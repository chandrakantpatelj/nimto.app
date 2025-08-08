const { PrismaClient } = require('@prisma/client');
const rolesData = require('./data/roles');
const permissionsData = require('./data/permissions');

const prisma = new PrismaClient();

async function main() {
  console.log('Adding user roles and permissions...');

  try {
    // Get the owner user to use as createdByUserId
    const ownerUser = await prisma.user.findFirst({
      where: { email: 'owner@kt.com' }
    });

    if (!ownerUser) {
      console.log('Owner user not found. Creating roles without createdByUserId...');
    }

    // Add Roles
    console.log('Adding roles...');
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
          createdByUserId: ownerUser?.id,
        },
      });
      console.log(`✓ Added role: ${role.name}`);
    }

    // Add Permissions
    console.log('Adding permissions...');
    for (const permission of permissionsData) {
      await prisma.userPermission.upsert({
        where: { slug: permission.slug },
        update: {},
        create: {
          slug: permission.slug,
          name: permission.name,
          description: permission.description,
          createdAt: new Date(),
          createdByUserId: ownerUser?.id,
        },
      });
      console.log(`✓ Added permission: ${permission.name}`);
    }

    // Get all roles and permissions for assignment
    const roles = await prisma.userRole.findMany();
    const permissions = await prisma.userPermission.findMany();

    // Assign permissions to roles based on role type
    console.log('Assigning permissions to roles...');
    
    for (const role of roles) {
      let rolePermissions = [];

      // Super Admin gets all permissions
      if (role.slug === 'super-admin') {
        rolePermissions = permissions;
      }
      // Application Admin gets most permissions except user/role management
      else if (role.slug === 'application-admin') {
        rolePermissions = permissions.filter(p => 
          !p.slug.includes('MANAGE_USERS') && 
          !p.slug.includes('MANAGE_ROLES')
        );
      }
      // Host gets event and guest management permissions
      else if (role.slug === 'host') {
        rolePermissions = permissions.filter(p => 
          p.slug.includes('CREATE_EVENTS') ||
          p.slug.includes('MANAGE_OWN_EVENTS') ||
          p.slug.includes('MANAGE_OWN_GUESTS') ||
          p.slug.includes('USE_HOST_TEMPLATES') ||
          p.slug.includes('MESSAGE_EVENT_GUESTS') ||
          p.slug.includes('VIEW_OWN_EVENT_ANALYTICS') ||
          p.slug.includes('GENERATE_EVENT_IDEAS_AI') ||
          p.slug.includes('VIEW_PROFILE') ||
          p.slug.includes('EDIT_OWN_PROFILE') ||
          p.slug.includes('CHANGE_OWN_PASSWORD') ||
          p.slug.includes('MANAGE_OWN_NOTIFICATIONS')
        );
      }
      // Attendee gets basic permissions
      else if (role.slug === 'attendee') {
        rolePermissions = permissions.filter(p => 
          p.slug.includes('VIEW_INVITED_EVENTS') ||
          p.slug.includes('RSVP_TO_EVENTS') ||
          p.slug.includes('UPLOAD_EVENT_PHOTOS') ||
          p.slug.includes('MESSAGE_EVENT_HOSTS') ||
          p.slug.includes('VIEW_PROFILE') ||
          p.slug.includes('EDIT_OWN_PROFILE') ||
          p.slug.includes('CHANGE_OWN_PASSWORD') ||
          p.slug.includes('MANAGE_OWN_NOTIFICATIONS')
        );
      }

      // Create role-permission relationships
      for (const permission of rolePermissions) {
        await prisma.userRolePermission.upsert({
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
        });
      }
      console.log(`✓ Assigned ${rolePermissions.length} permissions to ${role.name}`);
    }

    console.log('✅ All roles and permissions added successfully!');
  } catch (error) {
    console.error('Error adding roles and permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
