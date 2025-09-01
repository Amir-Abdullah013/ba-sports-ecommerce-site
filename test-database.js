const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.NEXT_PUBLIC_DATABASE_URL,
      },
    },
  });

  try {
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    console.log('🔍 Checking products table...');
    const products = await prisma.product.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        brandType: true,
        isActive: true
      }
    });

    console.log(`✅ Found ${products.length} products:`);
    products.forEach(product => {
      console.log(`  - ${product.name} (Brand: ${product.brandType}, Active: ${product.isActive})`);
    });

    // Test brand filtering
    console.log('\n🔍 Testing brand filtering...');
    const baSportsProducts = await prisma.product.findMany({
      where: { brandType: 'BA_SPORTS', isActive: true },
      take: 3,
      select: { id: true, name: true, brandType: true }
    });

    const otherBrandsProducts = await prisma.product.findMany({
      where: { brandType: 'OTHER', isActive: true },
      take: 3,
      select: { id: true, name: true, brandType: true }
    });

    console.log(`✅ BA Sports products: ${baSportsProducts.length}`);
    console.log(`✅ Other brands products: ${otherBrandsProducts.length}`);

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
