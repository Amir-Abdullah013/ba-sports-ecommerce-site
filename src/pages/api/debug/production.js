// PRODUCTION DEBUG API - Remove after deployment is working
export const config = {
  runtime: 'nodejs',
};

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (process.env.NODE_ENV !== 'production') {
    return res.status(404).json({ error: 'Debug API only available in production' });
  }

  try {
    // Check environment variables
    const envCheck = {
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      vercelUrl: process.env.VERCEL_URL
    };

    // Check database connection
    let dbStatus = 'disconnected';
    let dbError = null;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (error) {
      dbError = error.message;
    }

    // Check session
    let sessionStatus = 'no-session';
    let sessionData = null;
    try {
      const session = await getServerSession(req, res, authOptions);
      if (session) {
        sessionStatus = 'authenticated';
        sessionData = {
          email: session.user?.email,
          role: session.user?.role,
          isAdmin: session.user?.email === 'amirabdullah2508@gmail.com'
        };
      }
    } catch (error) {
      sessionStatus = 'error';
      sessionData = error.message;
    }

    // Check admin user in database
    let adminUserStatus = 'not-found';
    try {
      const adminUser = await prisma.user.findUnique({
        where: { email: 'amirabdullah2508@gmail.com' },
        select: { email: true, role: true, id: true }
      });
      adminUserStatus = adminUser ? 'found' : 'not-found';
    } catch (error) {
      adminUserStatus = 'error';
    }

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: {
        status: dbStatus,
        error: dbError
      },
      session: {
        status: sessionStatus,
        data: sessionData
      },
      adminUser: adminUserStatus,
      recommendations: [
        !envCheck.hasNextAuthUrl && 'Set NEXTAUTH_URL environment variable',
        !envCheck.hasNextAuthSecret && 'Set NEXTAUTH_SECRET environment variable',
        !envCheck.hasGoogleClientId && 'Set GOOGLE_CLIENT_ID environment variable',
        !envCheck.hasGoogleClientSecret && 'Set GOOGLE_CLIENT_SECRET environment variable',
        !envCheck.hasDatabaseUrl && 'Set DATABASE_URL environment variable',
        dbStatus !== 'connected' && 'Fix database connection',
        adminUserStatus !== 'found' && 'Create admin user in database'
      ].filter(Boolean)
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Debug API error',
      message: error.message,
      stack: error.stack
    });
  }
}
