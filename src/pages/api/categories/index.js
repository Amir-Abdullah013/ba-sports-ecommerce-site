// FIXED: Added Node.js runtime for Prisma compatibility
export const config = {
  runtime: 'nodejs',
};

import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getCategories(req, res);
    case 'POST':
      return createCategory(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

// GET /api/categories - Get all categories
async function getCategories(req, res) {
  try {
    const { active } = req.query;

    const where = {};
    if (active === 'true') {
      where.isActive = true;
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return res.status(200).json({ categories });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

// POST /api/categories - Create a new category (Admin only)
async function createCategory(req, res) {
  try {
    const { name, description, image, slug } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ]
      }
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category with this name or slug already exists' });
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        description,
        image,
        slug
      }
    });

    return res.status(201).json({ category });

  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ error: 'Failed to create category' });
  }
}

