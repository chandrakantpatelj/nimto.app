const https = require('https');

// Test if S3 URLs are accessible
const testUrls = [
  'https://nimptotemplatebucket.s3.ap-southeast-2.amazonaws.com/nimptotemplatebucket/templates/1755157726483_Pasted image.png',
  'https://nimptotemplatebucket.s3.ap-southeast-2.amazonaws.com/nimptotemplatebucket/templates/1755158104331_Blue image.png'
];

console.log('Testing S3 Image Access');
console.log('=======================\n');

function testUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      if (res.statusCode === 200) {
        console.log('✅ Image accessible');
        resolve(true);
      } else {
        console.log(`❌ Image not accessible (Status: ${res.statusCode})`);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ Error accessing image: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Request timeout');
      req.destroy();
      resolve(false);
    });
  });
}

async function testAllUrls() {
  for (let i = 0; i < testUrls.length; i++) {
    console.log(`${i + 1}. Testing URL: ${testUrls[i]}`);
    await testUrl(testUrls[i]);
    console.log('');
  }
}

testAllUrls();
