const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleTemplates = [
  {
    name: 'Birthday Bash',
    category: 'Birthday',
    content: [
      {
        id: 'bb_header',
        type: 'SectionHeader',
        value: "It's a Party!",
        position: {
          x: 20,
          y: 20
        },
        size: {
          width: 300,
          height: 50
        },
        styles: {
          fontSize: '40px',
          color: '#ff69b4',
          textAlign: 'center'
        },
        zIndex: 0
      },
      {
        id: 'bb_text',
        type: 'TextBlock',
        value: "You're invited to celebrate a special birthday!\nDate: Event Date\nTime: Event Time\nLocation: Event Location",
        position: {
          x: 20,
          y: 90
        },
        size: {
          width: 300,
          height: 100
        },
        styles: {
          fontSize: '16px'
        },
        zIndex: 1
      }
    ],
    backgroundStyle: null,
    htmlContent: '<div class="birthday-template"><h1>🎉 Birthday Bash 🎉</h1><p>Join us for a celebration!</p></div>',
    background: '#fef3c7',
    pageBackground: null,
    previewImageUrl: 'https://picsum.photos/seed/birthday_visual/400/250',
    isPremium: false,
    price: 0,
    isSystemTemplate: true,
    imagePath: null
  },
  {
    name: 'Corporate Conference',
    category: 'Corporate',
    content: [
      {
        id: 'cc_header',
        type: 'SectionHeader',
        value: 'Annual Conference 2024',
        position: {
          x: 20,
          y: 20
        },
        size: {
          width: 400,
          height: 60
        },
        styles: {
          fontSize: '36px',
          color: '#2c3e50',
          textAlign: 'center',
          fontWeight: 'bold'
        },
        zIndex: 0
      },
      {
        id: 'cc_subtitle',
        type: 'TextBlock',
        value: 'Join industry leaders for insights and networking',
        position: {
          x: 20,
          y: 100
        },
        size: {
          width: 400,
          height: 40
        },
        styles: {
          fontSize: '18px',
          color: '#7f8c8d',
          textAlign: 'center'
        },
        zIndex: 1
      }
    ],
    backgroundStyle: null,
    htmlContent: '<div class="corporate-template"><h1>🏢 Annual Conference 2024</h1><p>Professional networking event</p></div>',
    background: '#ecf0f1',
    pageBackground: null,
    previewImageUrl: 'https://picsum.photos/seed/corporate_visual/400/250',
    isPremium: true,
    price: 29.99,
    isSystemTemplate: false,
    imagePath: null
  },
  {
    name: 'Wedding Celebration',
    category: 'Wedding',
    content: [
      {
        id: 'wc_header',
        type: 'SectionHeader',
        value: 'Sarah & Michael',
        position: {
          x: 20,
          y: 20
        },
        size: {
          width: 350,
          height: 50
        },
        styles: {
          fontSize: '32px',
          color: '#e74c3c',
          textAlign: 'center',
          fontFamily: 'cursive'
        },
        zIndex: 0
      },
      {
        id: 'wc_date',
        type: 'TextBlock',
        value: 'Request the honor of your presence\nat their wedding celebration\n\nSaturday, June 15th, 2024\nat 4:00 in the afternoon',
        position: {
          x: 20,
          y: 90
        },
        size: {
          width: 350,
          height: 120
        },
        styles: {
          fontSize: '16px',
          color: '#2c3e50',
          textAlign: 'center',
          lineHeight: '1.6'
        },
        zIndex: 1
      }
    ],
    backgroundStyle: null,
    htmlContent: '<div class="wedding-template"><h1>💒 Sarah & Michael</h1><p>Wedding invitation</p></div>',
    background: '#fff5f5',
    pageBackground: null,
    previewImageUrl: 'https://picsum.photos/seed/wedding_visual/400/250',
    isPremium: true,
    price: 39.99,
    isSystemTemplate: false,
    imagePath: null
  },
  {
    name: 'Community Event',
    category: 'Community',
    content: [
      {
        id: 'ce_header',
        type: 'SectionHeader',
        value: 'Community Fun Day',
        position: {
          x: 20,
          y: 20
        },
        size: {
          width: 300,
          height: 50
        },
        styles: {
          fontSize: '28px',
          color: '#27ae60',
          textAlign: 'center'
        },
        zIndex: 0
      },
      {
        id: 'ce_details',
        type: 'TextBlock',
        value: 'Join us for a day of fun activities!\n\n• Games & Activities\n• Food & Refreshments\n• Live Music\n• Family Entertainment',
        position: {
          x: 20,
          y: 90
        },
        size: {
          width: 300,
          height: 150
        },
        styles: {
          fontSize: '14px',
          color: '#2c3e50',
          lineHeight: '1.8'
        },
        zIndex: 1
      }
    ],
    backgroundStyle: null,
    htmlContent: '<div class="community-template"><h1>🌳 Community Fun Day</h1><p>Family-friendly event</p></div>',
    background: '#e8f5e8',
    pageBackground: null,
    previewImageUrl: 'https://picsum.photos/seed/community_visual/400/250',
    isPremium: false,
    price: 0,
    isSystemTemplate: true,
    imagePath: null
  },
  {
    name: 'Baby Shower',
    category: 'Baby Shower',
    content: [
      {
        id: 'bs_header',
        type: 'SectionHeader',
        value: "It's a Girl!",
        position: {
          x: 20,
          y: 20
        },
        size: {
          width: 250,
          height: 50
        },
        styles: {
          fontSize: '32px',
          color: '#e91e63',
          textAlign: 'center',
          fontWeight: 'bold'
        },
        zIndex: 0
      },
      {
        id: 'bs_invitation',
        type: 'TextBlock',
        value: 'You are cordially invited to celebrate\nthe upcoming arrival of Baby Emma\n\nPlease join us for a baby shower\n\nDate: Saturday, March 30th, 2024\nTime: 2:00 PM\nLocation: Community Center',
        position: {
          x: 20,
          y: 90
        },
        size: {
          width: 300,
          height: 180
        },
        styles: {
          fontSize: '16px',
          color: '#333',
          textAlign: 'center',
          lineHeight: '1.6'
        },
        zIndex: 1
      }
    ],
    backgroundStyle: null,
    htmlContent: '<div class="baby-shower-template"><h1>👶 It\'s a Girl!</h1><p>Baby shower invitation</p></div>',
    background: '#fce4ec',
    pageBackground: null,
    previewImageUrl: 'https://picsum.photos/seed/babyshower_visual/400/250',
    isPremium: false,
    price: 0,
    isSystemTemplate: false,
    imagePath: null
  }
];

