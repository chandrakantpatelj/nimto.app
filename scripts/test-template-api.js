const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

// Test data
const sampleTemplate = {
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
  htmlContent: '<div>Birthday content</div>',
  background: '#fef3c7',
  pageBackground: null,
  previewImageUrl: 'https://picsum.photos/seed/birthday_visual/400/250',
  isPremium: false,
  price: 0,
  isSystemTemplate: false,
  imagePath: null
};

async function testTemplateAPI() {
  console.log('🚀 Starting Template API Tests...\n');

  let createdTemplateId = null;

  try {
    // Test 1: GET /api/template - List templates
    console.log('1. Testing GET /api/template - List templates');
    const listResponse = await fetch(`${BASE_URL}/template`);
    const listData = await listResponse.json();
    
    if (listResponse.ok) {
      console.log('✅ Success: Templates listed');
      console.log(`   Found ${listData.data?.length || 0} templates`);
      console.log(`   No pagination - all templates returned`);
    } else {
      console.log('❌ Failed:', listData.error);
    }
    console.log('');

    // Test 2: POST /api/template - Create template
    console.log('2. Testing POST /api/template - Create template');
    const createResponse = await fetch(`${BASE_URL}/template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleTemplate),
    });
    const createData = await createResponse.json();
    
    if (createResponse.ok) {
      console.log('✅ Success: Template created');
      createdTemplateId = createData.data.id;
      console.log(`   Template ID: ${createdTemplateId}`);
      console.log(`   Name: ${createData.data.name}`);
      console.log(`   Category: ${createData.data.category}`);
    } else {
      console.log('❌ Failed:', createData.error);
    }
    console.log('');

    if (createdTemplateId) {
      // Test 3: GET /api/template/[id] - Get specific template
      console.log('3. Testing GET /api/template/[id] - Get specific template');
      const getResponse = await fetch(`${BASE_URL}/template/${createdTemplateId}`);
      const getData = await getResponse.json();
      
      if (getResponse.ok) {
        console.log('✅ Success: Template retrieved');
        console.log(`   Name: ${getData.data.name}`);
        console.log(`   Category: ${getData.data.category}`);
        console.log(`   Content elements: ${getData.data.content?.length || 0}`);
      } else {
        console.log('❌ Failed:', getData.error);
      }
      console.log('');

      // Test 4: PUT /api/template/[id] - Update template
      console.log('4. Testing PUT /api/template/[id] - Update template');
      const updateData = {
        name: 'Updated Birthday Bash',
        isPremium: true,
        price: 19.99,
        htmlContent: '<div>Updated birthday content</div>'
      };
      
      const updateResponse = await fetch(`${BASE_URL}/template/${createdTemplateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      const updateResult = await updateResponse.json();
      
      if (updateResponse.ok) {
        console.log('✅ Success: Template updated');
        console.log(`   New name: ${updateResult.data.name}`);
        console.log(`   Premium: ${updateResult.data.isPremium}`);
        console.log(`   Price: $${updateResult.data.price}`);
      } else {
        console.log('❌ Failed:', updateResult.error);
      }
      console.log('');

      // Test 5: DELETE /api/template/[id] - Delete template
      console.log('5. Testing DELETE /api/template/[id] - Delete template');
      const deleteResponse = await fetch(`${BASE_URL}/template/${createdTemplateId}`, {
        method: 'DELETE',
      });
      const deleteData = await deleteResponse.json();
      
      if (deleteResponse.ok) {
        console.log('✅ Success: Template deleted');
        console.log(`   Message: ${deleteData.message}`);
      } else {
        console.log('❌ Failed:', deleteData.error);
      }
      console.log('');

      // Test 6: Verify template is deleted (should return 404)
      console.log('6. Testing GET /api/template/[id] - Verify deletion');
      const verifyResponse = await fetch(`${BASE_URL}/template/${createdTemplateId}`);
      const verifyData = await verifyResponse.json();
      
      if (verifyResponse.status === 404) {
        console.log('✅ Success: Template not found (correctly deleted)');
      } else {
        console.log('❌ Failed: Template still exists');
      }
      console.log('');
    }

    // Test 7: Test filtering and search
    console.log('7. Testing GET /api/template with filters');
    
    // Test category filter
    const categoryResponse = await fetch(`${BASE_URL}/template?category=Birthday`);
    const categoryData = await categoryResponse.json();
    console.log(`   Category filter (Birthday): ${categoryData.data?.length || 0} templates found`);
    
    // Test premium filter
    const premiumResponse = await fetch(`${BASE_URL}/template?isPremium=true`);
    const premiumData = await premiumResponse.json();
    console.log(`   Premium filter: ${premiumData.data?.length || 0} templates found`);
    
    // Test search
    const searchResponse = await fetch(`${BASE_URL}/template?search=birthday`);
    const searchData = await searchResponse.json();
    console.log(`   Search "birthday": ${searchData.data?.length || 0} templates found`);
    
    console.log('✅ Filter tests completed');
    console.log('');

    console.log('🎉 All API tests completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Test image upload functionality
async function testImageUpload() {
  console.log('🖼️  Testing Image Upload...\n');

  try {
    // Note: This would require a real image file
    console.log('Note: Image upload test requires a real image file');
    console.log('To test image upload, you would need to:');
    console.log('1. Create a FormData with an image file');
    console.log('2. Send POST request to /api/template/upload');
    console.log('3. Verify the image is saved to public/template/ folder');
    console.log('');

    // Example of how it would work:
    /*
    const FormData = require('form-data');
    const fs = require('fs');
    
    const form = new FormData();
    form.append('image', fs.createReadStream('./test-image.jpg'));
    
    const response = await fetch(`${BASE_URL}/template/upload`, {
      method: 'POST',
      body: form,
    });
    
    const data = await response.json();
    console.log('Upload result:', data);
    */
    
  } catch (error) {
    console.error('❌ Image upload test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('='.repeat(50));
  console.log('TEMPLATE API TEST SUITE');
  console.log('='.repeat(50));
  console.log('');

  await testTemplateAPI();
  console.log('');
  await testImageUpload();
  
  console.log('');
  console.log('='.repeat(50));
  console.log('TEST SUITE COMPLETED');
  console.log('='.repeat(50));
}

// Check if running directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testTemplateAPI,
  testImageUpload,
  runTests
};
