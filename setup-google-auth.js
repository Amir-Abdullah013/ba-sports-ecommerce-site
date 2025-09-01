#!/usr/bin/env node

/**
 * Google Authentication Setup Verification Script
 * Run this to check if your Google Cloud Console setup is correct
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Google Authentication Setup Verification\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('\n📝 Create .env.local with:');
  console.log(`
# NextAuth Configuration
NEXT_PUBLIC_NEXTAUTH_URL=http://localhost:3003
NEXT_PUBLIC_NEXTAUTH_SECRET=development-secret-key-minimum-32-characters-long-for-testing-purposes

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your-google-client-secret-here
  `);
  process.exit(1);
}

// Read and check .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

let hasClientId = false;
let hasClientSecret = false;
let hasNextAuthUrl = false;
let hasNextAuthSecret = false;

lines.forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_GOOGLE_CLIENT_ID=')) {
    hasClientId = true;
    const value = line.split('=')[1];
    if (value && value !== 'your-google-client-id-here') {
      console.log('✅ GOOGLE_CLIENT_ID is set');
    } else {
      console.log('⚠️  GOOGLE_CLIENT_ID needs to be updated with real value');
    }
  }
  if (line.startsWith('NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=')) {
    hasClientSecret = true;
    const value = line.split('=')[1];
    if (value && value !== 'your-google-client-secret-here') {
      console.log('✅ GOOGLE_CLIENT_SECRET is set');
    } else {
      console.log('⚠️  GOOGLE_CLIENT_SECRET needs to be updated with real value');
    }
  }
  if (line.startsWith('NEXT_PUBLIC_NEXTAUTH_URL=')) {
    hasNextAuthUrl = true;
    console.log('✅ NEXTAUTH_URL is set');
  }
  if (line.startsWith('NEXT_PUBLIC_NEXTAUTH_SECRET=')) {
    hasNextAuthSecret = true;
    console.log('✅ NEXTAUTH_SECRET is set');
  }
});

if (!hasClientId) console.log('❌ GOOGLE_CLIENT_ID is missing');
if (!hasClientSecret) console.log('❌ GOOGLE_CLIENT_SECRET is missing');
if (!hasNextAuthUrl) console.log('❌ NEXTAUTH_URL is missing');
if (!hasNextAuthSecret) console.log('❌ NEXTAUTH_SECRET is missing');

console.log('\n📋 Next Steps:');
console.log('1. Update .env.local with your real Google credentials');
console.log('2. Configure redirect URIs in Google Cloud Console');
console.log('3. Enable Gmail API in Google Cloud Console');
console.log('4. Run: npm run dev');
console.log('5. Visit: http://localhost:3003/demo-auth');
console.log('6. Test Google authentication');

console.log('\n📖 For detailed instructions, see: GOOGLE-CLOUD-SETUP-GUIDE.md');


