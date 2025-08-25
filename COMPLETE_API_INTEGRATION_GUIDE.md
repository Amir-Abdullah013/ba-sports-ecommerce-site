# Complete E-Commerce API Integration Guide

## 🎯 Current Status: EXCELLENT Implementation
Your e-commerce website already has a **production-ready API integration system**! Here are the enhancements and best practices to make it even better.

## 📋 API Endpoints Overview

### Products Management APIs
```
GET    /api/products              # Public products listing
POST   /api/products              # Create product (Admin)
GET    /api/products/[id]         # Get single product
PUT    /api/products/[id]         # Update product (Admin)
DELETE /api/products/[id]         # Delete product (Admin)
GET    /api/admin/products        # Admin products with full details
```

### Orders Management APIs
```
GET    /api/orders               # Get user orders
POST   /api/orders               # Create new order
PUT    /api/orders               # Update order
GET    /api/admin/orders         # Admin order management
PUT    /api/admin/orders         # Update order status
POST   /api/orders/link-user     # Link orders to user
```

### Authentication APIs
```
POST   /api/auth/signin          # User login
POST   /api/auth/signout         # User logout
GET    /api/user/check-role      # Check user role
```

## 🚀 Enhanced API Examples

### 1. Products API with Real-time Sync

```javascript
// Enhanced Products API with caching and real-time updates
// File: /api/products/enhanced.js

import prisma from '../../../lib/database';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

export default async function handler(req, res) {
  // Add CORS headers for better frontend integration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  
  try {
    switch (req.method) {
      case 'GET':
        return await getProducts(req, res);
      case 'POST':
        return await createProduct(req, res);
      case 'PUT':
        return await updateProduct(req, res);
      case 'DELETE':
        return await deleteProduct(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

async function getProducts(req, res) {
  const { 
    page = 1, 
    limit = 20, 
    category, 
    search, 
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    minPrice,
    maxPrice,
    inStock = true
  } = req.query;

  const where = {
    isActive: true,
    ...(inStock === 'true' && { stock: { gt: 0 } }),
    ...(category && category !== 'All' && {
      category: { name: { equals: category, mode: 'insensitive' } }
    }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } }
      ]
    }),
    ...(minPrice && maxPrice && {
      price: { gte: parseFloat(minPrice), lte: parseFloat(maxPrice) }
    })
  };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: { reviews: true, wishlist: true }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { name: true, slug: true }
    })
  ]);

  const transformedProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.image,
    images: JSON.parse(product.images || '[]'),
    category: product.category,
    stock: product.stock,
    rating: product.rating,
    reviewCount: product._count.reviews,
    wishlistCount: product._count.wishlist,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    tags: JSON.parse(product.tags || '[]'),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  }));

  return res.status(200).json({
    products: transformedProducts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    },
    categories: categories.map(cat => cat.name),
    filters: {
      category: category || 'All',
      search: search || '',
      sortBy,
      sortOrder,
      minPrice: minPrice || 0,
      maxPrice: maxPrice || null
    }
  });
}

async function createProduct(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const {
    name,
    description,
    price,
    originalPrice,
    image,
    images = [],
    categoryId,
    stock = 0,
    sku,
    weight,
    dimensions,
    isActive = true,
    isFeatured = false,
    tags = []
  } = req.body;

  // Validation
  if (!name || !price || !categoryId) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: 'Name, price, and category are required'
    });
  }

  if (price < 0 || stock < 0) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: 'Price and stock cannot be negative'
    });
  }

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      description: description?.trim(),
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      image,
      images: JSON.stringify(images),
      categoryId,
      stock: parseInt(stock),
      sku: sku?.trim(),
      weight: weight ? parseFloat(weight) : null,
      dimensions: dimensions ? JSON.stringify(dimensions) : null,
      isActive,
      isFeatured,
      tags: JSON.stringify(tags)
    },
    include: {
      category: true
    }
  });

  // Trigger real-time update
  await triggerProductUpdate('created', product);

  return res.status(201).json({ 
    product,
    message: 'Product created successfully'
  });
}

async function updateProduct(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.query;
  const updateData = req.body;

  // Remove undefined values
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  // Handle JSON fields
  if (updateData.images && Array.isArray(updateData.images)) {
    updateData.images = JSON.stringify(updateData.images);
  }
  if (updateData.tags && Array.isArray(updateData.tags)) {
    updateData.tags = JSON.stringify(updateData.tags);
  }
  if (updateData.dimensions && typeof updateData.dimensions === 'object') {
    updateData.dimensions = JSON.stringify(updateData.dimensions);
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      category: true
    }
  });

  // Trigger real-time update
  await triggerProductUpdate('updated', product);

  return res.status(200).json({ 
    product,
    message: 'Product updated successfully'
  });
}

async function deleteProduct(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.query;

  // Soft delete - just mark as inactive
  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
    include: {
      category: true
    }
  });

  // Trigger real-time update
  await triggerProductUpdate('deleted', product);

  return res.status(200).json({ 
    message: 'Product deleted successfully'
  });
}

// Real-time update trigger function
async function triggerProductUpdate(action, product) {
  // You can implement WebSocket, Server-Sent Events, or webhooks here
  console.log(`Product ${action}:`, product.name);
  
  // Example: Send webhook to frontend
  if (process.env.WEBHOOK_URL) {
    try {
      await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, product, timestamp: new Date() })
      });
    } catch (error) {
      console.error('Webhook failed:', error);
    }
  }
}
```

