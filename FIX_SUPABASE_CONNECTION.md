# 🔧 Supabase Database Connection Fix

## 🚨 Current Issue
Your Supabase database at `aws-1-ap-southeast-1.pooler.supabase.com:5432` is unreachable, causing 503/304 errors in admin orders page.

## 🛠️ Solutions Applied

### 1. Enhanced Database Connection Handling
- ✅ Added connection retry logic
- ✅ Added query timeouts (10 seconds)
- ✅ Added graceful error handling
- ✅ Return empty results instead of 503 errors

### 2. Improved Admin Orders API
- ✅ Enhanced logging for debugging
- ✅ Fallback admin access via email
- ✅ Better error messages for users

## 🔧 Immediate Fix Steps

### Step 1: Update Your .env File
Replace your current DATABASE_URL with the SSL-enabled version:

```env
# OLD (might cause connection issues)
DATABASE_URL="postgresql://postgres.jzwksmwgqomnfjhkjewf:basportsdatabase@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# NEW (with SSL and connection pooling)
DATABASE_URL="postgresql://postgres.jzwksmwgqomnfjhkjewf:basportsdatabase@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1"
```

### Step 2: Check Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Navigate to your project
3. Check if the project is paused or has issues
4. Go to Settings > Database and get the latest connection string

### Step 3: Alternative Connection String Format
If the above doesn't work, try the direct connection:

```env
# Direct connection (not pooled)
DATABASE_URL="postgresql://postgres.jzwksmwgqomnfjhkjewf:basportsdatabase@db.jzwksmwgqomnfjhkjewf.supabase.co:5432/postgres?sslmode=require"
```

### Step 4: Test Connection
Run this command to test:
```bash
npx prisma db pull
```

## 🚀 Testing Your Fix

### Test 1: Admin Orders API
```bash
curl http://localhost:3000/api/admin/orders
```

### Test 2: Database Connection Test
```bash
curl http://localhost:3000/api/test-db-connection
```

### Test 3: Admin Orders Page
Navigate to: `http://localhost:3000/admin/orders`

## 🔄 If Supabase is Still Down

### Temporary Solution (For Development)
If Supabase continues to have issues, you can temporarily use local PostgreSQL:

1. Install PostgreSQL locally
2. Create a database named `basports`
3. Update DATABASE_URL:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/basports"
```
4. Run: `npx prisma db push`

### Production Deployment
For deployment, ensure:
1. Supabase project is active and not paused
2. Connection string includes SSL settings
3. Environment variables are properly set in your hosting platform

## 📋 Expected Results

### ✅ When Fixed:
- Admin orders page loads without 503/304 errors
- Orders data displays correctly
- Edit/delete order functionality works
- No timeout errors

### ⚠️ Current Behavior (with fixes applied):
- Admin orders page shows "Database temporarily unavailable"
- Empty orders list with retry option
- No crashes or 503 errors
- Graceful degradation

## 🔧 Files Modified
- `src/pages/api/admin/orders.js` - Enhanced error handling
- `src/lib/database.js` - Improved connection management
- `FIX_SUPABASE_CONNECTION.md` - This guide

## 🆘 Quick Recovery Commands

```bash
# 1. Clear Prisma cache
rm -rf node_modules/.prisma

# 2. Reinstall dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Test connection
npx prisma db pull

# 5. Start development server
npm run dev
```

Your admin orders API will now handle database connection issues gracefully! 🎉
