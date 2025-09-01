import prisma, { connectDatabase } from '../../../lib/prisma';

const defaultCategories = [
  {
    name: 'Football',
    description: 'Football equipment and accessories',
    slug: 'football',
    isActive: true
  },
  {
    name: 'Basketball',
    description: 'Basketball equipment and accessories',
    slug: 'basketball',
    isActive: true
  },
  {
    name: 'Cricket',
    description: 'Cricket equipment and accessories',
    slug: 'cricket',
    isActive: true
  },
  {
    name: 'Badminton',
    description: 'Badminton equipment and accessories',
    slug: 'badminton',
    isActive: true
  },
  {
    name: 'Running',
    description: 'Running shoes and accessories',
    slug: 'running',
    isActive: true
  },
  {
    name: 'Baseball',
    description: 'Baseball equipment and accessories',
    slug: 'baseball',
    isActive: true
  },
  {
    name: 'Soccer',
    description: 'Soccer equipment and accessories',
    slug: 'soccer',
    isActive: true
  },
  {
    name: 'Volleyball',
    description: 'Volleyball equipment and accessories',
    slug: 'volleyball',
    isActive: true
  }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDatabase(2);
    
    console.log('🌱 Adding default categories to database...');
    
    const addedCategories = [];
    const existingCategories = [];
    
    for (const category of defaultCategories) {
      // Check if category already exists
      const existing = await prisma.category.findUnique({
        where: { slug: category.slug }
      });
      
      if (!existing) {
        const newCategory = await prisma.category.create({
          data: category
        });
        addedCategories.push(newCategory);
        console.log(`✅ Added category: ${category.name}`);
      } else {
        existingCategories.push(existing);
        console.log(`⚠️  Category already exists: ${category.name}`);
      }
    }
    
    // Get all categories
    const allCategories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    
    return res.status(200).json({
      success: true,
      message: `Added ${addedCategories.length} new categories`,
      added: addedCategories,
      existing: existingCategories,
      total: allCategories
    });
    
  } catch (error) {
    console.error('❌ Error adding categories:', error);
    return res.status(500).json({
      error: 'Failed to add categories',
      details: error.message
    });
  }
}
