const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAnalytics() {
  try {
    console.log('🔍 Testing analytics calculations...');
    
    // Test basic counts
    const orderCount = await prisma.order.count();
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count({ where: { isActive: true } });
    
    console.log('📊 Basic counts:');
    console.log('  Orders:', orderCount);
    console.log('  Users:', userCount);
    console.log('  Active Products:', productCount);
    
    // Test revenue calculations
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true }
    });
    
    const completedRevenue = await prisma.order.aggregate({
      where: { paymentStatus: 'COMPLETED' },
      _sum: { total: true }
    });
    
    console.log('💰 Revenue calculations:');
    console.log('  Total Revenue:', totalRevenue._sum.total);
    console.log('  Completed Revenue:', completedRevenue._sum.total);
    
    // Test if there are any orders with actual data
    const sampleOrders = await prisma.order.findMany({
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('📋 Sample orders:');
    sampleOrders.forEach(order => {
      console.log(`  Order ${order.orderNumber}: $${order.total} (${order.status}/${order.paymentStatus})`);
    });
    
    // Test monthly revenue query
    const now = new Date();
    const monthlyData = await prisma.$queryRaw`
      SELECT 
        EXTRACT(YEAR FROM "createdAt") as year,
        EXTRACT(MONTH FROM "createdAt") as month,
        SUM(total) as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE "createdAt" >= ${new Date(now.getFullYear() - 1, now.getMonth(), 1)}
      GROUP BY EXTRACT(YEAR FROM "createdAt"), EXTRACT(MONTH FROM "createdAt")
      ORDER BY year, month
    `;
    
    console.log('📅 Monthly revenue data:');
    console.log(monthlyData);
    
    // Test top products query
    const topProducts = await prisma.$queryRaw`
      SELECT 
        p.id,
        p.name,
        p.price,
        c.name as category_name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.total) as total_revenue
      FROM products p
      LEFT JOIN "order_items" oi ON p.id = oi."productId"
      LEFT JOIN categories c ON p."categoryId" = c.id
      WHERE p."isActive" = true
      GROUP BY p.id, p.name, p.price, c.name
      ORDER BY total_sold DESC NULLS LAST
      LIMIT 5
    `;
    
    console.log('🏆 Top products:');
    console.log(topProducts);
    
  } catch (error) {
    console.error('❌ Error testing analytics:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAnalytics();
