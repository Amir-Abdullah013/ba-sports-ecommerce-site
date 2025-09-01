const { PrismaClient } = require('@prisma/client');

async function updateProductsBrand() {
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

    // First, let's check if we have any products
    const existingProducts = await prisma.product.findMany({
      take: 10,
      select: { id: true, name: true }
    });

    console.log(`✅ Found ${existingProducts.length} existing products`);

    if (existingProducts.length === 0) {
      console.log('📝 No products found. Creating sample products...');
      
      // Create a sample category first
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

      // Create sample products with different brand types
      const sampleProducts = [
        {
          name: 'BA Sports Pro Basketball',
          description: 'Professional basketball for competitive play',
          price: 89.99,
          originalPrice: 99.99,
          image: '/BA-SportsLogo.png',
          images: JSON.stringify(['/BA-SportsLogo.png']),
          categoryId: category.id,
          stock: 50,
          isActive: true,
          isFeatured: true,
          rating: 4.8,
          reviewCount: 25,
          tags: JSON.stringify(['basketball', 'professional', 'competition']),
          brandType: 'BA_SPORTS'
        },
        {
          name: 'BA Sports Training Football',
          description: 'Durable football for training sessions',
          price: 45.99,
          originalPrice: 55.99,
          image: '/BA-SportsLogo.png',
          images: JSON.stringify(['/BA-SportsLogo.png']),
          categoryId: category.id,
          stock: 30,
          isActive: true,
          isFeatured: false,
          rating: 4.5,
          reviewCount: 18,
          tags: JSON.stringify(['football', 'training', 'durable']),
          brandType: 'BA_SPORTS'
        },
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
        await prisma.product.create({
          data: productData
        });
      }

      console.log('✅ Created 4 sample products (2 BA Sports, 2 Other Brands)');
    } else {
      console.log('🔄 Updating existing products with brandType...');
      
      // Update existing products to have BA_SPORTS as default brandType
      const updateResult = await prisma.product.updateMany({
        where: {
          brandType: null
        },
        data: {
          brandType: 'BA_SPORTS'
        }
      });

      console.log(`✅ Updated ${updateResult.count} products with BA_SPORTS brandType`);
    }

    // Test the brand filtering
    console.log('\n🔍 Testing brand filtering...');
    const baSportsProducts = await prisma.product.findMany({
      where: { brandType: 'BA_SPORTS', isActive: true },
      select: { id: true, name: true, brandType: true }
    });

    const otherBrandsProducts = await prisma.product.findMany({
      where: { brandType: 'OTHER', isActive: true },
      select: { id: true, name: true, brandType: true }
    });

    console.log(`✅ BA Sports products: ${baSportsProducts.length}`);
    baSportsProducts.forEach(p => console.log(`  - ${p.name}`));
    
    console.log(`✅ Other brands products: ${otherBrandsProducts.length}`);
    otherBrandsProducts.forEach(p => console.log(`  - ${p.name}`));

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // If the brandType column doesn't exist, we need to add it manually
    if (error.message.includes('brandType') && error.message.includes('does not exist')) {
      console.log('\n⚠️  The brandType column needs to be added to the database.');
      console.log('Please run: npx prisma migrate dev --name add-brand-type');
    }
  } finally {
    await prisma.$disconnect();
  }
}

updateProductsBrand();
