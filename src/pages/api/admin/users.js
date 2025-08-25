import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

// FIXED: Node.js runtime for Prisma compatibility
export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  try {
    console.log('🔍 Admin users API called');
    
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    console.log('✅ Authentication successful for:', session.user.email);

    // FIXED: Improved admin access check with better error handling
    const isAdminEmail = session.user.email === 'amirabdullah2508@gmail.com';
    
    if (!isAdminEmail) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { role: true }
        });
        
        if (!user || user.role !== 'ADMIN') {
          return res.status(403).json({ error: 'Admin access required' });
        }
      } catch (dbError) {
        console.error('❌ Database error during admin check:', dbError);
        return res.status(503).json({ error: 'Database temporarily unavailable' });
      }
    }

    switch (req.method) {
      case 'GET':
        return await getUsers(req, res);
      case 'POST':
        return await createUser(req, res);
      case 'PUT':
        return await updateUser(req, res);
      case 'DELETE':
        return await deleteUser(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin users API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUsers(req, res) {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    
    console.log('🔍 Fetching users with params:', { search, role, page, limit });
    
    // FIXED: Improved database query with better error handling
    try {
      const where = {};
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      if (role && role !== 'All') {
        where.role = role;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // FIXED: Use Promise.all for concurrent queries and better performance
      const [users, total, totalUsers, adminUsers, activeUsers] = await Promise.all([
        // Get paginated users with counts
        prisma.user.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                orders: true,
                reviews: true,
                wishlist: true
              }
            }
          }
        }),
        // Get total count for current filter
        prisma.user.count({ where }),
        // Get total users count (for stats)
        prisma.user.count(),
        // Get admin users count (for stats)
        prisma.user.count({ where: { role: 'ADMIN' } }),
        // Get active users count (users with orders)
        prisma.user.count({
          where: {
            orders: {
              some: {}
            }
          }
        })
      ]);

      console.log('📊 User counts:', { totalUsers, adminUsers, activeUsers });

      const transformedUsers = users.map(user => ({
        id: user.id,
        name: user.name || 'Unknown',
        email: user.email,
        role: user.role,
        joinDate: user.createdAt,
        lastLogin: user.updatedAt,
        orders: user._count.orders,
        reviews: user._count.reviews,
        wishlist: user._count.wishlist,
        image: user.image,
        emailVerified: user.emailVerified
      }));

      return res.status(200).json({
        users: transformedUsers,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
        // FIXED: Include user statistics for frontend counters
        stats: {
          totalUsers,
          adminUsers,
          activeUsers
        }
      });
    } catch (dbError) {
      console.error('❌ Database error occurred:', dbError.message);
      return res.status(200).json({
        users: [],
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 0,
        stats: {
          totalUsers: 0,
          adminUsers: 0,
          activeUsers: 0
        },
        message: 'Database temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, role = 'USER' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await prisma.user.create({
      data: { name, email, role, emailVerified: new Date() }
    });

    return res.status(201).json({ user });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.query;
    const { name, email, role } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;

    const user = await prisma.user.update({ where: { id }, data: updateData });
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userOrders = await prisma.order.count({ where: { userId: id } });
    if (userOrders > 0) {
      return res.status(400).json({
        error: 'Cannot delete user with existing orders. Consider deactivating instead.'
      });
    }

    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}










