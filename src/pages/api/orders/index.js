// FIXED: Added Node.js runtime for Prisma compatibility
export const config = {
  runtime: 'nodejs',
};

import prisma, { generateOrderNumber } from '../../../lib/prisma';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getOrders(req, res);
    case 'POST':
      return createOrder(req, res);
    case 'PUT':
      return updateOrder(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

// GET /api/orders - Get orders (with filtering)
async function getOrders(req, res) {
  try {
    console.log('=== API ORDERS DEBUG ===');
    console.log('Query parameters:', req.query);
    
    const { 
      userId, 
      status, 
      page = 1, 
      limit = 20,
      email 
    } = req.query;

    console.log('Extracted userId:', userId);
    console.log('Extracted status:', status);
    console.log('Extracted email:', email);

    // Build where clause
    const where = {};

    if (userId) {
      where.userId = userId;
      console.log('Added userId to where clause:', userId);
    }

    if (status) {
      where.status = status;
      console.log('Added status to where clause:', status);
    }

    if (email) {
      where.customerEmail = email;
      console.log('Added email to where clause:', email);
    }

    // If no userId provided but email is available, search by email as fallback
    if (!userId && email) {
      where.customerEmail = email;
      console.log('No userId provided, searching by email as fallback:', email);
    }

    console.log('Final where clause:', where);

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    console.log('Pagination - skip:', skip, 'take:', take);

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take
    });

    console.log('Orders found:', orders.length);
    console.log('Orders data:', orders);

    // Get total count for pagination
    const total = await prisma.order.count({ where });
    console.log('Total orders count:', total);

    const response = {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };

    console.log('Sending response:', response);
    return res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

// POST /api/orders - Create a new order
async function createOrder(req, res) {
  try {
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZipCode,
      shippingCountry = 'Pakistan',
      billingAddress,
      billingCity,
      billingState,
      billingZipCode,
      billingCountry,
      items,
      subtotal,
      tax = 0,
      shipping = 0,
      codFee = 0,
      discount = 0,
      total,
      paymentMethod = 'COD',
      notes
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !shippingAddress || !items || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate stock availability for all items
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { stock: true, name: true }
      });
      
      if (!product) {
        return res.status(400).json({ error: `Product with ID ${item.productId} not found` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZipCode,
        shippingCountry,
        billingAddress,
        billingCity,
        billingState,
        billingZipCode,
        billingCountry,
        subtotal: parseFloat(subtotal),
        tax: 0,
        shipping: parseFloat(shipping),
        codFee: 0,
        discount: parseFloat(discount),
        total: parseFloat(total),
        paymentMethod,
        notes,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat(item.price),
            total: parseFloat(item.total)
          }))
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      }
    });

    // Update stock quantities for all ordered items
    for (const item of items) {
      try {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
        console.log(`✅ Stock updated for product ${item.productId}: -${item.quantity}`);
      } catch (error) {
        console.error(`❌ Failed to update stock for product ${item.productId}:`, error);
        // Continue with other products even if one fails
      }
    }

    // Create payment record for COD
    if (paymentMethod === 'COD') {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: parseFloat(total),
          method: 'COD',
          status: 'PENDING'
        }
      });
    }



    return res.status(201).json({ 
      order,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
}

// PUT /api/orders - Update order status (including cancellation)
async function updateOrder(req, res) {
  try {
    const { orderId } = req.query;
    const { status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ error: 'Order ID and status are required' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // If order is being cancelled, restore stock quantities
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        try {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          });
          console.log(`✅ Stock restored for product ${item.productId}: +${item.quantity}`);
        } catch (error) {
          console.error(`❌ Failed to restore stock for product ${item.productId}:`, error);
        }
      }
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true }
    });



    return res.status(200).json({ 
      order: updatedOrder,
      message: `Order ${status} successfully`
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ error: 'Failed to update order' });
  }
}



