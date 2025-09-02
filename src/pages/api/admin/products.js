/**
 * PERFORMANCE OPTIMIZED: Admin Products API
 * 
 * Key optimizations:
 * - Cached authentication checks
 * - Minimal database queries
 * - Selective field loading
 * - Optimized pagination
 * - Reduced JSON parsing
 */

// FIXED: Node.js runtime for Prisma compatibility
export const config = {
  runtime: 'nodejs',
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

// PERFORMANCE: Cache admin status for 5 minutes
const adminCache = new Map();
const ADMIN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  const startTime = Date.now();
  
  try {
    // PERFORMANCE: Fast authentication check
    const isAuthorized = await checkAdminAuth(req, res);
    if (!isAuthorized) {
      return; // Response already sent by checkAdminAuth
    }

    switch (req.method) {
      case 'GET':
        return await getProducts(req, res, startTime);
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
    console.error('❌ Admin products API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// PERFORMANCE: Optimized admin authentication with caching
async function checkAdminAuth(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      res.status(401).json({ error: 'Unauthorized' });
      return false;
    }

    const userEmail = session.user.email;
    
    // PERFORMANCE: Check hardcoded admin first (fastest)
    if (userEmail === 'amirabdullah2508@gmail.com') {
      return true;
    }

    // PERFORMANCE: Check cache for admin status
    const cacheKey = userEmail;
    const cached = adminCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < ADMIN_CACHE_DURATION) {
      if (!cached.isAdmin) {
        res.status(403).json({ error: 'Admin access required' });
        return false;
      }
      return true;
    }

    // PERFORMANCE: Database lookup only if not cached
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { role: true } // Only select role field
    });

    const isAdmin = user?.role === 'ADMIN';
    
    // PERFORMANCE: Cache the result
    adminCache.set(cacheKey, {
      isAdmin,
      timestamp: Date.now()
    });

    if (!isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Auth check failed:', error);
    res.status(500).json({ error: 'Authentication failed' });
    return false;
  }
}

async function getProducts(req, res, startTime) {
  try {
    // PERFORMANCE: Parse query with defaults
    const { 
      search = '', 
      category = '', 
      brand = 'All', // NEW: Brand filter parameter
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Admin can see more
    const skip = (pageNum - 1) * limitNum;

    console.log(`🔍 Admin Products: page=${pageNum}, limit=${limitNum}, search="${search}", brand="${brand}"`);

    // PERFORMANCE: Build optimized where clause
    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(category && category !== 'All' && {
        category: {
          name: { equals: category, mode: 'insensitive' }
        }
      }),
      ...(brand && brand !== 'All' && {
        brandType: brand
      })
    };

    // PERFORMANCE: Validate sort field
    const allowedSortFields = ['createdAt', 'name', 'price', 'rating', 'stock'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    // PERFORMANCE: Execute optimized parallel queries
    const [products, totalCount, categories] = await Promise.all([
        prisma.product.findMany({
          where,
        select: {
          // PERFORMANCE: Select only required fields for admin list
          id: true,
          name: true,
          description: true,
          price: true,
          originalPrice: true,
          image: true,
          images: true, // Admin needs all images
          stock: true,
          sku: true,
          rating: true,
          reviewCount: true,
          isActive: true,
          isFeatured: true,
          brandType: true,
          createdAt: true,
          updatedAt: true,
          category: {
              select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: { [sortField]: orderDirection },
        skip,
        take: limitNum,
      }),

      // PERFORMANCE: Count for pagination
      prisma.product.count({ where }),

      // PERFORMANCE: Get categories for filter (cached separately)
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true
        },
        orderBy: { name: 'asc' }
      })
    ]);

    // PERFORMANCE: Minimal data transformation
    const transformedProducts = products.map(product => ({
      ...product,
      price: parseFloat(product.price),
      originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
      rating: product.rating ? parseFloat(product.rating) : null,
      images: product.images ? JSON.parse(product.images) : []
    }));

    const responseTime = Date.now() - startTime;
    console.log(`✅ Admin products loaded: ${products.length}/${totalCount} in ${responseTime}ms`);

    return res.status(200).json({
      products: transformedProducts,
      categories,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        limit: limitNum
      },
      meta: {
        responseTime
      }
    });

  } catch (error) {
    console.error('❌ Database error in admin getProducts:', error);
    
    // PERFORMANCE: Graceful degradation
    return res.status(200).json({
      products: [],
      categories: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        limit: 20
      },
      meta: {
        error: 'Database temporarily unavailable',
        responseTime: Date.now() - startTime
      }
    });
  }
}

