const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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

async function addCategories() {
  try {
    console.log('🌱 Adding default categories to database...');
    
    for (const category of defaultCategories) {
      // Check if category already exists
      const existing = await prisma.category.findUnique({
        where: { slug: category.slug }
      });
      
      if (!existing) {
        await prisma.category.create({
          data: category
        });
        console.log(`✅ Added category: ${category.name}`);
      } else {
        console.log(`⚠️  Category already exists: ${category.name}`);
      }
    }
    
    console.log('🎉 Categories setup completed!');
    
    // List all categories
    const allCategories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    
    console.log('\n📋 Current categories in database:');
    allCategories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug})`);
    });
    
  } catch (error) {
    console.error('❌ Error adding categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCategories();
