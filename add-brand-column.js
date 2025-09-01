const { PrismaClient } = require('@prisma/client');

async function addBrandColumn() {
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

    // Check if brandType column exists
    console.log('🔍 Checking if brandType column exists...');
    
    try {
      // Try to query the brandType column
      const testQuery = await prisma.$queryRaw`
        SELECT "brandType" FROM "products" LIMIT 1
      `;
      console.log('✅ brandType column already exists');
    } catch (error) {
      if (error.message.includes('brandType') && error.message.includes('does not exist')) {
        console.log('❌ brandType column does not exist. Adding it...');
        
        // Add the brandType column
        await prisma.$executeRaw`
          ALTER TABLE "products" 
          ADD COLUMN "brandType" TEXT DEFAULT 'BA_SPORTS'
        `;
        
        console.log('✅ Added brandType column with default value BA_SPORTS');
        
        // Update existing products to have BA_SPORTS as default
        const updateResult = await prisma.$executeRaw`
          UPDATE "products" 
          SET "brandType" = 'BA_SPORTS' 
          WHERE "brandType" IS NULL
        `;
        
        console.log('✅ Updated existing products with BA_SPORTS brandType');
      } else {
        throw error;
      }
    }

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

    // Create some sample products with OTHER brand type for testing
    console.log('\n📝 Creating sample products with OTHER brand type...');
    
    const category = await prisma.category.findFirst();
    if (category) {
      const sampleOtherProducts = [
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

      for (const productData of sampleOtherProducts) {
        await prisma.product.create({
          data: productData
        });
      }

      console.log('✅ Created 2 sample products with OTHER brand type');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addBrandColumn();
