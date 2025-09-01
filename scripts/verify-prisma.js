#!/usr/bin/env node

/**
 * Verify Prisma installation and generate client
 * This script helps debug Prisma issues on Vercel
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Verifying Prisma installation...');

try {
  // Check if Prisma is installed
  console.log('📦 Checking Prisma installation...');
  execSync('npx prisma --version', { stdio: 'inherit' });
  
  // Check if schema exists
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  console.log('📄 Schema path:', schemaPath);
  
  // Generate Prisma client
  console.log('⚙️ Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('✅ Prisma setup completed successfully!');
  
} catch (error) {
  console.error('❌ Prisma setup failed:', error.message);
  process.exit(1);
}
