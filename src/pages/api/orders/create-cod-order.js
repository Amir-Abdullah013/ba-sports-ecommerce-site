/**
 * PRODUCTION-READY: Cash on Delivery Order Creation API
 * 
 * Fixed Issues:
 * - Correct field mapping between frontend and database schema
 * - Proper error handling with detailed messages
 * - Stock validation and updates
 * - Order number generation
 * - Database transaction for data integrity
 */

// FIXED: Node.js runtime for Prisma compatibility
export const config = {
  runtime: 'nodejs',
};

import prisma, { generateOrderNumber } from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Use POST.' 
    });
  }

  console.log('🔍 COD Order Creation Request:', {
    method: req.method,
    body: req.body
  });

  try {
    const {
      orderId, // Frontend generated order ID
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZipCode,
      items,
      total
    } = req.body;

    console.log('📝 Parsed order data:', {
      customerName,
      customerEmail,
      customerPhone,
      itemsCount: items?.length,
      total
    });

    // FIXED: Comprehensive validation with specific error messages
    const validationErrors = [];
    
    if (!customerName?.trim()) validationErrors.push('Customer name is required');
    if (!customerEmail?.trim()) validationErrors.push('Customer email is required');
    if (!customerPhone?.trim()) validationErrors.push('Customer phone is required');
    if (!shippingAddress?.trim()) validationErrors.push('Shipping address is required');
    if (!shippingCity?.trim()) validationErrors.push('Shipping city is required');
    if (!shippingState?.trim()) validationErrors.push('Shipping state is required');
    if (!items || !Array.isArray(items) || items.length === 0) {
      validationErrors.push('Order items are required');
    }
    if (!total || isNaN(parseFloat(total))) validationErrors.push('Valid total amount is required');

    if (validationErrors.length > 0) {
      console.log('❌ Validation failed:', validationErrors);
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }

    // FIXED: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    // FIXED: Validate and process items
    const processedItems = [];
    let calculatedSubtotal = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (!item.productId) {
        return res.status(400).json({ 
          success: false,
          error: `Item ${i + 1}: Product ID is required` 
        });
      }
      
      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({ 
          success: false,
          error: `Item ${i + 1}: Valid quantity is required` 
        });
      }
      
      if (!item.price || item.price < 0) {
        return res.status(400).json({ 
          success: false,
          error: `Item ${i + 1}: Valid price is required` 
        });
      }

      // FIXED: Check if product exists and has sufficient stock
      console.log(`🔍 Checking product: ${item.productId}`);
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          isActive: true
        }
      });

      if (!product) {
        return res.status(400).json({ 
          success: false,
          error: `Product not found: ${item.productId}` 
        });
      }

      if (!product.isActive) {
        return res.status(400).json({ 
          success: false,
          error: `Product "${product.name}" is no longer available` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false,
          error: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }

      const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
      calculatedSubtotal += itemTotal;

      processedItems.push({
        productId: item.productId,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        total: itemTotal
      });

      console.log(`✅ Item validated: ${product.name} x${item.quantity}`);
    }

    // FIXED: Generate unique order number
    const orderNumber = await generateOrderNumber();
    
    // FIXED: Calculate estimated delivery (3-7 business days)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3 + Math.floor(Math.random() * 5));

    // FIXED: Try to find existing user by email to link the order
    let userId = null;
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: customerEmail.trim().toLowerCase() },
        select: { id: true }
      });
      if (existingUser) {
        userId = existingUser.id;
        console.log('👤 Found existing user for order:', userId);
      } else {
        console.log('👤 No existing user found for email:', customerEmail);
      }
    } catch (userLookupError) {
      console.warn('⚠️ User lookup failed, proceeding without userId:', userLookupError.message);
    }

    console.log('🔄 Creating order in database...');

    // FIXED: Use database transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      // Create the order with correct schema mapping
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId, // Link to user if found
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          customerPhone: customerPhone.trim(),
          
          // FIXED: Map to individual schema fields
          shippingAddress: shippingAddress.trim(),
          shippingCity: shippingCity.trim(),
          shippingState: shippingState.trim(),
          shippingZipCode: shippingZipCode?.trim() || null,
          shippingCountry: 'Pakistan', // Default country
          
          // FIXED: Financial calculations
          subtotal: calculatedSubtotal,
          shipping: 50.0, // COD shipping fee
          codFee: 0.0,
          total: parseFloat(total),
          
          // Order status
          status: 'PENDING',
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          
          estimatedDelivery,
        },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerEmail: true,
          total: true,
          status: true,
          createdAt: true,
          estimatedDelivery: true
        }
      });

      console.log(`✅ Order created: ${order.orderNumber}`);

      // Create order items
      const orderItems = await tx.orderItem.createMany({
        data: processedItems.map(item => ({
          orderId: order.id,
          ...item
        }))
      });

      console.log(`✅ Created ${orderItems.count} order items`);

      // FIXED: Update product stock atomically
      for (const item of processedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
        console.log(`✅ Stock updated for product ${item.productId}: -${item.quantity}`);
      }

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: parseFloat(total),
          currency: 'USD',
          method: 'COD',
          status: 'PENDING'
        }
      });

      console.log(`✅ Payment record created: ${payment.id}`);

      return { order, orderItems, payment };
    });

    console.log('🎉 COD order created successfully:', result.order.orderNumber);

    // FIXED: Return structured success response
    return res.status(200).json({ 
      success: true,
      message: 'Cash on Delivery order created successfully',
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
      estimatedDelivery: result.order.estimatedDelivery,
      total: result.order.total,
      status: result.order.status,
      order: result.order
    });

  } catch (error) {
    console.error('❌ COD Order Creation Error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    // FIXED: Detailed error responses for debugging
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false,
        error: 'Duplicate order. Please try again with a new order.',
        code: 'DUPLICATE_ORDER'
      });
    }

    if (error.code === 'P2025') {
      return res.status(400).json({ 
        success: false,
        error: 'Referenced product not found. Please refresh your cart.',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    if (error.message.includes('stock')) {
      return res.status(400).json({ 
        success: false,
        error: error.message,
        code: 'INSUFFICIENT_STOCK'
      });
    }

    // Generic error response
    return res.status(500).json({ 
      success: false,
      error: process.env.NODE_ENV === 'development' 
        ? `Order creation failed: ${error.message}` 
        : 'Failed to create order. Please try again.',
      code: 'ORDER_CREATION_FAILED'
    });
  }
}