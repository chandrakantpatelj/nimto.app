const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTemplates() {
  try {
    console.log('Checking templates in database...\n');
    
    const templates = await prisma.template.findMany({
      where: {
        isTrashed: false,
      },
      select: {
        id: true,
        name: true,
        category: true,
        imagePath: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${templates.length} templates:\n`);

    templates.forEach((template, index) => {
      console.log(`${index + 1}. Template: ${template.name}`);
      console.log(`   ID: ${template.id}`);
      console.log(`   Category: ${template.category}`);
      console.log(`   ImagePath: ${template.imagePath || 'NULL'}`);
      console.log(`   Created: ${template.createdAt}`);
      console.log(`   Updated: ${template.updatedAt}`);
      console.log('');
    });

    const templatesWithImages = templates.filter(t => t.imagePath);
    console.log(`\nTemplates with imagePath: ${templatesWithImages.length}`);
    console.log(`Templates without imagePath: ${templates.length - templatesWithImages.length}`);

  } catch (error) {
    console.error('Error checking templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTemplates();
