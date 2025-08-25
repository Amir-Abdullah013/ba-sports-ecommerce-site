// FIXED: Added Node.js runtime for Prisma compatibility
export const config = {
  runtime: 'nodejs',
};

import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  console.log('🔍 API Request:', req.method, req.url);
  console.log('🔍 Request body:', req.body);
  console.log('🔍 Query params:', req.query);
  
  const session = await getServerSession(req, res, authOptions);
  console.log('🔍 Session:', session);

  // Check if user is authenticated and is admin
  if (!session) {
    console.log('❌ No session found');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const isAdminEmail = session.user.email === 'amirabdullah2508@gmail.com';
  const isAdminRole = session.user.role === 'ADMIN';
  
  console.log('🔍 Admin check:', { email: session.user.email, role: session.user.role, isAdminEmail, isAdminRole });
  
  if (!isAdminEmail && !isAdminRole) {
    console.log('❌ Not admin');
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }

  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        // Get single product
        const product = await prisma.product.findUnique({
          where: { id },
          include: {
            category: true,
          },
        });

        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        console.log('📊 Database: Retrieved product:', product.id);
        return res.status(200).json(product);

      case 'PUT':
        // Update product
        const { name, description, price, category, stock, rating, image, images } = req.body;

        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
          where: { id },
          include: { category: true },
        });

        if (!existingProduct) {
          return res.status(404).json({ error: 'Product not found' });
        }

        // Find or create category
        let categoryRecord = await prisma.category.findUnique({
          where: { name: category },
        });

        if (!categoryRecord) {
          categoryRecord = await prisma.category.create({
            data: {
              name: category,
              slug: category.toLowerCase().replace(/\s+/g, '-'),
              description: `${category} products`,
            },
          });
        }

        // Update product
        const updatedProduct = await prisma.product.update({
          where: { id },
          data: {
            name: name || existingProduct.name,
            description: description || existingProduct.description,
            price: price ? parseFloat(price) : existingProduct.price,
            categoryId: categoryRecord.id,
            stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
            rating: rating !== undefined ? parseFloat(rating) : existingProduct.rating,
            image: image || existingProduct.image,
            images: images || existingProduct.images,
            slug: name ? name.toLowerCase().replace(/\s+/g, '-') : existingProduct.slug,
          },
          include: {
            category: true,
          },
        });

        console.log('✅ Database: Product updated successfully:', updatedProduct.id);
        return res.status(200).json(updatedProduct);

      case 'DELETE':
        // Delete product
        const productToDelete = await prisma.product.findUnique({
          where: { id },
        });

        if (!productToDelete) {
          return res.status(404).json({ error: 'Product not found' });
        }

        await prisma.product.delete({
          where: { id },
        });

        console.log('✅ Database: Product deleted successfully:', id);
        return res.status(200).json({ message: 'Product deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('❌ Database API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

