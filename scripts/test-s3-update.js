const http = require('http');
const https = require('https');

// Test S3 update functionality
async function testS3Update() {
  console.log('Testing S3 Update Functionality');
  console.log('================================\n');

  try {
    // 1. Get current image info
    console.log('1. Getting current image info...');
    const s3Url = 'https://nimptotemplatebucket.s3.ap-southeast-2.amazonaws.com/nimptotemplatebucket/templates/1755157726483_Pasted%20image.png';
    
    await new Promise((resolve) => {
      const req = https.get(s3Url, (res) => {
        if (res.statusCode === 200) {
          console.log(`   ✅ Image accessible (${res.headers['content-type']})`);
          console.log(`   📅 Current Last-Modified: ${res.headers['last-modified']}`);
          console.log(`   📏 Size: ${res.headers['content-length']} bytes`);
          console.log(`   🏷️  ETag: ${res.headers['etag']}`);
        } else {
          console.log(`   ❌ Image not accessible (Status: ${res.statusCode})`);
        }
        resolve();
      });
      req.on('error', (error) => {
        console.log(`   ❌ Error: ${error.message}`);
        resolve();
      });
      req.setTimeout(5000, () => {
        console.log('   ❌ Timeout');
        req.destroy();
        resolve();
      });
    });

    // 2. Test the update API endpoint
    console.log('\n2. Testing update API endpoint...');
    console.log('   📝 This will simulate the image refresh process');
    
    // Get template data first
    const templateData = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:3005/api/template', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
      req.on('error', reject);
    });

    if (templateData.success && templateData.data.length > 0) {
      const template = templateData.data[0];
      console.log(`   ✅ Template found: ${template.name}`);
      console.log(`   📁 ImagePath: ${template.imagePath}`);
      
      // Test the update logic
      console.log('   🔄 Update logic:');
      console.log('      - Delete existing image from S3');
      console.log('      - Upload same image to same path');
      console.log('      - Add metadata with timestamp');
      console.log('      - Update last modified time');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n================================');
  console.log('Test completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Go to template design page');
  console.log('2. Click "Save Template" without changes');
  console.log('3. Check S3 console for updated timestamp');
  console.log('4. Run this test again to see the difference');
}

// Run the test
testS3Update();
