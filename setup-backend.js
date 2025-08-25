#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BA Sports Backend Setup Script');
console.log('==================================\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('📝 Please create .env.local file with the following content:');
  console.log(`
# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/ba_sports_db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3004"
NEXTAUTH_SECRET="your-super-secret-key-here-change-this-in-production"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
  `);
  console.log('\n⚠️  Please create the .env.local file and run this script again.');
  process.exit(1);
}

console.log('✅ .env.local file found');

// Check if Prisma is installed
try {
  require('@prisma/client');
  console.log('✅ Prisma Client is installed');
} catch (error) {
  console.log('❌ Prisma Client not found. Installing...');
  try {
    execSync('npm install @prisma/client prisma', { stdio: 'inherit' });
    console.log('✅ Prisma installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install Prisma:', installError.message);
    process.exit(1);
  }
}

// Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}

// Check if database is accessible
console.log('\n🗄️  Testing database connection...');
try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  // Test connection
  await prisma.$connect();
  console.log('✅ Database connection successful');
  await prisma.$disconnect();
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  console.log('\n🔧 Please ensure:');
  console.log('1. PostgreSQL is installed and running');
  console.log('2. Database "ba_sports_db" exists');
  console.log('3. DATABASE_URL in .env.local is correct');
  console.log('4. PostgreSQL user has proper permissions');
  process.exit(1);
}

// Run migrations
console.log('\n📊 Running database migrations...');
try {
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  console.log('✅ Database migrations completed');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

// Seed database
console.log('\n🌱 Seeding database with initial data...');
try {
  const { seedDatabase } = require('./src/lib/seed.js');
  const success = await seedDatabase();
  
  if (success) {
    console.log('✅ Database seeded successfully');
  } else {
    console.log('❌ Database seeding failed');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
}

// Test API endpoints
console.log('\n🔌 Testing API endpoints...');
try {
  // Test products endpoint
  const response = await fetch('http://localhost:3004/api/products');
  if (response.ok) {
    console.log('✅ Products API is working');
  } else {
    console.log('⚠️  Products API returned status:', response.status);
  }
} catch (error) {
  console.log('⚠️  Could not test API endpoints (server might not be running)');
  console.log('   Start the server with: npm run dev');
}

console.log('\n🎉 Backend setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Start the development server: npm run dev');
console.log('2. Test the website at: http://localhost:3004');
console.log('3. Check API endpoints: http://localhost:3004/api/products');
console.log('4. View database with Prisma Studio: npx prisma studio');
console.log('\n🚀 Your BA Sports backend is ready!');

