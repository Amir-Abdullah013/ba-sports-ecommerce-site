/**
 * PRODUCTION-READY: Admin Analytics API
 * 
 * Returns real database analytics data for dashboard
 * - No mock data, only live database queries
 * - Optimized for performance with selective queries
 * - Proper error handling and fallbacks
 */

// FIXED: Node.js runtime for Prisma compatibility
export const config = {
  runtime: 'nodejs',
};

import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check admin access
    const isAdminEmail = session.user.email === 'amirabdullah2508@gmail.com';
    if (!isAdminEmail) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      });
      
      if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
      }
    }

    // Get date ranges for analytics
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Execute all analytics queries in parallel for performance
    const [
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      monthlyData,
      topProducts,
      recentOrders,
      userGrowthData,
      previousMonthRevenue,
      previousMonthOrders
    ] = await Promise.all([
      // Total revenue from all completed orders
      prisma.order.aggregate({
        where: {
          paymentStatus: 'COMPLETED'
        },
        _sum: { total: true }
      }),

      // Total orders count
      prisma.order.count(),

      // Total users (excluding admins)
      prisma.user.count({
        where: {
          role: { not: 'ADMIN' }
        }
      }),

      // Total active products
      prisma.product.count({
        where: { isActive: true }
      }),

      // Monthly revenue for the last 12 months
      prisma.$queryRaw`
        SELECT 
          EXTRACT(YEAR FROM "createdAt") as year,
          EXTRACT(MONTH FROM "createdAt") as month,
          SUM(total) as revenue,
          COUNT(*) as orders
        FROM orders 
        WHERE "createdAt" >= ${new Date(now.getFullYear() - 1, now.getMonth(), 1)}
          AND "paymentStatus" = 'COMPLETED'
        GROUP BY EXTRACT(YEAR FROM "createdAt"), EXTRACT(MONTH FROM "createdAt")
        ORDER BY year, month
      `,

      // Top 5 products by order quantity
      prisma.$queryRaw`
        SELECT 
          p.id,
          p.name,
          p.price,
          p.image,
          c.name as category_name,
          SUM(oi.quantity) as total_sold,
          SUM(oi.total) as total_revenue
        FROM products p
        LEFT JOIN "order_items" oi ON p.id = oi."productId"
        LEFT JOIN categories c ON p."categoryId" = c.id
        WHERE p."isActive" = true
        GROUP BY p.id, p.name, p.price, p.image, c.name
        ORDER BY total_sold DESC NULLS LAST
        LIMIT 5
      `,

      // Recent 10 orders
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerEmail: true,
          total: true,
          status: true,
          paymentStatus: true,
          createdAt: true
        }
      }),

      // User growth by month for last 12 months
      prisma.$queryRaw`
        SELECT 
          EXTRACT(YEAR FROM "createdAt") as year,
          EXTRACT(MONTH FROM "createdAt") as month,
          COUNT(*) as new_users
        FROM users 
        WHERE "createdAt" >= ${new Date(now.getFullYear() - 1, now.getMonth(), 1)}
          AND role != 'ADMIN'
        GROUP BY EXTRACT(YEAR FROM "createdAt"), EXTRACT(MONTH FROM "createdAt")
        ORDER BY year, month
      `,

      // Previous month revenue for comparison
      prisma.order.aggregate({
        where: {
          paymentStatus: 'COMPLETED',
          createdAt: {
            gte: lastMonth,
            lt: currentMonth
          }
        },
        _sum: { total: true }
      }),

      // Previous month orders for comparison
      prisma.order.count({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: currentMonth
          }
        }
      })
    ]);

    // Process monthly data for the last 12 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthData = monthlyData.find(m => 
        parseInt(m.year) === date.getFullYear() && 
        parseInt(m.month) === date.getMonth() + 1
      );
      
      monthlyRevenue.push({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        revenue: monthData ? parseFloat(monthData.revenue) || 0 : 0,
        orders: monthData ? parseInt(monthData.orders) || 0 : 0
      });
    }

    // Process user growth data
    const userGrowth = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const growthData = userGrowthData.find(u => 
        parseInt(u.year) === date.getFullYear() && 
        parseInt(u.month) === date.getMonth() + 1
      );
      
      userGrowth.push({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        users: growthData ? parseInt(growthData.new_users) || 0 : 0
      });
    }

    // Process top products
    const processedTopProducts = topProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image,
      category: product.category_name || 'Uncategorized',
      totalSold: parseInt(product.total_sold) || 0,
      totalRevenue: parseFloat(product.total_revenue) || 0
    }));

    // Calculate growth percentages
    const currentRevenue = parseFloat(totalRevenue._sum.total) || 0;
    const prevRevenue = parseFloat(previousMonthRevenue._sum.total) || 0;
    const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue * 100) : 0;

    const currentOrderCount = totalOrders;
    const prevOrderCount = previousMonthOrders;
    const ordersGrowth = prevOrderCount > 0 ? ((currentOrderCount - prevOrderCount) / prevOrderCount * 100) : 0;

    const analytics = {
      // Main stats
      totalRevenue: currentRevenue,
      totalOrders: currentOrderCount,
      totalUsers: totalUsers,
      totalProducts: totalProducts,

      // Growth percentages
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      ordersGrowth: Math.round(ordersGrowth * 10) / 10,
      usersGrowth: 0, // Will be calculated when we have historical data
      productsGrowth: 0, // Will be calculated when we have historical data

      // Charts data
      monthlyRevenue,
      topProducts: processedTopProducts,
      recentOrders,
      userGrowth,

      // Metadata
      lastUpdated: new Date().toISOString(),
      dataSource: 'live_database'
    };

    console.log(`✅ Analytics loaded: ${totalOrders} orders, $${currentRevenue} revenue`);

    return res.status(200).json(analytics);

  } catch (error) {
    console.error('❌ Analytics API error:', error);
    
    // Return basic fallback analytics if database fails
    return res.status(200).json({
      totalRevenue: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalProducts: 0,
      revenueGrowth: 0,
      ordersGrowth: 0,
      usersGrowth: 0,
      productsGrowth: 0,
      monthlyRevenue: [],
      topProducts: [],
      recentOrders: [],
      userGrowth: [],
      error: 'Analytics temporarily unavailable',
      dataSource: 'fallback'
    });
  }
}
