const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const userRoles = [
  {
    slug: 'owner',
    name: 'Owner',
    description: 'System owner with full administrative access and control over all features.',
    isProtected: true,
    isDefault: false,
  },
  {
    slug: 'admin',
    name: 'Administrator',
    description: 'Administrator with full access to manage the system, users, and configurations.',
    isProtected: true,
    isDefault: false,
  },
  {
    slug: 'manager',
    name: 'Manager',
    description: 'Manager with permissions to oversee team operations, manage resources, and view reports.',
    isProtected: false,
    isDefault: false,
  },
  {
    slug: 'staff',
    name: 'Staff',
    description: 'Staff member with limited access to specific operational tasks and customer support.',
    isProtected: false,
    isDefault: false,
  },
  {
    slug: 'support',
    name: 'Support',
    description: 'Support team member responsible for handling customer queries, tickets, and technical issues.',
    isProtected: false,
    isDefault: false,
  },
  {
    slug: 'vendor',
    name: 'Vendor',
    description: 'Vendor with access to manage their own products, inventory, and order fulfillment.',
    isProtected: false,
    isDefault: false,
  },
  {
    slug: 'customer',
    name: 'Customer',
    description: 'Registered customer with access to purchase products, view orders, and manage their profile.',
    isProtected: false,
    isDefault: true, // This should be the default role for new signups
  },
  {
    slug: 'guest',
    name: 'Guest',
    description: 'Unauthenticated user with limited access to view public content and browse products.',
    isProtected: false,
    isDefault: false,
  },
  {
    slug: 'moderator',
    name: 'Moderator',
    description: 'Content moderator with permissions to review and manage user-generated content.',
    isProtected: false,
    isDefault: false,
  },
  {
    slug: 'analyst',
    name: 'Analyst',
    description: 'Data analyst with access to view reports, analytics, and business intelligence data.',
    isProtected: false,
    isDefault: false,
  },
  {
    slug: 'developer',
    name: 'Developer',
    description: 'Developer with technical access to API endpoints and system integrations.',
    isProtected: false,
    isDefault: false,
  },
  {
    slug: 'tester',
    name: 'Tester',
    description: 'Quality assurance tester with access to test features and report bugs.',
    isProtected: false,
    isDefault: false,
  },
];

async function addUserRoles() {
  try {
    console.log('Adding user roles to database...');
    
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
    
    // Verify that we have a default role
    const defaultRole = await prisma.userRole.findFirst({
      where: { isDefault: true },
    });
    
    if (defaultRole) {
      console.log(`\n✅ Default role found: ${defaultRole.name} (${defaultRole.slug})`);
    } else {
      console.log('\n❌ No default role found! This will cause signup issues.');
    }
    
    console.log('\n🎉 User roles added successfully!');
    
  } catch (error) {
    console.error('Error adding user roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addUserRoles();