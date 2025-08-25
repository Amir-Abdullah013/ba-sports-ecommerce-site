import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
// FIXED: Added Node.js runtime for Prisma compatibility
export const config = {
  runtime: 'nodejs',
};

import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  console.log('Wishlist API - Full Session:', JSON.stringify(session, null, 2));

  if (!session) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!session.user) {
    console.error('Wishlist API - No user in session:', session);
    return res.status(400).json({ error: 'User not found in session' });
  }

  if (!session.user.id) {
    console.error('Wishlist API - No user ID in session.user:', session.user);
    return res.status(400).json({ error: 'User ID not found in session' });
  }

  const userId = session.user.id;
  console.log('Wishlist API - User ID:', userId);

  // Ensure user exists in database
  try {
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      // Create user if not exists
      user = await prisma.user.create({
        data: {
          id: userId,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          emailVerified: new Date()
        }
      });
      console.log('Created user in database:', user.id);
    }
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    return res.status(500).json({ error: 'Database error' });
  }

  switch (req.method) {
    case 'GET':
      // Get user's wishlist
      try {
        const wishlistItems = await prisma.wishlistItem.findMany({
          where: { userId },
          include: {
            product: {
              include: {
                category: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({ wishlist: wishlistItems });
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        return res.status(500).json({ error: 'Failed to fetch wishlist' });
      }

    case 'POST':
      // Add item to wishlist
      try {
        const { productId } = req.body;

        if (!productId) {
          return res.status(400).json({ error: 'Product ID is required' });
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
          where: { id: productId }
        });

        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        // Check if already in wishlist
        const existingItem = await prisma.wishlistItem.findFirst({
          where: {
            userId,
            productId
          }
        });

        if (existingItem) {
          return res.status(400).json({ error: 'Product already in wishlist' });
        }

        // Add to wishlist
        const wishlistItem = await prisma.wishlistItem.create({
          data: {
            userId,
            productId
          },
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        });

        return res.status(201).json({ 
          message: 'Added to wishlist',
          wishlistItem 
        });
      } catch (error) {
        console.error('Error adding to wishlist:', error);
        return res.status(500).json({ error: 'Failed to add to wishlist' });
      }

    case 'DELETE':
      // Remove item from wishlist
      try {
        const { productId } = req.body;

        if (!productId) {
          return res.status(400).json({ error: 'Product ID is required' });
        }

        const deletedItem = await prisma.wishlistItem.deleteMany({
          where: {
            userId,
            productId
          }
        });

        if (deletedItem.count === 0) {
          return res.status(404).json({ error: 'Item not found in wishlist' });
        }

        return res.status(200).json({ message: 'Removed from wishlist' });
      } catch (error) {
        console.error('Error removing from wishlist:', error);
        return res.status(500).json({ error: 'Failed to remove from wishlist' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
