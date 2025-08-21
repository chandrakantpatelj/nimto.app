// Test S3 URL generation manually
require('dotenv').config({ path: '.env' });

// Manual S3 URL generation function
function generateS3Url(imagePath) {
  if (!imagePath) return null;
  
  const bucket = process.env.AWS_S3_BUCKET || process.env.STORAGE_BUCKET || process.env.NEXT_PUBLIC_AWS_S3_BUCKET || process.env.NEXT_PUBLIC_STORAGE_BUCKET;
  const region = process.env.AWS_REGION || process.env.STORAGE_REGION || process.env.NEXT_PUBLIC_AWS_REGION || process.env.NEXT_PUBLIC_STORAGE_REGION || 'us-east-1';
  const endpoint = process.env.AWS_ENDPOINT || process.env.STORAGE_ENDPOINT || process.env.NEXT_PUBLIC_AWS_ENDPOINT || process.env.NEXT_PUBLIC_STORAGE_ENDPOINT;
  
  if (!bucket) {
    console.warn('S3 bucket not configured');
    return null;
  }
  
  if (endpoint) {
    // For S3-compatible services (DigitalOcean Spaces, etc.)
    return `${endpoint}/${bucket}/${imagePath}`;
  } else {
    // For AWS S3
    return `https://${bucket}.s3.${region}.amazonaws.com/${bucket}/${imagePath}`;
  }
}

// Test with actual template image paths
const testPaths = [
  'templates/1755157726483_Pasted image.png',
  'templates/1755158104331_Blue image.png'
];

console.log('Testing S3 URL Generation');
console.log('==========================\n');

testPaths.forEach((path, index) => {
  console.log(`${index + 1}. Testing path: ${path}`);
  
  try {
    const url = generateS3Url(path);
    console.log(`   Generated URL: ${url}`);
    
    if (url) {
      console.log(`   ✅ URL generated successfully`);
    } else {
      console.log(`   ❌ URL generation failed`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('');
});

// Test environment variables
console.log('Environment Variables:');
console.log('=====================');
console.log(`STORAGE_BUCKET: ${process.env.STORAGE_BUCKET || 'NOT SET'}`);
console.log(`STORAGE_REGION: ${process.env.STORAGE_REGION || 'NOT SET'}`);
console.log(`STORAGE_ENDPOINT: ${process.env.STORAGE_ENDPOINT || 'NOT SET'}`);
console.log(`AWS_S3_BUCKET: ${process.env.AWS_S3_BUCKET || 'NOT SET'}`);
console.log(`AWS_REGION: ${process.env.AWS_REGION || 'NOT SET'}`);
console.log(`AWS_ENDPOINT: ${process.env.AWS_ENDPOINT || 'NOT SET'}`);
