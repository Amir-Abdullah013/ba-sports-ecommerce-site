// FIXED: Added Node.js runtime for Prisma compatibility
export const config = {
  runtime: 'nodejs',
};

import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

export default async function handler(req, res) {
  try {
    console.log('🔍 Admin orders API called:', req.method, req.url);
    
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      console.log('❌ No session found');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('✅ Session found for user:', session.user.email);

    // Check if user is admin - with fallback for specific admin email
    const isAdminEmail = session.user.email === 'amirabdullah2508@gmail.com';
    
    if (isAdminEmail) {
      console.log('✅ Admin access granted via email:', session.user.email);
    } else {
      // Try to check user role in database with timeout
      let user;
      try {
        console.log('🔍 Checking user role in database...');
        
        // Add timeout to database connection
        const dbTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        );
        
        const userQuery = prisma.user.findUnique({
          where: { email: session.user.email }
        });
        
        user = await Promise.race([userQuery, dbTimeout]);
        console.log('📊 User found in DB:', user ? `${user.email} (${user.role})` : 'Not found');
      } catch (dbError) {
        console.error('❌ Database connection error:', dbError);
        
        // If database is unreachable but user has admin email, allow access
        if (isAdminEmail) {
          console.log('🔧 Database down but admin email detected, allowing access');
        } else {
          return res.status(503).json({ 
            error: 'Database connection failed. Please try again later.',
            details: dbError.message 
          });
        }
      }

      if (!isAdminEmail && (!user || user.role !== 'ADMIN')) {
        console.log('❌ Admin access denied for:', session.user.email);
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      if (user) {
        console.log('✅ Admin access granted via role for:', user.email);
      }
    }

    switch (req.method) {
      case 'GET':
        return await getOrders(req, res);
      case 'PUT':
        return await updateOrder(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin orders API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getOrders(req, res) {
  try {
    console.log('getOrders called with query:', req.query);
    
    const { 
      search, 
      status, 
      paymentStatus, 
      page = 1, 
      limit = 20,
      startDate,
      endDate
    } = req.query;
    
    const where = {};
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status && status !== 'All') {
      where.status = status;
    }

    if (paymentStatus && paymentStatus !== 'All') {
      where.paymentStatus = paymentStatus;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    console.log('📊 Query parameters:', { where, skip, limit: parseInt(limit) });
    
    let orders, total;
    try {
      console.log('🔗 Connecting to database for orders...');
      
      // Add timeout to database queries
      const queryTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 10000)
      );
      
      const ordersQuery = Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    price: true
                  }
                }
              }
            },
            payment: {
              select: {
                id: true,
                status: true,
                method: true,
                transactionId: true
              }
            },
            _count: {
              select: {
                items: true
              }
            }
          }
        }),
        prisma.order.count({ where })
      ]);
      
      [orders, total] = await Promise.race([ordersQuery, queryTimeout]);
      console.log('📊 Orders fetched successfully:', orders.length, 'Total:', total);
      
    } catch (dbError) {
      console.error('❌ Database error in getOrders:', dbError);
      
      // Return empty result instead of error for better UX
      return res.status(200).json({
        orders: [],
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 0,
        error: 'Database temporarily unavailable. Please refresh the page.',
        timestamp: new Date().toISOString()
      });
    }

    console.log('getOrders - Found orders:', orders.length, 'Total:', total);

    // Transform data to match frontend expectations
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal.toString(),
      tax: order.tax.toString(),
      shipping: order.shipping.toString(),
      codFee: order.codFee.toString(),
      discount: order.discount.toString(),
      total: order.total.toString(),
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingState: order.shippingState,
      shippingZipCode: order.shippingZipCode,
      shippingCountry: order.shippingCountry,
      estimatedDelivery: order.estimatedDelivery,
      actualDelivery: order.actualDelivery,
      trackingNumber: order.trackingNumber,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: order.user,
      items: order.items.map(item => ({
        id: item.id,
        product: item.product,
        quantity: item.quantity,
        price: item.price.toString(),
        total: item.total.toString()
      })),
      payment: order.payment,
      itemCount: order._count.items
    }));

    return res.status(200).json({
      orders: transformedOrders,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

async function updateOrder(req, res) {
  try {
    console.log('Update order request:', { query: req.query, body: req.body });
    
    const { id } = req.query;
    const {
      status,
      paymentStatus,
      estimatedDelivery,
      actualDelivery,
      trackingNumber,
      notes
    } = req.body;

    if (!id) {
      console.error('Missing order ID');
      return res.status(400).json({ error: 'Order ID is required' });
    }

    console.log('Updating order:', { id, status, paymentStatus });

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (estimatedDelivery !== undefined) updateData.estimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : null;
    if (actualDelivery !== undefined) updateData.actualDelivery = actualDelivery ? new Date(actualDelivery) : null;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (notes !== undefined) updateData.notes = notes;

    console.log('Update data:', updateData);

    console.log('Executing database update for order:', id);
    
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true
              }
            }
          }
        },
        payment: {
          select: {
            id: true,
            status: true,
            method: true,
            transactionId: true
          }
        }
      }
    });

    console.log('Order updated successfully:', order.id);

    // If payment status is updated, also update the payment record
    if (paymentStatus !== undefined && order.payment) {
      await prisma.payment.update({
        where: { orderId: id },
        data: { status: paymentStatus }
      });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ error: 'Failed to update order' });
  }
}









