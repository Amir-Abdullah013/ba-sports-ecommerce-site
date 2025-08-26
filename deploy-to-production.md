# 🚀 Quick Production Deployment Guide

## 🎯 **Immediate Actions Required**

### **1. Set Environment Variables in Vercel**
Go to your Vercel dashboard and add these environment variables:

```bash
# Database (Replace with your actual Supabase credentials)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT-REF].pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require"

# NextAuth (Generate secret with: openssl rand -base64 32)
NEXTAUTH_SECRET="[GENERATE-SECURE-SECRET]"
NEXTAUTH_URL="https://[YOUR-VERCEL-DOMAIN].vercel.app"
NEXTAUTH_TRUST_HOST=true

# Google OAuth (From Google Cloud Console)
GOOGLE_CLIENT_ID="[YOUR-CLIENT-ID].apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="[YOUR-CLIENT-SECRET]"

# Environment
NODE_ENV=production
```

### **2. Configure Google OAuth**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Create OAuth 2.0 Client ID with:
   - **Authorized origins**: `https://[YOUR-VERCEL-DOMAIN].vercel.app`
   - **Redirect URIs**: `https://[YOUR-VERCEL-DOMAIN].vercel.app/api/auth/callback/google`

### **3. Get Supabase Connection String**
1. Go to your Supabase project dashboard
2. Settings > Database > Connection string > URI
3. **Important**: Use the **Connection pooler** option (not direct connection)
4. Format: `postgresql://postgres:[PASSWORD]@[PROJECT].pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require`

### **4. Deploy and Test**
1. Push your code to GitHub
2. Vercel will automatically redeploy
3. Test these endpoints:
   - `https://[YOUR-DOMAIN]/api/debug/health` - System health
   - `https://[YOUR-DOMAIN]/api/products` - Products API
   - `https://[YOUR-DOMAIN]/api/categories` - Categories API
   - `https://[YOUR-DOMAIN]/api/auth/signin` - Authentication

## 🔧 **What's Been Fixed**

### ✅ **API Routes (500 Errors)**
- Added proper database connection handling
- Implemented connection pooling for Vercel serverless
- Added graceful error handling and fallbacks
- Fixed timeout issues with shorter retry logic

### ✅ **NextAuth Google Sign-in**
- Fixed NEXTAUTH_URL configuration for Vercel
- Added proper protocol handling (https://)
- Implemented database connection timeouts
- Added comprehensive error logging
- Fixed trust host configuration

### ✅ **Supabase Database Connection**
- Optimized Prisma client for serverless functions
- Added connection pooling configuration
- Implemented proper singleton pattern
- Added connection retry logic with exponential backoff
- Fixed SSL and PgBouncer parameters

### ✅ **Environment Variables**
- Created comprehensive environment setup guide
- Added validation and health check endpoints
- Provided secure configuration templates
- Added debugging tools for production

## 🧪 **Testing After Deployment**

### **Quick Test Commands**
```bash
# Health check
curl https://[YOUR-DOMAIN]/api/debug/health

# Comprehensive verification
curl https://[YOUR-DOMAIN]/api/verify/production

# Test products API
curl https://[YOUR-DOMAIN]/api/products

# Test categories API
curl https://[YOUR-DOMAIN]/api/categories
```

### **Manual Testing**
1. Visit your production site
2. Try to sign in with Google
3. Browse products
4. Test admin access (if you have admin email)
5. Check browser console for errors

## 🐛 **If Issues Persist**

### **Check Vercel Function Logs**
1. Go to Vercel Dashboard > Your Project > Functions
2. Click on any function to see logs
3. Look for specific error messages

### **Common Solutions**
- **500 Errors**: Check database connection string format
- **Auth Errors**: Verify Google OAuth redirect URIs
- **Database Timeout**: Ensure using connection pooler URL
- **Environment**: Make sure all variables are set in Vercel

## 📞 **Emergency Troubleshooting**

If your site is still having issues:

1. **Database Issues**: 
   - Verify Supabase project is not paused
   - Check connection string includes `pooler.supabase.com`
   - Ensure `pgbouncer=true&connection_limit=1` parameters

2. **Auth Issues**:
   - Verify `NEXTAUTH_URL` matches your actual domain
   - Check Google OAuth settings in Cloud Console
   - Ensure `NEXTAUTH_SECRET` is set

3. **API Issues**:
   - Test individual endpoints with curl
   - Check Vercel function logs for specific errors
   - Verify all environment variables are properly set

Your production deployment should now be working correctly! 🎉

**Next Steps**: 
- Monitor the health check endpoint
- Set up alerts for any production issues
- Consider implementing rate limiting if needed
- Add monitoring dashboards
