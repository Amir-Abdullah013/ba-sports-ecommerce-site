# 🚀 Vercel Production Deployment Guide

## Required Environment Variables for Vercel

### 1. **NextAuth Configuration**
```bash
# CRITICAL: Must be your actual production URL
NEXTAUTH_URL=https://your-app-name.vercel.app

# Generate a random secret (32+ characters)
NEXTAUTH_SECRET=your-super-secret-random-string-32-characters-minimum

# OAuth Trust Host for Vercel
NEXTAUTH_TRUST_HOST=true
```

### 2. **Google OAuth Setup**
```bash
# From Google Cloud Console
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Important**: Update your Google OAuth settings:
- Go to Google Cloud Console → APIs & Services → Credentials
- Edit your OAuth 2.0 Client ID
- Add authorized redirect URI: `https://your-app-name.vercel.app/api/auth/callback/google`
- Add authorized JavaScript origins: `https://your-app-name.vercel.app`

### 3. **Supabase Database Configuration**
```bash
# Use the connection pooler URL for production (CRITICAL)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].pooler.supabase.com:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1&pool_timeout=20&statement_cache_size=0
```

**Important**: 
- Use the **Connection Pooler** URL from Supabase (not the direct URL)
- Enable Connection Pooling in Supabase Dashboard
- Use Transaction mode for better performance

## 🔧 Vercel Dashboard Setup

### Step 1: Add Environment Variables
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add all variables above for **Production** environment
4. Redeploy your application

### Step 2: Domain Configuration
1. If using custom domain, add it in Vercel dashboard
2. Update `NEXTAUTH_URL` to match your domain
3. Update Google OAuth settings with new domain

## 🛠️ Supabase Setup for Production

### 1. Connection Pooling
```sql
-- Enable connection pooling in Supabase
-- Go to Settings → Database → Connection Pooling
-- Enable "Pool Mode: Transaction"
-- Use the pooler URL in your DATABASE_URL
```

### 2. Database Configuration
```sql
-- Ensure your database has proper indexes
-- Run these in Supabase SQL Editor:

-- Optimize product queries
CREATE INDEX IF NOT EXISTS idx_products_active ON products(isActive);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(categoryId);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(isFeatured);

-- Optimize order queries  
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(userId);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customerEmail);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Optimize user queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

## 🚨 Common Production Issues & Solutions

### Issue 1: "SignIn callback failed"
**Solution**: 
- Verify `NEXTAUTH_URL` matches your exact domain
- Check Google OAuth redirect URIs
- Ensure `NEXTAUTH_SECRET` is set

### Issue 2: "Database connection failed"
**Solution**:
- Use Supabase Connection Pooler URL
- Enable connection pooling in Supabase
- Check DATABASE_URL format

### Issue 3: "Admin dashboard not accessible"
**Solution**:
- Ensure admin email is set correctly in auth.js
- Check user role in database
- Verify session token includes role

## ✅ Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Google OAuth redirect URIs updated
- [ ] Supabase connection pooling enabled
- [ ] Database indexes created
- [ ] Admin user created with correct role
- [ ] NextAuth URL matches production domain
- [ ] SSL certificates active
- [ ] Test sign in/out flow
- [ ] Test admin dashboard access
- [ ] Test product loading
- [ ] Test order creation

## 🔍 Debugging Production Issues

### Check Vercel Function Logs
1. Go to Vercel Dashboard → Functions tab
2. Click on any failed function
3. Check real-time logs for errors

### Check Database Connection
1. Use Supabase dashboard → SQL Editor
2. Run: `SELECT 1;` to test connection
3. Check connection pooler status

### Test Authentication Flow
1. Clear browser cache/cookies
2. Try sign in with admin email
3. Check browser console for errors
4. Verify JWT token contains role

## 📞 Emergency Fixes

### Quick Admin Access Fix
If admin access is broken, run this in Supabase SQL Editor:
```sql
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'amirabdullah2508@gmail.com';
```

### Quick Database Connection Fix
If connection pooling fails, try direct connection:
```bash
# Temporary - use direct URL (not recommended for production)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

---

**Remember**: After any environment variable changes, you MUST redeploy your application in Vercel!
