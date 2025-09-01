/**
 * Sample products script to test brand filtering
 * Run with: node add-sample-products.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleProducts = [
  // BA Sports products
  {
    name: 'BA Sports Premium Football',
    description: 'High-quality football made with premium materials for professional play.',
    price: 29.99,
    originalPrice: 39.99,
    stock: 50,
    brandType: 'BA_SPORTS',
    category: 'Football',
    image: '/BA-SportsLogo.png',
    images: JSON.stringify(['/BA-SportsLogo.png']),
    tags: JSON.stringify(['football', 'sports', 'premium']),
    rating: 4.5,
    isActive: true,
    isFeatured: true
  },
  {
    name: 'BA Sports Basketball',
    description: 'Professional-grade basketball with excellent grip and durability.',
    price: 34.99,
    stock: 30,
    brandType: 'BA_SPORTS',
    category: 'Basketball',
    image: '/BA-SportsLogo.png',
    images: JSON.stringify(['/BA-SportsLogo.png']),
    tags: JSON.stringify(['basketball', 'sports', 'professional']),
    rating: 4.7,
    isActive: true
  },
  {
    name: 'BA Sports Tennis Racket',
    description: 'Lightweight tennis racket perfect for beginners and intermediate players.',
    price: 89.99,
    originalPrice: 109.99,
    stock: 20,
    brandType: 'BA_SPORTS',
    category: 'Tennis',
    image: '/BA-SportsLogo.png',
    images: JSON.stringify(['/BA-SportsLogo.png']),
    tags: JSON.stringify(['tennis', 'racket', 'lightweight']),
    rating: 4.3,
    isActive: true
  },
  
  // Other brand products
  {
    name: 'Nike Air Max Soccer Ball',
    description: 'Official size soccer ball with Nike Air Max technology.',
    price: 45.99,
    stock: 25,
    brandType: 'OTHER',
    category: 'Soccer',
    image: '/BA-SportsLogo.png',
    images: JSON.stringify(['/BA-SportsLogo.png']),
    tags: JSON.stringify(['soccer', 'nike', 'official']),
    rating: 4.8,
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Adidas Training Shoes',
    description: 'Comfortable training shoes for all sports activities.',
    price: 79.99,
    originalPrice: 99.99,
    stock: 40,
    brandType: 'OTHER',
    category: 'Footwear',
    image: '/BA-SportsLogo.png',
    images: JSON.stringify(['/BA-SportsLogo.png']),
    tags: JSON.stringify(['shoes', 'adidas', 'training']),
    rating: 4.6,
    isActive: true
  },
  {
    name: 'Wilson Tennis Balls Set',
    description: 'Professional tennis balls set of 3, perfect for tournaments.',
    price: 12.99,
    stock: 100,
    brandType: 'OTHER',
    category: 'Tennis',
    image: '/BA-SportsLogo.png',
    images: JSON.stringify(['/BA-SportsLogo.png']),
    tags: JSON.stringify(['tennis', 'wilson', 'professional']),
    rating: 4.4,
    isActive: true
  }
];

async function addSampleProducts() {
  try {
    console.log('🏗️ Adding sample products for brand filtering test...');
    
    // First, create categories if they don't exist
    const categories = ['Football', 'Basketball', 'Tennis', 'Soccer', 'Footwear'];
    
    for (const categoryName of categories) {
      await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: {
          name: categoryName,
          slug: categoryName.toLowerCase(),
          description: `${categoryName} products and equipment`,
          isActive: true
        }
      });
    }
    
    console.log('✅ Categories created/updated');
    
    // Add sample products
    for (const productData of sampleProducts) {
      // Find the category
      const category = await prisma.category.findFirst({
        where: { name: productData.category }
      });
      
      if (!category) {
        console.error(`❌ Category not found: ${productData.category}`);
        continue;
      }
      
      // Create the product
      const product = await prisma.product.create({
        data: {
          ...productData,
          categoryId: category.id,
          category: undefined // Remove category from data since we're using categoryId
        }
      });
      
      console.log(`✅ Added ${product.brandType} product: ${product.name}`);
    }
    
    console.log('\n🎉 Sample products added successfully!');
    console.log('\n📊 Summary:');
    
    const baCount = await prisma.product.count({ where: { brandType: 'BA_SPORTS' } });
    const otherCount = await prisma.product.count({ where: { brandType: 'OTHER' } });
    
    console.log(`- BA Sports products: ${baCount}`);
    console.log(`- Other brand products: ${otherCount}`);
    console.log(`- Total products: ${baCount + otherCount}`);
    
  } catch (error) {
    console.error('❌ Error adding sample products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  addSampleProducts();
}

module.exports = { addSampleProducts };
