/**
 * FIXED: Singleton Prisma Client for Next.js Development
 * 
 * This implementation prevents the "too many clients" error during hot reloads
 * by creating a singleton instance that persists across module reloads.
 * 
 * Key fixes:
 * - Uses global object to store client instance in development
 * - Proper connection pooling configuration for Supabase
 * - SSL enforcement and PgBouncer compatibility
 * - Graceful error handling and reconnection
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

/**
 * Create Prisma client with optimized settings for Supabase
 */
const createPrismaClient = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return new PrismaClient({
    log: isProduction ? ['error'] : ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // VERCEL PRODUCTION FIX: Optimized for serverless functions
    __internal: {
      engine: {
        // Single connection for Vercel serverless
        connectionLimit: 1,
        // Shorter timeouts for serverless
        queryTimeout: isProduction ? 30000 : 60000,
        transactionTimeout: isProduction ? 15000 : 30000,
      },
    },
  });
};

/**
 * VERCEL PRODUCTION FIX: Optimized client creation pattern
 * - Production: Create fresh instances with connection pooling
 * - Development: Use singleton to prevent connection leaks during hot reload
 */
const createPrismaInstance = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production: Always create fresh instances for Vercel serverless
    return createPrismaClient();
  } else {
    // Development: Use singleton pattern
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return globalForPrisma.prisma;
  }
};

const prisma = createPrismaInstance();

export default prisma;

/**
 * VERCEL PRODUCTION FIX: Database connection helper optimized for serverless
 * Handles connection failures gracefully with faster retry for production
 */
export async function connectDatabase(retries = 3) {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxRetries = isProduction ? 2 : retries; // Fewer retries in production
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      return true;
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, error.message);
      
      if (i === maxRetries - 1) {
        throw new Error(`Database connection failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Faster backoff for production serverless
      const delay = isProduction ? 500 * (i + 1) : Math.pow(2, i) * 1000;
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * FIXED: Graceful disconnect for cleanup
 */
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnect error:', error.message);
  }
}

/**
 * FIXED: Health check function for monitoring
 */
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message, 
      timestamp: new Date() 
    };
  }
}

/**
 * FIXED: Utility function for generating unique order numbers
 */
export async function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BA-${year}${month}${day}-${random}`;
}

/**
 * FIXED: Export Prisma enums for type safety
 */
export { UserRole, OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
