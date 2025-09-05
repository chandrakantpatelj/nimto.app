const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
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

async function main() {
  console.log('🌱 Seeding template categories...');

  try {
    // Clear existing categories
    await prisma.templateCategory.deleteMany();

    // Create categories
    for (const categoryData of categories) {
      await prisma.templateCategory.create({
        data: categoryData,
      });
    }

    console.log('✅ Template categories seeded successfully!');
    console.log(`📊 Created ${categories.length} categories`);
  } catch (error) {
    console.error('❌ Error seeding template categories:', error);
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