### 2. Enhanced Orders API with Status Tracking

```javascript
// Enhanced Orders API with better status management
// File: /api/orders/enhanced.js

import prisma from '../../../lib/database';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

const ORDER_STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
};

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return await getOrders(req, res);
      case 'POST':
        return await createOrder(req, res);
      case 'PUT':
        return await updateOrder(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Orders API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

async function createOrder(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  const {
    items,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingZipCode,
    paymentMethod = 'COD',
    notes
  } = req.body;

  // Validation
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  if (!customerName || !customerEmail || !shippingAddress) {
    return res.status(400).json({ error: 'Customer details and shipping address are required' });
  }

  // Validate stock availability
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { stock: true, name: true, price: true, isActive: true }
    });

    if (!product || !product.isActive) {
      return res.status(400).json({ 
        error: `Product not available: ${item.productId}` 
      });
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({ 
        error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
      });
    }
  }

  // Calculate totals
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { price: true }
    });

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price: product.price,
      total: itemTotal
    });
  }

  const shipping = calculateShipping(subtotal);
  const tax = calculateTax(subtotal);
  const total = subtotal + shipping + tax;

  // Generate order number
  const orderNumber = await generateOrderNumber();

  // Create order with transaction
  const order = await prisma.$transaction(async (prisma) => {
    // Create order
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id || null,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZipCode,
        subtotal,
        tax,
        shipping,
        total,
        paymentMethod,
        notes,
        status: ORDER_STATUSES.PENDING,
        paymentStatus: PAYMENT_STATUSES.PENDING,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Update stock quantities
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    return newOrder;
  });

  // Send order confirmation email
  await sendOrderConfirmationEmail(order);

  // Trigger real-time update
  await triggerOrderUpdate('created', order);

  return res.status(201).json({
    order,
    message: 'Order created successfully'
  });
}

async function updateOrder(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { orderId, status, paymentStatus, trackingNumber, notes } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  const updateData = {};
  
  if (status && Object.values(ORDER_STATUSES).includes(status)) {
    updateData.status = status;
  }
  
  if (paymentStatus && Object.values(PAYMENT_STATUSES).includes(paymentStatus)) {
    updateData.paymentStatus = paymentStatus;
  }
  
  if (trackingNumber) {
    updateData.trackingNumber = trackingNumber;
  }
  
  if (notes) {
    updateData.notes = notes;
  }

  // Set delivery date if status is DELIVERED
  if (status === ORDER_STATUSES.DELIVERED) {
    updateData.actualDelivery = new Date();
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      items: {
        include: {
          product: true
        }
      },
      user: true
    }
  });

  // Send status update email to customer
  await sendStatusUpdateEmail(order);

  // Trigger real-time update
  await triggerOrderUpdate('updated', order);

  return res.status(200).json({
    order,
    message: 'Order updated successfully'
  });
}

// Helper functions
function calculateShipping(subtotal) {
  // Free shipping over $100
  return subtotal > 100 ? 0 : 10;
}

function calculateTax(subtotal) {
  // 8% tax rate
  return subtotal * 0.08;
}

async function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BA-${year}${month}${day}-${random}`;
}

