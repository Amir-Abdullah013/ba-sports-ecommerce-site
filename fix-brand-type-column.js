// Script to fix the brandType column type in Vercel database
// The column was created as TEXT but needs to be BrandType enum

const { PrismaClient } = require('@prisma/client');

async function fixBrandTypeColumn() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.NEXT_PUBLIC_DATABASE_URL,
      },
    },
  });

  try {
    console.log('🔧 Fixing brandType column type...');

    // Step 1: Update existing data to use proper enum values
    console.log('📝 Updating existing brandType values...');
    await prisma.$executeRaw`
      UPDATE "public"."products" 
      SET "brandType" = 'BA_SPORTS' 
      WHERE "brandType" IS NULL OR "brandType" = '';
    `;

    // Step 2: Drop the existing column
    console.log('📝 Dropping existing brandType column...');
    await prisma.$executeRaw`
      ALTER TABLE "public"."products" DROP COLUMN IF EXISTS "brandType";
    `;

    // Step 3: Add the column with correct BrandType enum type
    console.log('📝 Adding brandType column with correct enum type...');
    await prisma.$executeRaw`
      ALTER TABLE "public"."products" 
      ADD COLUMN "brandType" "public"."BrandType" DEFAULT 'BA_SPORTS';
    `;

    // Step 4: Recreate indexes
    console.log('📝 Recreating indexes...');
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "products_brandType_idx" ON "public"."products"("brandType");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "products_brandType_isActive_idx" ON "public"."products"("brandType", "isActive");
    `;

    console.log('✅ Successfully fixed brandType column!');

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
    console.error('❌ Error fixing brandType column:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  fixBrandTypeColumn()
    .then(() => {
      console.log('🎉 BrandType column fix completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fix failed:', error);
      process.exit(1);
    });
}

module.exports = fixBrandTypeColumn;
