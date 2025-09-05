#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Setting up enhanced template system...\n');

try {
  // Check if migration is needed
  console.log('🔍 Checking database schema...');
  try {
    execSync('npx prisma migrate status', { 
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ Database schema is up to date\n');
  } catch (error) {
    console.log('📦 Running database migration...');
    execSync('npx prisma migrate dev --name enhance_templates_system', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ Database migration completed\n');
  }

  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Prisma client generated\n');

  // Seed template categories
  console.log('🌱 Seeding template categories...');
  execSync('node prisma/seed-categories.js', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Template categories seeded\n');

  console.log('🎉 Enhanced template system setup completed successfully!');
  console.log('\n📋 What\'s new:');
  console.log('1. Enhanced template page at /templates with:');
  console.log('   - Hero section with action cards');
  console.log('   - Advanced search and filtering');
  console.log('   - Category browsing');
  console.log('   - Rich template cards with badges, colors, and keywords');
  console.log('2. Super admin category management at /templates/categories');
  console.log('3. Enhanced API with filtering and search capabilities');
  console.log('4. Template features: orientation, badges, popularity, colors, keywords');
  console.log('\n🔐 Access levels:');
  console.log('- Hosts: Can browse and use templates to create events');
  console.log('- Super Admins: Can manage categories + all host features');
  console.log('\n🎯 Next steps:');
  console.log('- Visit /templates to see the enhanced interface');
  console.log('- Super admins can manage categories at /templates/categories');
  console.log('- Templates now support rich metadata for better organization');

} catch (error) {
  console.error('❌ Error setting up enhanced template system:', error.message);
  process.exit(1);
}
