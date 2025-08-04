const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function fixVerificationTokens() {
  try {
    console.log('Starting to fix VerificationToken records...');
    
    // Find all verification tokens that don't have an id
    const tokensWithoutId = await prisma.$queryRaw`
      SELECT "identifier", "token", "expires" 
      FROM "VerificationToken" 
      WHERE "id" IS NULL OR "id" = ''
    `;
    
    console.log(`Found ${tokensWithoutId.length} tokens without id`);
    
    if (tokensWithoutId.length === 0) {
      console.log('No tokens need fixing. All tokens already have id values.');
      return;
    }
    
    // Update each token with a new id
    for (const token of tokensWithoutId) {
      const newId = randomUUID();
      
      await prisma.$executeRaw`
        UPDATE "VerificationToken" 
        SET "id" = ${newId}
        WHERE "identifier" = ${token.identifier} 
        AND "token" = ${token.token}
      `;
      
      console.log(`Updated token for identifier ${token.identifier} with id ${newId}`);
    }
    
    console.log('Successfully fixed all VerificationToken records!');
    
  } catch (error) {
    console.error('Error fixing verification tokens:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixVerificationTokens()
  .then(() => {
    console.log('VerificationToken fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('VerificationToken fix failed:', error);
    process.exit(1);
  }); 