// Script to add BrandType enum and brandType column to Vercel database
// This will fix the "type public.BrandType does not exist" error

const { PrismaClient } = require('@prisma/client');

async function addBrandTypeToDatabase() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.NEXT_PUBLIC_DATABASE_URL,
      },
    },
  });

  try {
    console.log('🔧 Adding BrandType enum and brandType column to database...');

    // Step 1: Create the BrandType enum
    console.log('📝 Creating BrandType enum...');
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "public"."BrandType" AS ENUM ('BA_SPORTS', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Step 2: Add brandType column to products table
    console.log('📝 Adding brandType column to products table...');
    await prisma.$executeRaw`
      ALTER TABLE "public"."products" 
      ADD COLUMN IF NOT EXISTS "brandType" "public"."BrandType" DEFAULT 'BA_SPORTS';
    `;

    // Step 3: Update existing products to have BA_SPORTS as default
    console.log('📝 Updating existing products with default brand type...');
    await prisma.$executeRaw`
      UPDATE "public"."products" 
      SET "brandType" = 'BA_SPORTS' 
      WHERE "brandType" IS NULL;
    `;

    // Step 4: Create indexes for better performance
    console.log('📝 Creating indexes for brandType...');
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "products_brandType_idx" ON "public"."products"("brandType");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "products_brandType_isActive_idx" ON "public"."products"("brandType", "isActive");
    `;

    console.log('✅ Successfully added BrandType enum and brandType column!');
    console.log('🎯 Brand filtering should now work properly.');

    // Test the setup
    const productCount = await prisma.product.count();
    console.log(`📊 Total products in database: ${productCount}`);

    const baSportsCount = await prisma.product.count({
      where: { brandType: 'BA_SPORTS' }
    });
    console.log(`🏷️ BA Sports products: ${baSportsCount}`);

    const otherCount = await prisma.product.count({
      where: { brandType: 'OTHER' }
    });
    console.log(`🏷️ Other brand products: ${otherCount}`);

  } catch (error) {
    console.error('❌ Error adding BrandType to database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  addBrandTypeToDatabase()
    .then(() => {
      console.log('🎉 Database migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addBrandTypeToDatabase;
