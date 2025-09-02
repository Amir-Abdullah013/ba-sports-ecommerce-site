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

    // Simplified admin check for production reliability
    const isAdminEmail = session.user.email === 'amirabdullah2508@gmail.com';
    
    if (isAdminEmail) {
      console.log('✅ Admin access granted via email:', session.user.email);
    } else {
      // Try to check user role in database but don't fail if DB is down
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { role: true }
        });
        
        if (!user || user.role !== 'ADMIN') {
          console.log('❌ Admin access denied for:', session.user.email);
          return res.status(403).json({ error: 'Admin access required' });
        }
        
        console.log('✅ Admin access granted via role for:', session.user.email);
      } catch (dbError) {
        console.error('❌ Database error during admin check:', dbError);
        return res.status(503).json({ 
          error: 'Database connection failed. Please try again later.',
          details: 'Unable to verify admin status'
        });
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
    
    if (status && status !== 'all' && status !== 'All') {
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
      
      // Test the count query separately first
      console.log('🔍 Testing count query with where clause:', where);
      const testCount = await prisma.order.count({ where });
      console.log('🔍 Test count result:', testCount);
      
      // Also test total count without filters
      const totalCountNoFilter = await prisma.order.count();
      console.log('🔍 Total orders in database (no filters):', totalCountNoFilter);
      
      // If we have filters applied and the count is 0, but we have orders, 
      // we might need to get the total count differently
      if (Object.keys(where).length > 0 && testCount === 0 && totalCountNoFilter > 0) {
        console.log('⚠️ Filtered count is 0 but total orders exist, this might indicate a filter issue');
      }
      
      // Simplified query for better reliability
      [orders, total] = await Promise.all([
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
            }
          }
        }),
        prisma.order.count({ where })
      ]);
      
      console.log('📊 Orders fetched successfully:', orders.length, 'Total:', total);
      
    } catch (dbError) {
      console.error('❌ Database error in getOrders:', dbError);
      
      // Return empty result with error message for better UX
      return res.status(200).json({
        orders: [],
        total: 0,
        totalCount: 0, // Add totalCount for frontend compatibility
        currentPage: parseInt(page),
        totalPages: 0,
        error: 'Database temporarily unavailable. Please refresh the page.',
        timestamp: new Date().toISOString()
      });
    }

    console.log('getOrders - Found orders:', orders.length, 'Total:', total);
    console.log('getOrders - Response data:', { 
      ordersCount: orders.length, 
      totalCount: total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    // Simplified data transformation for better reliability
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      status: order.status,
      paymentStatus: order.paymentStatus || 'PENDING',
      paymentMethod: order.paymentMethod || 'COD',
      total: parseFloat(order.total || 0),
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingState: order.shippingState,
      shippingCountry: order.shippingCountry || 'Pakistan',
      createdAt: order.createdAt,
      user: order.user,
      items: order.items || [],
      itemCount: order.items?.length || 0
    }));

    // Ensure totalCount is never 0 if we have orders
    // If the count query returned 0 but we have orders, use the orders length
    // This handles cases where the count query might fail but the findMany works
    let finalTotalCount = total;
    if (total === 0 && transformedOrders.length > 0) {
      console.log('⚠️ Count query returned 0 but orders exist, using orders.length as fallback');
      finalTotalCount = transformedOrders.length;
    }
    
    // If we're on the first page with no filters and still getting 0, 
    // try to get the actual total count from the database
    if (finalTotalCount === 0 && parseInt(page) === 1 && Object.keys(where).length === 0) {
      console.log('🔍 No filters applied and count is 0, getting total count from database');
      try {
        const actualTotal = await prisma.order.count();
        if (actualTotal > 0) {
          console.log('🔍 Found actual total count:', actualTotal);
          finalTotalCount = actualTotal;
        }
      } catch (countError) {
        console.error('❌ Error getting total count:', countError);
      }
    }
    
    const responseData = {
      orders: transformedOrders,
      total: finalTotalCount,
      totalCount: finalTotalCount, // Ensure totalCount is properly set
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(finalTotalCount / parseInt(limit))
    };

    console.log('getOrders - Final response:', responseData);
    return res.status(200).json(responseData);
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









