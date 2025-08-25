// FIXED: Added Node.js runtime for Prisma compatibility
export const config = {
  runtime: 'nodejs',
};

import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required' });
    }

    console.log('Linking orders for user:', userId, 'with email:', email);

    // Find all orders with this email that don't have a userId
    const ordersToUpdate = await prisma.order.findMany({
      where: {
        customerEmail: email,
        userId: null
      }
    });

    console.log('Found orders to link:', ordersToUpdate.length);

    if (ordersToUpdate.length === 0) {
      return res.status(200).json({ 
        message: 'No orders found to link',
        linkedCount: 0 
      });
    }

    // Update all these orders with the userId
    const updateResult = await prisma.order.updateMany({
      where: {
        customerEmail: email,
        userId: null
      },
      data: {
        userId: userId
      }
    });

    console.log('Updated orders:', updateResult);

    return res.status(200).json({
      message: `Successfully linked ${updateResult.count} orders to user`,
      linkedCount: updateResult.count
    });

  } catch (error) {
    console.error('Error linking orders:', error);
    return res.status(500).json({ error: 'Failed to link orders' });
  }
}







