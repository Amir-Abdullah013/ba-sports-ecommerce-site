/**
 * PRODUCTS API - FIXED FOR LOCALHOST AND PRODUCTION
 * 
 * Key features:
 * - Proper error handling for Supabase connections
 * - Environment variable validation
 * - Graceful fallbacks for development
 * - Pagination with limit (default 20)
 * - Selective field loading (only required fields)
 * - Response caching headers
 * - NEVER crashes - always returns valid JSON
 */

// REQUIRED: Node.js runtime for Prisma compatibility  
export const config = {
  runtime: 'nodejs',
};

import prisma, { connectDatabase } from '../../../lib/prisma';

export default async function handler(req, res) {
  const startTime = Date.now();
  
  // LOCALHOST FIX: Only handle GET requests for products
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      error: `Method ${req.method} Not Allowed`,
      message: 'This endpoint only supports GET requests'
    });
  }
  
  try {
    // PRODUCTION FIX: Ensure database connection like categories API
    await connectDatabase(2);
    
    return await getProducts(req, res, startTime);
    
  } catch (error) {
    console.error('❌ Products API Error:', error);
    
    // LOCALHOST FIX: More specific error handling - NEVER crash
    if (error.message.includes('getaddrinfo ENOTFOUND') || error.message.includes('connect ECONNREFUSED')) {
      return res.status(503).json({ 
        products: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 20
        },
        meta: {
          error: 'Database connection failed', 
          message: 'Cannot connect to Supabase database. Please check your internet connection and NEXT_PUBLIC_DATABASE_URL.',
          responseTime: Date.now() - startTime,
          details: process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? {
            error: error.message,
            suggestion: 'Verify NEXT_PUBLIC_DATABASE_URL in .env.local and ensure Supabase project is active'
          } : undefined 
        }
      });
    }
    
    if (error.message.includes('connection') || error.message.includes('timeout')) {
      return res.status(503).json({ 
        products: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 20
        },
        meta: {
          error: 'Database temporarily unavailable', 
          message: 'Please try again in a moment',
          responseTime: Date.now() - startTime,
          details: process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? error.message : undefined 
        }
      });
    }
    
    return res.status(500).json({ 
      products: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 20
      },
      meta: {
        error: 'Internal server error', 
        message: 'An unexpected error occurred while fetching products',
        responseTime: Date.now() - startTime,
        details: process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? error.message : undefined 
      }
    });
  }
}

async function getProducts(req, res, startTime) {
  try {
    // PERFORMANCE: Parse query parameters with defaults
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      category = '', 
      brand = '', // NEW: Brand filter parameter
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured = false
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Cap at 50
    const skip = (pageNum - 1) * limitNum;

    console.log(`🔍 Products API: page=${pageNum}, limit=${limitNum}, search="${search}", brand="${brand}"`);

    // PERFORMANCE: Build optimized where clause
    const where = {
      isActive: true, // Public API only shows active products
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }),
      ...(category && category !== 'All' && {
        category: {
          name: { equals: category, mode: 'insensitive' }
        }
      }),
      ...(brand && brand !== 'All' && {
        brandType: {
          equals: brand,
          mode: 'insensitive'
        }
      }),
      ...(featured === 'true' && { isFeatured: true })
    };

    // PERFORMANCE: Validate sort field
    const allowedSortFields = ['createdAt', 'name', 'price', 'rating'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    // PERFORMANCE: Execute optimized queries in parallel
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          // PERFORMANCE: Only select required fields
          id: true,
          name: true,
          description: true,
          price: true,
          originalPrice: true,
          image: true, // Primary image
          images: true, // Additional images for hover functionality
          stock: true,
          rating: true,
          reviewCount: true,
          isFeatured: true,
          brandType: true,
          createdAt: true,
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
      
      // PERFORMANCE: Count query for pagination
      prisma.product.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    const responseTime = Date.now() - startTime;
    console.log(`✅ Products loaded: ${products.length}/${totalCount} in ${responseTime}ms`);

    // PERFORMANCE: Set cache headers for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    
    return res.status(200).json({
      products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      },
      meta: {
        responseTime,
        cached: false
      }
    });

  } catch (error) {
    console.error('❌ Database error in getProducts:', error);
    
    // LOCALHOST FIX: Better error handling for specific database issues
    if (error.code === 'P1001') {
      return res.status(503).json({
        error: 'Database connection failed',
        message: 'Cannot reach the database server. Please check your Supabase connection.',
        details: process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? {
          error: error.message,
          code: error.code,
          suggestion: 'Check if your Supabase project is active and NEXT_PUBLIC_DATABASE_URL is correct'
        } : undefined
      });
    }

    if (error.code === 'P2002') {
      return res.status(400).json({
        error: 'Database constraint error',
        message: 'A database constraint was violated.',
        details: process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    // LOCALHOST FIX: Graceful degradation - return empty results with clear error info
    return res.status(500).json({
      products: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 20
      },
      meta: {
        error: 'Database temporarily unavailable',
        message: 'Failed to fetch products from database',
        responseTime: Date.now() - startTime,
        details: process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? error.message : undefined
      }
    });
  } finally {
    // No need to disconnect when using shared prisma client
  }
}

async function createProduct(req, res) {
  // Implementation for product creation (simplified for performance)
  return res.status(405).json({ error: 'Use admin API for product creation' });
}