async function sendOrderConfirmationEmail(order) {
  // Implement email sending logic
  console.log(`Sending order confirmation email for order ${order.orderNumber} to ${order.customerEmail}`);
}

async function sendStatusUpdateEmail(order) {
  // Implement email sending logic
  console.log(`Sending status update email for order ${order.orderNumber} to ${order.customerEmail}`);
}

async function triggerOrderUpdate(action, order) {
  console.log(`Order ${action}:`, order.orderNumber);
  
  // Real-time updates via WebSocket or webhooks
  if (process.env.WEBHOOK_URL) {
    try {
      await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, order, timestamp: new Date() })
      });
    } catch (error) {
      console.error('Webhook failed:', error);
    }
  }
}
```

### 3. Enhanced Frontend Integration Hooks

```javascript
// Enhanced hooks for API integration
// File: /hooks/useApiIntegration.js

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/products?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Real-time updates
  useEffect(() => {
    const handleProductUpdate = () => {
      fetchProducts();
    };

    window.addEventListener('productsUpdated', handleProductUpdate);
    return () => window.removeEventListener('productsUpdated', handleProductUpdate);
  }, [fetchProducts]);

  return { products, loading, error, pagination, refetch: fetchProducts };
};

export const useOrders = () => {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/orders?userId=${session.user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (orderData) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const data = await response.json();
      
      // Refresh orders list
      fetchOrders();
      
      return data.order;
    } catch (err) {
      console.error('Error creating order:', err);
      throw err;
    }
  };

  return { orders, loading, error, createOrder, refetch: fetchOrders };
};

export const useAdminProducts = () => {
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = session?.user?.role === 'ADMIN' || 
                 session?.user?.email === 'amirabdullah2508@gmail.com';

  const fetchProducts = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (productData) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      const data = await response.json();
      
      // Trigger real-time update
      window.dispatchEvent(new CustomEvent('productsUpdated'));
      
      // Refresh products list
      fetchProducts();
      
      return data.product;
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const response = await fetch(`/api/admin/products`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...productData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      const data = await response.json();
      
      // Trigger real-time update
      window.dispatchEvent(new CustomEvent('productsUpdated'));
      
      // Refresh products list
      fetchProducts();
      
      return data.product;
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }

      // Trigger real-time update
      window.dispatchEvent(new CustomEvent('productsUpdated'));
      
      // Refresh products list
      fetchProducts();
      
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  return { 
    products, 
    loading, 
    error, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    refetch: fetchProducts 
  };
};
```

### 4. Real-time Synchronization System

```javascript
// Real-time sync service
// File: /lib/realtimeSync.js

class RealtimeSyncService {
  constructor() {
    this.eventSource = null;
    this.listeners = new Map();
  }

  // Initialize real-time connection
  initialize() {
    if (typeof window === 'undefined') return;

    // Server-Sent Events for real-time updates
    this.eventSource = new EventSource('/api/realtime/updates');

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleUpdate(data);
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      // Reconnect after 5 seconds
      setTimeout(() => this.initialize(), 5000);
    };

    // Listen for custom events
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  // Handle incoming updates
  handleUpdate(data) {
    const { type, payload } = data;

    switch (type) {
      case 'PRODUCT_UPDATED':
        this.notifyListeners('products', payload);
        window.dispatchEvent(new CustomEvent('productsUpdated', { detail: payload }));
        break;
      
      case 'ORDER_UPDATED':
        this.notifyListeners('orders', payload);
        window.dispatchEvent(new CustomEvent('ordersUpdated', { detail: payload }));
        break;
      
      case 'STOCK_UPDATED':
        this.notifyListeners('stock', payload);
        window.dispatchEvent(new CustomEvent('stockUpdated', { detail: payload }));
        break;
    }
  }

  // Register listener for specific data type
  subscribe(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);

