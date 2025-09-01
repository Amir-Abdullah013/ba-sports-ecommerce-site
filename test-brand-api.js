/**
 * Test script for brand filtering API endpoints
 * Run with: node test-brand-api.js
 */

const BASE_URL = 'http://localhost:3000';

async function testAPI(endpoint, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`📍 Endpoint: ${endpoint}`);
    
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Products found: ${data.products?.length || 0}`);
    
    if (data.products && data.products.length > 0) {
      console.log(`🏷️ Sample product brands:`, data.products.slice(0, 3).map(p => ({
        name: p.name,
        brandType: p.brandType
      })));
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Error testing ${endpoint}:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Brand Filter API Tests...');
  
  // Test 1: All products
  await testAPI('/api/products?page=1&limit=5', 'All products');
  
  // Test 2: BA Sports products only
  await testAPI('/api/products?page=1&limit=5&brand=BA_SPORTS', 'BA Sports products only');
  
  // Test 3: Other brands only
  await testAPI('/api/products?page=1&limit=5&brand=OTHER', 'Other brands only');
  
  // Test 4: Combined filters
  await testAPI('/api/products?page=1&limit=5&brand=BA_SPORTS&category=Football', 'BA Sports Football products');
  
  console.log('\n✅ All tests completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Visit http://localhost:3000/products to test the frontend');
  console.log('2. Try switching between "All Products", "BA Sports", and "Other Brands" tabs');
  console.log('3. Visit http://localhost:3000/admin/products to test the admin form');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAPI, runTests };
