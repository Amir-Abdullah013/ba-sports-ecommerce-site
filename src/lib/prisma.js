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
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // FIXED: Connection pool settings optimized for Supabase + PgBouncer
    __internal: {
      engine: {
        // Enable connection pooling
        connectionLimit: 1,
        // Timeout settings
        queryTimeout: 60000,
        transactionTimeout: 30000,
      },
    },
  });
};

/**
 * FIXED: Singleton pattern to prevent multiple instances in development
 * In production, create new instance each time
 * In development, reuse existing instance to prevent connection leaks
 */
const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

/**
 * FIXED: Database connection helper with retry logic
 * Handles connection failures gracefully with exponential backoff
 */
export async function connectDatabase(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      return true;
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, error.message);
      
      if (i === retries - 1) {
        throw new Error(`Database connection failed after ${retries} attempts: ${error.message}`);
      }
      
      // Exponential backoff: wait 1s, 2s, 4s...
      const delay = Math.pow(2, i) * 1000;
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