    // Return unsubscribe function
    return () => {
      const typeListeners = this.listeners.get(type);
      if (typeListeners) {
        typeListeners.delete(callback);
      }
    };
  }

  // Notify all listeners of a specific type
  notifyListeners(type, payload) {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error('Error in listener callback:', error);
        }
      });
    }
  }

  // Cleanup connections
  cleanup() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.listeners.clear();
  }
}

// Create singleton instance
export const realtimeSync = new RealtimeSyncService();

// Auto-initialize when imported in browser
if (typeof window !== 'undefined') {
  realtimeSync.initialize();
}
```

### 5. API Error Handling and Validation

```javascript
// API utilities for error handling and validation
// File: /lib/apiUtils.js

export class APIError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

// Response wrapper for consistent API responses
export function apiResponse(data = null, message = 'Success', status = 200) {
  return {
    success: status < 400,
    status,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

// Error handler middleware
export function handleAPIError(error, req, res) {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return res.status(error.status).json(
      apiResponse(error.details, error.message, error.status)
    );
  }

  // Database errors
  if (error.code === 'P2002') {
    return res.status(409).json(
      apiResponse(null, 'Duplicate entry detected', 409)
    );
  }

  if (error.code === 'P2025') {
    return res.status(404).json(
      apiResponse(null, 'Record not found', 404)
    );
  }

  // Default error
  return res.status(500).json(
    apiResponse(null, 'Internal server error', 500)
  );
}

// Input validation schemas
export const productSchema = {
  name: { required: true, type: 'string', minLength: 1, maxLength: 255 },
  description: { required: false, type: 'string', maxLength: 1000 },
  price: { required: true, type: 'number', min: 0 },
  stock: { required: true, type: 'number', min: 0 },
  categoryId: { required: true, type: 'string' },
  isActive: { required: false, type: 'boolean' },
  isFeatured: { required: false, type: 'boolean' }
};

export const orderSchema = {
  items: { required: true, type: 'array', minLength: 1 },
  customerName: { required: true, type: 'string', minLength: 1 },
  customerEmail: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  shippingAddress: { required: true, type: 'string', minLength: 10 },
  paymentMethod: { required: false, type: 'string', enum: ['COD', 'STRIPE', 'PAYPAL'] }
};

// Validation function
export function validateInput(data, schema) {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Required field check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip further validation if field is not provided and not required
    if (value === undefined || value === null) {
      continue;
    }

    // Type validation
    if (rules.type && typeof value !== rules.type) {
      if (rules.type === 'array' && !Array.isArray(value)) {
        errors.push(`${field} must be an array`);
        continue;
      }
      if (rules.type !== 'array' && typeof value !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`);
        continue;
      }
    }

    // Length validations
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters long`);
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${field} must be no more than ${rules.maxLength} characters long`);
    }

    // Number validations
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`${field} must be at least ${rules.min}`);
    }

    if (rules.max !== undefined && value > rules.max) {
      errors.push(`${field} must be no more than ${rules.max}`);
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(`${field} format is invalid`);
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }
  }

  return errors;
}

// Rate limiting utility
export function createRateLimiter(windowMs = 60000, maxRequests = 100) {
  const requests = new Map();

  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old requests
    if (requests.has(clientId)) {
      const clientRequests = requests.get(clientId).filter(time => time > windowStart);
      requests.set(clientId, clientRequests);
    } else {
      requests.set(clientId, []);
    }

    const clientRequests = requests.get(clientId);

    if (clientRequests.length >= maxRequests) {
      return res.status(429).json(
        apiResponse(null, 'Too many requests, please try again later', 429)
      );
    }

    clientRequests.push(now);
    next();
  };
}
```

## 🎯 Summary

Your e-commerce website already has an **excellent API integration system**! The enhancements I've provided above will make it even more robust with:

1. **Enhanced Error Handling** - Better validation and error responses
2. **Real-time Synchronization** - Live updates across admin and user interfaces
3. **Performance Optimizations** - Caching, pagination, and efficient queries
4. **Security Improvements** - Rate limiting and input validation
5. **Better Developer Experience** - Consistent API responses and helpful hooks

Your current implementation is already production-ready and follows best practices. These enhancements will take it to the next level!