async function seedTemplates() {
  console.log('🌱 Starting template seeding...\n');

  try {
    // Check if templates already exist
    const existingTemplates = await prisma.template.count();
    
    if (existingTemplates > 0) {
      console.log(`⚠️  Found ${existingTemplates} existing templates. Skipping seeding.`);
      console.log('To reseed, first delete existing templates from the database.');
      return;
    }

    console.log('📝 Creating sample templates...\n');

    for (const template of sampleTemplates) {
      const createdTemplate = await prisma.template.create({
        data: {
          name: template.name,
          category: template.category,
          jsonContent: JSON.stringify(template.content),
          backgroundStyle: template.backgroundStyle ? JSON.stringify(template.backgroundStyle) : null,
          htmlContent: template.htmlContent,
          background: template.background,
          pageBackground: template.pageBackground,
          previewImageUrl: template.previewImageUrl,
          isPremium: template.isPremium,
          price: template.price,
          isSystemTemplate: template.isSystemTemplate,
          imagePath: template.imagePath,
          createdByUserId: null, // System templates
        },
      });

      console.log(`✅ Created: ${createdTemplate.name} (${createdTemplate.category})`);
      console.log(`   ID: ${createdTemplate.id}`);
      console.log(`   Premium: ${createdTemplate.isPremium ? `$${createdTemplate.price}` : 'Free'}`);
      console.log(`   System: ${createdTemplate.isSystemTemplate ? 'Yes' : 'No'}`);
      console.log('');
    }

    console.log('🎉 Template seeding completed successfully!');
    console.log(`📊 Total templates created: ${sampleTemplates.length}`);

    // Summary
    console.log('\n📋 Summary:');
    const categories = [...new Set(sampleTemplates.map(t => t.category))];
    categories.forEach(category => {
      const count = sampleTemplates.filter(t => t.category === category).length;
      console.log(`   ${category}: ${count} templates`);
    });

    const premiumCount = sampleTemplates.filter(t => t.isPremium).length;
    const freeCount = sampleTemplates.filter(t => !t.isPremium).length;
    console.log(`   Premium: ${premiumCount} templates`);
    console.log(`   Free: ${freeCount} templates`);

  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedTemplates()
    .then(() => {
      console.log('\n✅ Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = {
  seedTemplates,
  sampleTemplates
};
