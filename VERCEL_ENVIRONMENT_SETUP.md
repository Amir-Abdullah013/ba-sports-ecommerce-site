# 🚀 Vercel Production Environment Setup Guide

## 🎯 **Environment Variables Configuration**

Add these environment variables in your Vercel dashboard:

### **1. Database Configuration (Supabase)**
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
```

**Important Notes:**
- Use the **Connection Pooler** URL from Supabase (not direct connection)
- Include `pgbouncer=true&connection_limit=1` for Vercel serverless compatibility
- Include `sslmode=require` for secure connections

### **2. NextAuth Configuration**
```bash
NEXTAUTH_SECRET="your-production-secret-here"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_TRUST_HOST=true
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### **3. Google OAuth Configuration**
```bash
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### **4. Optional Supabase Direct Access**
```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### **5. Environment**
```bash
NODE_ENV="production"
```

---

## 🔧 **Google Cloud Console Setup**

### **Step 1: Configure OAuth Consent Screen**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > OAuth consent screen**
3. Set **User Type** to "External"
4. Fill in application details:
   - App name: "Your E-commerce Site"
   - User support email: your-email@domain.com
   - Authorized domains: `your-domain.vercel.app`

### **Step 2: Create OAuth Credentials**
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client IDs**
3. Application type: "Web application"
4. Name: "Production Web Client"
5. **Authorized JavaScript origins:**
   ```
   https://your-domain.vercel.app
   ```
6. **Authorized redirect URIs:**
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```

---

## 📊 **Supabase Configuration**

### **Step 1: Get Connection String**
1. Go to your Supabase project dashboard
2. Navigate to **Settings > Database**
3. Find **Connection string > URI**
4. Copy the connection string
5. **Important:** Use the **Connection pooler** option for production

### **Step 2: Database URL Format**
```
postgresql://postgres:[PASSWORD]@[PROJECT-REF].pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

**Parameters Explained:**
- `pgbouncer=true`: Enable connection pooling
- `connection_limit=1`: Limit connections for serverless
- `sslmode=require`: Force SSL encryption

---

## 🔒 **Security Configuration**

### **Row Level Security (RLS)**
Ensure RLS is enabled on sensitive tables:

```sql
-- Enable RLS on User table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Admin can see all users
CREATE POLICY "Admin can view all users" ON "User"
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'ADMIN');

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON "User"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id);
```

---

## 🚀 **Deployment Steps**

### **Step 1: Vercel Deployment**
1. Connect your GitHub repository to Vercel
2. Import the project
3. Configure environment variables (see above)
4. Deploy

### **Step 2: Domain Configuration**
1. In Vercel dashboard, go to **Project Settings > Domains**
2. Add your custom domain (if using one)
3. Update `NEXTAUTH_URL` environment variable with final domain

### **Step 3: Google OAuth Update**
1. Update Google Cloud Console with final domain
2. Add production domain to authorized origins and redirect URIs

---

## 🐛 **Troubleshooting Production Issues**

### **API Routes Returning 500 Errors**
- Check database connection string format
- Verify Supabase is using connection pooler URL
- Check Vercel function logs for specific errors

### **NextAuth Sign-in Fails**
- Verify `NEXTAUTH_URL` matches your actual domain
- Check Google OAuth redirect URIs are correct
- Ensure `NEXTAUTH_SECRET` is set and secure

### **Database Connection Issues**
- Use connection pooler URL (not direct connection)
- Include `pgbouncer=true&connection_limit=1`
- Check Supabase project is not paused

### **405 Method Not Allowed on Auth**
- Ensure all auth API routes are deployed
- Check NextAuth configuration is complete
- Verify `NEXTAUTH_TRUST_HOST=true` is set

---

## ✅ **Production Checklist**

- [ ] Database URL uses connection pooler
- [ ] All environment variables are set in Vercel
- [ ] Google OAuth credentials are configured
- [ ] NEXTAUTH_URL matches production domain
- [ ] NEXTAUTH_SECRET is generated and secure
- [ ] Row Level Security policies are in place
- [ ] Test authentication flow
- [ ] Test API routes (/api/products, /api/categories)
- [ ] Verify admin access works
- [ ] Check error handling and fallbacks

---

## 🔍 **Testing Commands**

### **Test Database Connection**
```bash
curl https://your-domain.vercel.app/api/debug/production
```

### **Test Products API**
```bash
curl https://your-domain.vercel.app/api/products
```

### **Test Categories API**
```bash
curl https://your-domain.vercel.app/api/categories
```

### **Test Authentication**
```bash
# Visit in browser:
https://your-domain.vercel.app/api/auth/signin
```

---

## 📞 **Support**

If you encounter issues:
1. Check Vercel function logs
2. Check Supabase logs
3. Verify all environment variables are correctly set
4. Test each API endpoint individually

**Common Error Patterns:**
- `500 Internal Server Error`: Database connection issue
- `405 Method Not Allowed`: NextAuth configuration issue
- `Authentication Error`: Google OAuth setup issue
- `Connection Timeout`: Use connection pooler URL
