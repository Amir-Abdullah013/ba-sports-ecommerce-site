/**
 * DEBUG API - Check Environment Variables Status
 * 
 * This endpoint helps diagnose environment variable issues in production
 * REMOVE THIS FILE AFTER DEBUGGING
 */

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NEXT_PUBLIC_NODE_ENV,
      vercelUrl: process.env.VERCEL_URL,
      
      // Check if environment variables exist (without exposing values)
      environmentVariables: {
        NEXT_PUBLIC_DATABASE_URL: !!process.env.NEXT_PUBLIC_DATABASE_URL,
        NEXT_PUBLIC_NEXTAUTH_SECRET: !!process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
        NEXT_PUBLIC_NEXTAUTH_URL: !!process.env.NEXT_PUBLIC_NEXTAUTH_URL,
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        NEXT_PUBLIC_GOOGLE_CLIENT_SECRET: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
        
        // Check old variables (should be false)
        OLD_NEXT_PUBLIC_DATABASE_URL: !!process.env.NEXT_PUBLIC_DATABASE_URL,
        OLD_NEXT_PUBLIC_NEXTAUTH_SECRET: !!process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
      },
      
      // Database connection test
      databaseStatus: 'not_tested'
    };

    // Test database connection
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.NEXT_PUBLIC_DATABASE_URL,
          },
        },
      });
      
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      
      diagnostics.databaseStatus = 'connected';
    } catch (dbError) {
      diagnostics.databaseStatus = 'failed';
      diagnostics.databaseError = dbError.message;
    }

    return res.status(200).json({
      status: 'success',
      message: 'Environment diagnostics completed',
      data: diagnostics
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to run diagnostics',
      error: error.message,
      stack: process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
