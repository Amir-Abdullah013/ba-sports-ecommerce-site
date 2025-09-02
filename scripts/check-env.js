// Environment Variables Checker
// Run this to verify your environment variables are set correctly

console.log('🔍 Checking Environment Variables...\n');

const requiredEnvVars = {
  'DATABASE_URL': process.env.DATABASE_URL,
  'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
  'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
  'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET,
  'NEXTAUTH_URL': process.env.NEXTAUTH_URL,
  'NODE_ENV': process.env.NODE_ENV,
};

let allGood = true;

console.log('📋 Required Server-Side Variables:');
console.log('=====================================');

for (const [name, value] of Object.entries(requiredEnvVars)) {
  const status = value ? '✅' : '❌';
  const displayValue = value ? (name.includes('SECRET') || name.includes('DATABASE') ? '[HIDDEN]' : value) : 'NOT SET';
  
  console.log(`${status} ${name}: ${displayValue}`);
  
  if (!value) {
    allGood = false;
  }
}

console.log('\n📋 Client-Side Variables (should be empty for server-side):');
console.log('=========================================================');

const clientSideVars = {
  'NEXT_PUBLIC_DATABASE_URL': process.env.NEXT_PUBLIC_DATABASE_URL,
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID': process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  'NEXT_PUBLIC_GOOGLE_CLIENT_SECRET': process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
  'NEXT_PUBLIC_NEXTAUTH_SECRET': process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
  'NEXT_PUBLIC_NODE_ENV': process.env.NEXT_PUBLIC_NODE_ENV,
};

let hasOldVars = false;

for (const [name, value] of Object.entries(clientSideVars)) {
  if (value) {
    console.log(`⚠️  ${name}: ${value} (SHOULD BE REMOVED)`);
    hasOldVars = true;
  } else {
    console.log(`✅ ${name}: Not set (correct)`);
  }
}

console.log('\n🎯 Summary:');
console.log('===========');

if (allGood && !hasOldVars) {
  console.log('✅ All environment variables are configured correctly!');
} else {
  if (!allGood) {
    console.log('❌ Missing required environment variables');
  }
  if (hasOldVars) {
    console.log('⚠️  Old NEXT_PUBLIC_ variables found - these should be removed');
  }
}

console.log('\n📝 Next Steps:');
console.log('===============');
if (!allGood || hasOldVars) {
  console.log('1. Update your Vercel environment variables');
  console.log('2. Remove NEXT_PUBLIC_ prefix from server-side variables');
  console.log('3. Redeploy your application');
  console.log('4. Check the VERCEL_ENV_UPDATE.md file for detailed instructions');
}
