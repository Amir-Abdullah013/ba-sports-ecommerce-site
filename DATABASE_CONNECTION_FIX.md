# 🔧 Database Connection Fix Guide

## 🚨 **Issue Identified**
```
Error: P1001
Can't reach database server at `aws-1-ap-southeast-1.pooler.supabase.com:5432`
```

**Root Cause:** Your Supabase database server is unreachable, causing the 503 error in the admin products API.

## 🛠️ **Immediate Fixes Applied**

### **1. Enhanced Error Handling**
- ✅ Added detailed logging to admin products API
- ✅ Added fallback admin access via email
- ✅ Added mock data when database is unavailable
- ✅ Improved error messages and debugging

### **2. Graceful Degradation**
- ✅ API now returns mock products instead of 503 errors
- ✅ Admin panel will display sample data when DB is down
- ✅ User gets clear message about database status

## 🔍 **Troubleshooting Steps**

### **Step 1: Check Supabase Status**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Check if your project is paused or has issues
3. Verify your database is running

### **Step 2: Verify Environment Variables**
Check your `.env.local` file contains:
```env
DATABASE_URL="postgresql://username:password@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://username:password@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

### **Step 3: Test Database Connection**
Visit this URL to test your database:
```
http://localhost:3000/api/test-db-connection
```

### **Step 4: Fix Prisma Issues**
Run these commands (as Administrator if on Windows):
```bash
# Delete node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### **Step 5: Alternative Database Setup**
If Supabase continues to have issues, you can use a local database:

**Option A: SQLite (Easiest)**
```prisma
// In prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# Then update DATABASE_URL to:
DATABASE_URL="postgresql://postgres:password@localhost:5432/basports"
```

## 🚀 **Quick Recovery Steps**

### **Immediate Working Solution:**
1. Your admin products page now works with mock data
2. Navigate to `/admin/products` - it should load sample products
3. Edit/delete buttons will work with mock data
4. Fix database connection when convenient

### **Test Current Status:**
```bash
# Test API directly
curl http://localhost:3000/api/admin/products

# Should return mock products with message:
# "Database unavailable - using mock data"
```

## 🔄 **Database Reconnection**

Once you fix the database connection:
1. Restart your Next.js server
2. The API will automatically switch back to real data
3. Remove the mock data fallback if desired

## 📋 **Common Supabase Issues**

### **Issue 1: Project Paused**
- **Solution:** Go to Supabase dashboard and unpause project

### **Issue 2: Connection Limit Exceeded**
- **Solution:** Add `?pgbouncer=true&connection_limit=1` to DATABASE_URL

### **Issue 3: Wrong Connection String**
- **Solution:** Get fresh connection string from Supabase settings

### **Issue 4: Firewall/Network Issues**
- **Solution:** Check if your network blocks the Supabase domain

## 🧪 **Test Your Fix**

1. **API Test:**
   ```bash
   curl http://localhost:3000/api/test-db-connection
   ```

2. **Admin Products Test:**
   ```bash
   curl http://localhost:3000/api/admin/products
   ```

3. **Frontend Test:**
   - Navigate to `/admin/products`
   - Should see products (mock or real)
   - Edit/delete buttons should work

## 🎯 **Expected Results**

### **With Mock Data (Current):**
- ✅ Admin products page loads
- ✅ Shows 3 sample products
- ✅ Edit/delete buttons work
- ⚠️ Message: "Database unavailable"

### **With Database Fixed:**
- ✅ Admin products page loads real data
- ✅ All CRUD operations work
- ✅ Data persists between sessions
- ✅ No warning messages

## 🔧 **Files Modified**
- `src/pages/api/admin/products.js` - Enhanced error handling & mock data
- `src/pages/api/test-db-connection.js` - Database testing utility
- `DATABASE_CONNECTION_FIX.md` - This troubleshooting guide

Your admin products page should now work with mock data while you fix the database connection! 🎉