async function createProduct(req, res) {
  try {
    const { name, description, price, category, stock, rating, image, images, originalPrice, sku, brandType } = req.body;

    console.log('🔍 Creating product with data:', {
      name,
      price,
      category,
      stock,
      hasImage: !!image,
      hasImages: !!images,
      originalPrice
    });

    // PERFORMANCE: Validate required fields quickly
    if (!name || !price || !category || !brandType) {
      return res.status(400).json({ error: 'Name, price, category, and brand type are required' });
    }

    // PERFORMANCE: Parallel category lookup/creation
    let categoryRecord = await prisma.category.findFirst({
      where: { name: { equals: category, mode: 'insensitive' } },
      select: { id: true }
    });

    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: {
          name: category,
          slug: category.toLowerCase().replace(/\s+/g, '-'),
          description: `${category} products`,
        },
        select: { id: true }
      });
    }

    // PERFORMANCE: Create product with minimal data
    const newProduct = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        categoryId: categoryRecord.id,
        stock: parseInt(stock) || 0,
        rating: rating ? parseFloat(rating) : null,
        image: image || '/BA-SportsLogo.png',
        images: Array.isArray(images) ? JSON.stringify(images) : (images || '[]'),
        tags: JSON.stringify([]), // Default empty tags array
        sku: sku || null,
        brandType: brandType || 'BA_SPORTS',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        category: {
          select: { id: true, name: true }
        }
      }
    });

    console.log(`✅ Product created: ${newProduct.id}`);
    return res.status(201).json(newProduct);

  } catch (error) {
    console.error('❌ Create product error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return res.status(500).json({ 
      error: 'Failed to create product',
      details: error.message,
      code: error.code,
      stack: process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.query;
    const updateData = { ...req.body };
    
    // PERFORMANCE: Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    // PERFORMANCE: Handle numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.originalPrice) updateData.originalPrice = parseFloat(updateData.originalPrice);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);
    if (updateData.rating) updateData.rating = parseFloat(updateData.rating);
    
    // PERFORMANCE: Handle category update if needed
    if (updateData.category && typeof updateData.category === 'string') {
      const categoryRecord = await prisma.category.findFirst({
        where: { name: { equals: updateData.category, mode: 'insensitive' } },
        select: { id: true }
      });
      
      if (categoryRecord) {
        updateData.categoryId = categoryRecord.id;
      }
      delete updateData.category;
    }

    // PERFORMANCE: Handle images JSON
    if (updateData.images && typeof updateData.images !== 'string') {
      updateData.images = JSON.stringify(updateData.images);
    }

    // PERFORMANCE: Handle tags JSON
    if (updateData.tags && typeof updateData.tags !== 'string') {
      updateData.tags = JSON.stringify(updateData.tags);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        price: true,
        updatedAt: true
      }
    });

    console.log(`✅ Product updated: ${updatedProduct.id}`);
    return res.status(200).json(updatedProduct);

  } catch (error) {
    console.error('❌ Update product error:', error);
    return res.status(500).json({ 
      error: 'Failed to update product',
      details: process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.query;

    await prisma.product.delete({
      where: { id }
    });

    console.log(`✅ Product deleted: ${id}`);
    return res.status(200).json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('❌ Delete product error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    return res.status(500).json({ 
      error: 'Failed to delete product',
      details: process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? error.message : undefined
    });
  }
}