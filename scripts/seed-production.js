#!/usr/bin/env node

/**
 * Smart Database Seeding Script
 *
 * This script intelligently seeds essential data for any environment.
 * It only creates data that doesn't exist, preventing duplicates.
 * Works on development, UAT, and production environments.
 *
 * Usage: npm run seed:smart
 */

const { PrismaClient } = require('@prisma/client');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

const prisma = new PrismaClient();

// Essential user roles for production
const essentialRoles = [
  {
    slug: 'super-admin',
    name: 'Super Admin',
    description:
      'Full control over the application, including user management, role management, and all settings.',
    isProtected: true,
    isDefault: false,
  },
  {
    slug: 'application-admin',
    name: 'Application Admin',
    description:
      'Manages application-wide events, templates, and communications. Can manage most users except Super Admins.',
    isProtected: false,
    isDefault: false,
  },
  {
    slug: 'host',
    name: 'Host',
    description:
      'Creates and manages their own events, guest lists, and event-specific communications.',
    isProtected: false,
    isDefault: false,
  },
  {
    slug: 'attendee',
    name: 'Attendee',
    description:
      'Registered user who can attend events, RSVP, and use attendee-specific features.',
    isProtected: false,
    isDefault: true, // This is the default role for new signups
  },
];

// Essential template categories
const essentialCategories = [
  {
    name: 'Baby & Kids',
    slug: 'baby-kids',
    description: 'Baby showers, kids birthdays, and children events',
    icon: '👶',
    color: '#FFB6C1',
    sortOrder: 1,
  },
  {
    name: 'Parties',
    slug: 'parties',
    description: 'General party invitations',
    icon: '🎉',
    color: '#FF6347',
    sortOrder: 2,
  },
  {
    name: 'Birthday',
    slug: 'birthday',
    description: 'Birthday party invitations',
    icon: '🎂',
    color: '#FF69B4',
    sortOrder: 3,
  },
  {
    name: 'Wedding',
    slug: 'wedding',
    description: 'Wedding invitations',
    icon: '💒',
    color: '#F0E68C',
    sortOrder: 4,
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Business event invitations',
    icon: '💼',
    color: '#4682B4',
    sortOrder: 5,
  },
  {
    name: 'Holidays',
    slug: 'holidays',
    description: 'Holiday celebration invitations',
    icon: '🎄',
    color: '#32CD32',
    sortOrder: 6,
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Sports event invitations',
    icon: '⚽',
    color: '#90EE90',
    sortOrder: 7,
  },
  {
    name: 'Graduation',
    slug: 'graduation',
    description: 'Graduation celebration invitations',
    icon: '🎓',
    color: '#9370DB',
    sortOrder: 8,
  },
];

// Essential permissions
const essentialPermissions = [
  {
    slug: 'users.create',
    name: 'Create Users',
    description: 'Create new users',
  },
  {
    slug: 'users.read',
    name: 'Read Users',
    description: 'View user information',
  },
  {
    slug: 'users.update',
    name: 'Update Users',
    description: 'Edit user information',
  },
  {
    slug: 'users.delete',
    name: 'Delete Users',
    description: 'Remove users',
  },
  {
    slug: 'events.create',
    name: 'Create Events',
    description: 'Create new events',
  },
  {
    slug: 'events.read',
    name: 'Read Events',
    description: 'View events',
  },
  {
    slug: 'events.update',
    name: 'Update Events',
    description: 'Edit events',
  },
  {
    slug: 'events.delete',
    name: 'Delete Events',
    description: 'Remove events',
  },
  {
    slug: 'templates.create',
    name: 'Create Templates',
    description: 'Create new templates',
  },
  {
    slug: 'templates.read',
    name: 'Read Templates',
    description: 'View templates',
  },
  {
    slug: 'templates.update',
    name: 'Update Templates',
    description: 'Edit templates',
  },
  {
    slug: 'templates.delete',
    name: 'Delete Templates',
    description: 'Remove templates',
  },
  {
    slug: 'system.settings',
    name: 'System Settings',
    description: 'Manage system settings',
  },
  {
    slug: 'system.logs',
    name: 'System Logs',
    description: 'View system logs',
  },
];

async function seedUserRoles() {
  logStep('1', 'Seeding essential user roles');

  try {
    for (const role of essentialRoles) {
      await prisma.userRole.upsert({
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
    }

    logSuccess(`Seeded ${essentialRoles.length} user roles`);
  } catch (error) {
    logError(`Failed to seed user roles: ${error.message}`);
    throw error;
  }
}

async function seedPermissions() {
  logStep('2', 'Seeding essential permissions');

  try {
    for (const permission of essentialPermissions) {
      await prisma.userPermission.upsert({
        where: { slug: permission.slug },
        update: {
          name: permission.name,
          description: permission.description,
        },
        create: {
          slug: permission.slug,
          name: permission.name,
          description: permission.description,
          createdAt: new Date(),
        },
      });
    }

    logSuccess(`Seeded ${essentialPermissions.length} permissions`);
  } catch (error) {
    logError(`Failed to seed permissions: ${error.message}`);
    throw error;
  }
}

async function seedTemplateCategories() {
  logStep('3', 'Seeding template categories');

  try {
    for (const category of essentialCategories) {
      await prisma.templateCategory.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          description: category.description,
          icon: category.icon,
          color: category.color,
          sortOrder: category.sortOrder,
        },
        create: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          color: category.color,
          sortOrder: category.sortOrder,
          createdAt: new Date(),
        },
      });
    }

    logSuccess(`Seeded ${essentialCategories.length} template categories`);
  } catch (error) {
    logError(`Failed to seed template categories: ${error.message}`);
    throw error;
  }
}

async function seedSystemSettings() {
  logStep('4', 'Seeding system settings');

  try {
    await prisma.systemSetting.upsert({
      where: { name: 'My Company' },
      update: {},
      create: {
        name: 'My Company',
        active: true,
        language: 'en',
        timezone: 'UTC',
        currency: 'USD',
        currencyFormat: '$ {value}',
        createdAt: new Date(),
      },
    });

    logSuccess('System settings seeded');
  } catch (error) {
    logError(`Failed to seed system settings: ${error.message}`);
    throw error;
  }
}

async function verifySeeding() {
  logStep('5', 'Verifying seeded data');

  try {
    const roleCount = await prisma.userRole.count();
    const permissionCount = await prisma.userPermission.count();
    const categoryCount = await prisma.templateCategory.count();
    const settingsCount = await prisma.systemSetting.count();

    logSuccess(`Verification complete:`);
    logInfo(`  - User Roles: ${roleCount}`);
    logInfo(`  - Permissions: ${permissionCount}`);
    logInfo(`  - Template Categories: ${categoryCount}`);
    logInfo(`  - System Settings: ${settingsCount}`);

    // Check for default role
    const defaultRole = await prisma.userRole.findFirst({
      where: { isDefault: true },
    });

    if (defaultRole) {
      logSuccess(`Default role found: ${defaultRole.name}`);
    } else {
      logWarning('No default role found - this may cause signup issues');
    }
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    throw error;
  }
}

async function main() {
  log('🌱 Smart Database Seeding', 'bright');
  log('==========================', 'bright');

  try {
    await seedUserRoles();
    await seedPermissions();
    await seedTemplateCategories();
    await seedSystemSettings();
    await verifySeeding();

    logSuccess('🎉 Smart seeding completed successfully!');
    logInfo('Essential data has been seeded and is ready for use');
  } catch (error) {
    logError(`Smart seeding failed: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the seeding
if (require.main === module) {
  main();
}

module.exports = { main };
