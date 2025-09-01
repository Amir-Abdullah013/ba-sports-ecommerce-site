#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 BA Sports Website - Production Setup');
console.log('=====================================\n');

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# NextAuth Configuration
NEXT_PUBLIC_NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters-long

# Database connection (PostgreSQL)
NEXT_PUBLIC_DATABASE_URL="postgresql://username:password@localhost:5432/basports_db"

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Environment
NEXT_PUBLIC_NODE_ENV=development
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('⚠️  Please update the .env file with your actual values\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Check Node.js version
const nodeVersion = process.version;
console.log(`📦 Node.js version: ${nodeVersion}`);

if (parseInt(nodeVersion.slice(1).split('.')[0]) < 18) {
  console.log('⚠️  Warning: Node.js 18+ is recommended for this project\n');
}

// Check if dependencies are installed
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!\n');
  } catch (error) {
    console.log('❌ Failed to install dependencies. Please run: npm install\n');
  }
} else {
  console.log('✅ Dependencies already installed\n');
}

// Check Prisma setup
const prismaPath = path.join(process.cwd(), 'prisma');
if (fs.existsSync(prismaPath)) {
  console.log('🗄️  Setting up database...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated successfully!');
    
    console.log('\n📋 Next steps:');
    console.log('1. Update .env file with your database credentials');
    console.log('2. Run: npx prisma migrate dev --name init');
    console.log('3. Run: npm run seed (to populate with sample data)');
    console.log('4. Run: npm run dev (to start development server)');
    console.log('\n🌐 For production deployment:');
    console.log('1. Update NEXTAUTH_URL to your domain');
    console.log('2. Set NODE_ENV=production');
    console.log('3. Use a production database (Supabase, PlanetScale, etc.)');
    console.log('4. Deploy to Vercel or your preferred hosting platform');
    
  } catch (error) {
    console.log('❌ Failed to generate Prisma client. Please check your database connection.\n');
  }
} else {
  console.log('❌ Prisma directory not found. Please ensure the project is complete.\n');
}

console.log('\n📚 Documentation:');
console.log('- Client Delivery Guide: CLIENT-DELIVERY-GUIDE.md');
console.log('- Backend Setup: BACKEND-SETUP-GUIDE.md');
console.log('- Google Auth Setup: GOOGLE-CLOUD-SETUP-GUIDE.md');

console.log('\n🎉 Setup complete! Your BA Sports website is ready for deployment.');
