/**
 * FIXED: Simplified database utilities using singleton Prisma client
 * 
 * This file now imports the singleton Prisma client and provides
 * utility functions without complex proxy patterns that caused issues.
 */

import prisma, { 
  connectDatabase, 
  disconnectDatabase, 
  checkDatabaseHealth,
  UserRole,
  OrderStatus,
  PaymentStatus,
  PaymentMethod
} from './prisma.js';

// FIXED: Export singleton Prisma client instead of complex proxy
export default prisma;

// Re-export all enums for backward compatibility
export {
  UserRole,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  connectDatabase,
  disconnectDatabase,
  checkDatabaseHealth
};

/**
 * FIXED: Simplified database initialization without complex error handling
 * Let Prisma handle connection management naturally
 */
export async function initializeDatabase() {
  try {
    await connectDatabase();
    
    // Create default admin user if not exists
    const adminExists = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: 'admin@basports.com' },
          { email: 'amirabdullah2508@gmail.com' }
        ]
      }
    });
    
    if (!adminExists) {
      await prisma.user.create({
        data: {
          email: 'amirabdullah2508@gmail.com',
          name: 'Admin User',
          role: UserRole.ADMIN,
          emailVerified: new Date()
        }
      });
      console.log('✅ Default admin user created');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

/**
 * FIXED: Simple cleanup function
 */
export async function cleanupDatabase() {
  await disconnectDatabase();
}

/**
 * FIXED: Utility function for generating order numbers
 */
export async function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BA-${year}${month}${day}-${random}`;
}