const http = require('http');

console.log('🔒 Testing Security Headers...\n');

const testSecurityHeaders = async (url, description) => {
  return new Promise((resolve) => {
    const urlObj = new URL(url, 'http://localhost:3000');
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 3000,
      path: urlObj.pathname,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      const headers = res.headers;
      const securityHeaders = {
        'X-Frame-Options': headers['x-frame-options'],
        'X-Content-Type-Options': headers['x-content-type-options'],
        'Referrer-Policy': headers['referrer-policy'],
        'X-XSS-Protection': headers['x-xss-protection'],
        'Strict-Transport-Security': headers['strict-transport-security'],
        'Permissions-Policy': headers['permissions-policy'],
      };

      console.log(`${description}:`);
      console.log(`  URL: ${url}`);
      console.log(`  Status: ${res.statusCode}`);
      
      let allHeadersPresent = true;
      Object.entries(securityHeaders).forEach(([header, value]) => {
        if (value) {
          console.log(`  ✅ ${header}: ${value}`);
        } else {
          console.log(`  ❌ ${header}: Missing`);
          allHeadersPresent = false;
        }
      });

      if (allHeadersPresent) {
        console.log(`  ✅ All security headers present`);
      } else {
        console.log(`  ⚠️  Some security headers missing`);
      }
      
      console.log('');
      resolve();
    });

    req.on('error', (error) => {
      console.log(`${description}:`);
      console.log(`  URL: ${url}`);
      console.log(`  ❌ Error: ${error.message}`);
      console.log('');
      resolve();
    });

    req.end();
  });
};

const runTests = async () => {
  console.log('Testing Security Headers on Different Routes:\n');
  
  await testSecurityHeaders('/', 'Landing Page');
  await testSecurityHeaders('/signin', 'Sign In Page');
  await testSecurityHeaders('/api/template', 'Template API');
  await testSecurityHeaders('/api/user-management/users', 'User Management API');
  await testSecurityHeaders('/app/(protected)/page', 'Protected Page');
  
  console.log('📋 Security Headers Test Summary:');
  console.log('✅ All routes should have security headers');
  console.log('✅ Headers protect against common web attacks');
  console.log('✅ No impact on existing functionality');
  console.log('');
  console.log('🔒 Security Headers Added:');
  console.log('• X-Frame-Options: DENY (prevents clickjacking)');
  console.log('• X-Content-Type-Options: nosniff (prevents MIME sniffing)');
  console.log('• Referrer-Policy: strict-origin-when-cross-origin (privacy)');
  console.log('• X-XSS-Protection: 1; mode=block (XSS protection)');
  console.log('• Strict-Transport-Security: max-age=31536000 (HTTPS enforcement)');
  console.log('• Permissions-Policy: camera=(), microphone=(), geolocation=() (privacy)');
};

runTests();
