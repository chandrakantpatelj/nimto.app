const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// User roles that match the application's requirements
const userRoles = [
  {
    slug: 'super-admin',
    name: 'Super Admin',
    description: 'Full control over the application, including user management, role management, and all settings.',
    isProtected: true,
    isDefault: false,
  },
  {
    slug: 'application-admin',
    name: 'Application Admin',
    description: 'Manages application-wide events, templates, and communications. Can manage most users except Super Admins.',
    isProtected: false,
    isDefault: false,
  },
  {
    slug: 'host',
    name: 'Host',
    description: 'Creates and manages their own events, guest lists, and event-specific communications.',
    isProtected: false,
    isDefault: false,
  },
  {
    slug: 'attendee',
    name: 'Attendee',
    description: 'Registered user who can attend events, RSVP, and use attendee-specific features.',
    isProtected: false,
    isDefault: true, // This is the default role for new signups
  },
];

async function setupUserRoles() {
  try {
    console.log('Setting up user roles for the application...');
    
    for (const role of userRoles) {
      const createdRole = await prisma.userRole.upsert({
        where: { slug: role.slug },
        update: {
          name: role.name,
          description: role.description,
          isProtected: role.isProtected,
          isDefault: role.isDefault,
        },
        create: {
          slug: role.slug,
          name: role.name,
          description: role.description,
          isProtected: role.isProtected,
          isDefault: role.isDefault,
          createdAt: new Date(),
        },
      });
      
      console.log(`✅ Role "${role.name}" (${role.slug}) ${createdRole.id ? 'updated' : 'created'}`);
    }
    
    // Verify that we have the required roles
    const hostRole = await prisma.userRole.findFirst({
      where: { slug: 'host' },
    });
    
    const defaultRole = await prisma.userRole.findFirst({
      where: { isDefault: true },
    });
    
    if (hostRole) {
      console.log(`\n✅ Host role found: ${hostRole.name} (${hostRole.slug})`);
    } else {
      console.log('\n❌ Host role not found! This will cause signup issues for hosts.');
    }
    
    if (defaultRole) {
      console.log(`✅ Default role found: ${defaultRole.name} (${defaultRole.slug})`);
    } else {
      console.log('\n❌ No default role found! This will cause signup issues.');
    }
    
    console.log('\n🎉 User roles setup completed successfully!');
    console.log('\n📋 Role Summary:');
    console.log('- super-admin: Full system control');
    console.log('- application-admin: Application management');
    console.log('- host: Event creation and management');
    console.log('- attendee: Default role for new users');
    
  } catch (error) {
    console.error('Error setting up user roles:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
setupUserRoles();
