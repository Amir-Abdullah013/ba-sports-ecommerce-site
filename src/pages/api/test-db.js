// Simple database test API
import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let prisma;
  
  try {
    // Create a simple Prisma client without complex configurations
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.NEXT_PUBLIC_DATABASE_URL,
        },
      },
    });

    console.log('🔍 Testing database connection...');
    
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    console.log('✅ Database connection successful');

    // Try to get product count
    const productCount = await prisma.product.count();
    
    console.log(`✅ Found ${productCount} products in database`);

    return res.status(200).json({
      success: true,
      message: 'Database connection successful',
      productCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

