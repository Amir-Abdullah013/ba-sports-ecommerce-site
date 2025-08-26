/**
 * PRODUCTION DEBUG: Health Check API
 * Use this to diagnose production issues on Vercel
 */

export const config = {
  runtime: 'nodejs',
};

import prisma, { checkDatabaseHealth } from '../../../lib/prisma';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const healthCheck = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: {
      url: process.env.VERCEL_URL,
      region: process.env.VERCEL_REGION,
    },
    nextAuth: {
      url: process.env.NEXTAUTH_URL,
      hasSecret: !!process.env.NEXTAUTH_SECRET,
      trustHost: process.env.NEXTAUTH_TRUST_HOST,
    },
    google: {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      clientIdFormat: process.env.GOOGLE_CLIENT_ID ? 
        process.env.GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com') : false,
    },
    database: {
      hasUrl: !!process.env.DATABASE_URL,
      urlPattern: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.includes('pooler.supabase.com') : false,
      hasPgBouncer: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.includes('pgbouncer=true') : false,
      hasConnectionLimit: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.includes('connection_limit=1') : false,
      hasSSL: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.includes('sslmode=require') : false,
    }
  };

  // Test database connection
  try {
    const dbHealth = await checkDatabaseHealth();
    healthCheck.database.connection = dbHealth;
    
    // Test a simple query
    const productCount = await prisma.product.count();
    healthCheck.database.productCount = productCount;
    
    const categoryCount = await prisma.category.count();
    healthCheck.database.categoryCount = categoryCount;
    
  } catch (error) {
    healthCheck.database.connection = {
      status: 'error',
      error: error.message
    };
  }

  // Determine overall health status
  const isHealthy = 
    healthCheck.nextAuth.hasSecret &&
    healthCheck.google.hasClientId &&
    healthCheck.google.hasClientSecret &&
    healthCheck.google.clientIdFormat &&
    healthCheck.database.hasUrl &&
    healthCheck.database.urlPattern &&
    healthCheck.database.hasPgBouncer &&
    healthCheck.database.connection?.status === 'healthy';

  const statusCode = isHealthy ? 200 : 503;
  
  return res.status(statusCode).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    ...healthCheck
  });
}
