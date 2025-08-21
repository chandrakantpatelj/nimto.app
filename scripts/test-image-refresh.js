const http = require('http');
const https = require('https');

// Test the image refresh functionality
async function testImageRefresh() {
  console.log('Testing Image Refresh Functionality');
  console.log('====================================\n');

  try {
    // 1. Get template data
    console.log('1. Fetching template data...');
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
      console.log(`   📁 ImagePath: ${template.imagePath || 'None'}`);

      if (template.imagePath) {
        // 2. Test image accessibility
        console.log('\n2. Testing image accessibility...');
        const s3Url = `https://nimptotemplatebucket.s3.ap-southeast-2.amazonaws.com/nimptotemplatebucket/${template.imagePath}`;
        
        await new Promise((resolve) => {
          const req = https.get(s3Url, (res) => {
            if (res.statusCode === 200) {
              console.log(`   ✅ Image accessible (${res.headers['content-type']})`);
              console.log(`   📅 Last-Modified: ${res.headers['last-modified']}`);
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

        // 3. Test proxy access
        console.log('\n3. Testing proxy access...');
        const proxyUrl = `http://localhost:3005/api/test-image?url=${encodeURIComponent(s3Url)}`;
        
        await new Promise((resolve) => {
          const req = http.get(proxyUrl, (res) => {
            if (res.statusCode === 200) {
              console.log(`   ✅ Proxy accessible (${res.headers['content-type']})`);
            } else {
              console.log(`   ❌ Proxy not accessible (Status: ${res.statusCode})`);
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
      } else {
        console.log('   ⚠️  No image path found for testing');
      }
    } else {
      console.log('   ❌ No templates found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n====================================');
  console.log('Test completed!');
}

// Run the test
testImageRefresh();
