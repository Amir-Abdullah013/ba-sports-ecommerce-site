/**
 * Sample products script to test brand filtering
 * Run with: node add-sample-products.js
 */

const { PrismaClient } = require('@prisma/client');

async function addSampleProducts() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.NEXT_PUBLIC_DATABASE_URL,
      },
    },
  });

  try {
    console.log('🔍 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Get or create a category
    const category = await prisma.category.upsert({
      where: { name: 'Sports Equipment' },
      update: {},
      create: {
        name: 'Sports Equipment',
        description: 'High-quality sports equipment',
        slug: 'sports-equipment',
        isActive: true
      }
    });

    console.log('✅ Using category:', category.name);

    // Add sample products using raw SQL to avoid enum issues
    const sampleProducts = [
      {
        name: 'Nike Air Max Running Shoes',
        description: 'Premium running shoes for athletes',
        price: 129.99,
        originalPrice: 149.99,
        image: '/BA-SportsLogo.png',
        images: JSON.stringify(['/BA-SportsLogo.png']),
        categoryId: category.id,
        stock: 25,
        isActive: true,
        isFeatured: true,
        rating: 4.9,
        reviewCount: 42,
        tags: JSON.stringify(['running', 'shoes', 'nike']),
        brandType: 'OTHER'
      },
      {
        name: 'Adidas Training Kit',
        description: 'Complete training kit for fitness enthusiasts',
        price: 79.99,
        originalPrice: 89.99,
        image: '/BA-SportsLogo.png',
        images: JSON.stringify(['/BA-SportsLogo.png']),
        categoryId: category.id,
        stock: 40,
        isActive: true,
        isFeatured: false,
        rating: 4.6,
        reviewCount: 31,
        tags: JSON.stringify(['training', 'kit', 'adidas']),
        brandType: 'OTHER'
      }
    ];

    for (const productData of sampleProducts) {
      await prisma.$executeRaw`
        INSERT INTO "products" (
          "id", "name", "description", "price", "originalPrice", "image", "images", 
          "categoryId", "stock", "isActive", "isFeatured", "rating", "reviewCount", 
          "tags", "brandType", "createdAt", "updatedAt"
        ) VALUES (
          ${productData.id || undefined}, ${productData.name}, ${productData.description}, 
          ${productData.price}, ${productData.originalPrice}, ${productData.image}, 
          ${productData.images}, ${productData.categoryId}, ${productData.stock}, 
          ${productData.isActive}, ${productData.isFeatured}, ${productData.rating}, 
          ${productData.reviewCount}, ${productData.tags}, ${productData.brandType}, 
          NOW(), NOW()
        )
      `;
    }

    console.log('✅ Added 2 sample products with OTHER brand type');

    // Test the brand filtering
    console.log('\n🔍 Testing brand filtering...');
    const baSportsProducts = await prisma.$queryRaw`
      SELECT id, name, "brandType" 
      FROM "products" 
      WHERE "brandType" = 'BA_SPORTS' AND "isActive" = true
      LIMIT 5
    `;

    const otherBrandsProducts = await prisma.$queryRaw`
      SELECT id, name, "brandType" 
      FROM "products" 
      WHERE "brandType" = 'OTHER' AND "isActive" = true
      LIMIT 5
    `;

    console.log(`✅ BA Sports products: ${baSportsProducts.length}`);
    baSportsProducts.forEach(p => console.log(`  - ${p.name} (${p.brandType})`));
    
    console.log(`✅ Other brands products: ${otherBrandsProducts.length}`);
    otherBrandsProducts.forEach(p => console.log(`  - ${p.name} (${p.brandType})`));

    // Test the API endpoint
    console.log('\n🔍 Testing API endpoint...');
    const allProducts = await prisma.$queryRaw`
      SELECT id, name, "brandType", "isActive"
      FROM "products" 
      WHERE "isActive" = true
      LIMIT 10
    `;

    console.log(`✅ Total active products: ${allProducts.length}`);
    allProducts.forEach(p => console.log(`  - ${p.name} (${p.brandType}, Active: ${p.isActive})`));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleProducts();
