# Environment Variables Setup for BA Sports

## Critical Issue Fixed

Your application was using `NEXT_PUBLIC_` prefixed environment variables for sensitive data like database URLs and secrets. This was causing:

1. **Security vulnerability** - Sensitive data exposed to client-side
2. **500 errors in production** - Environment variables not accessible on server-side
3. **Authentication failures** - NextAuth secrets not properly configured

## Required Environment Variables

### For Vercel Production Deployment

Set these in your Vercel project settings (Project → Settings → Environment Variables):

```env
# Database Configuration (CRITICAL - NO NEXT_PUBLIC_ PREFIX)
DATABASE_URL="your-postgresql-database-url-here"

# NextAuth Configuration (CRITICAL - NO NEXT_PUBLIC_ PREFIX)
NEXTAUTH_SECRET="your-super-secret-key-minimum-32-characters-long"
NEXTAUTH_URL="https://ba-sports-ecommerce-site.vercel.app"

# Google OAuth Configuration (CRITICAL - NO NEXT_PUBLIC_ PREFIX)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Environment
NODE_ENV="production"
```

### For Local Development (.env.local)

```env
# Database Configuration
DATABASE_URL="your-postgresql-database-url-here"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-minimum-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Environment
NODE_ENV="development"
```

## What Was Changed

### 1. Fixed Environment Variable Usage
- Removed `NEXT_PUBLIC_` prefix from all sensitive variables
- Updated all files to use proper server-side environment variables:
  - `src/lib/prisma.js`
  - `src/lib/auth.js`
  - `src/pages/api/products/index.js`
  - `src/pages/api/categories/index.js`
  - `prisma/schema.prisma`

### 2. Fixed API Error Handling
- Changed status codes from 200 to proper HTTP error codes:
  - `500` for server configuration errors
  - `503` for database connection issues
  - Maintained proper error messages and debugging info

### 3. Security Improvements
- Database URLs and secrets are now server-side only
- Proper environment variable isolation
- Enhanced error handling without exposing sensitive data

## Next Steps

1. **Update Vercel Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add the variables listed above with your actual values

2. **Redeploy Your Application**:
   ```bash
   git add .
   git commit -m "fix: environment variables and API error handling"
   git push origin main
   ```

3. **Verify Database Connection**:
   - Ensure your database URL is correct and accessible
   - Check that your database is active and accepting connections

4. **Test the APIs**:
   - Visit: https://ba-sports-ecommerce-site.vercel.app/api/products
   - Should now return proper responses instead of 500 errors

## Important Notes

- **Never use `NEXT_PUBLIC_` prefix for sensitive data**
- **Always use proper HTTP status codes in APIs**
- **Environment variables without `NEXT_PUBLIC_` are server-side only**
- **Redeploy after changing environment variables in Vercel**

## Troubleshooting

If you still see 500 errors:

1. Check Vercel function logs: Project → Functions → View function logs
2. Verify all environment variables are set correctly
3. Ensure your database is accessible from Vercel's servers
4. Check that your database connection string includes proper SSL settings if required
