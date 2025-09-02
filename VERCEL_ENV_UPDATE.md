# Vercel Environment Variables Update Guide

## CRITICAL: Add Missing Environment Variables on Vercel

Based on your current setup, you need to ADD the missing `NEXT_PUBLIC_` prefixed variables to match your working configuration:

### 1. Go to Vercel Dashboard
- Visit https://vercel.com/dashboard
- Select your project: `ba-sports-ecommerce-site`
- Go to Settings → Environment Variables

### 2. ADD These Missing Variables (with NEXT_PUBLIC_ prefix):

**Current Vercel Variables (KEEP THESE):**
```
DATABASE_URL=your_database_url
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=your_nextauth_url
NODE_ENV=production
```

**ADD THESE MISSING VARIABLES:**
```
NEXT_PUBLIC_DATABASE_URL=your_database_url (same value as DATABASE_URL)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id (same value as GOOGLE_CLIENT_ID)
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret (same value as GOOGLE_CLIENT_SECRET)
NEXT_PUBLIC_NEXTAUTH_SECRET=your_nextauth_secret (same value as NEXTAUTH_SECRET)
NEXT_PUBLIC_NEXTAUTH_URL=your_nextauth_url (same value as NEXTAUTH_URL)
NEXT_PUBLIC_NODE_ENV=production
```

### 3. Steps to Update:

1. **Keep all existing variables** (don't delete anything)
2. **Add the new NEXT_PUBLIC_ variables** with the same values
3. **Deploy the changes** - Vercel will automatically redeploy

### 4. Why This Fix Works:

- Your code was working before because it expected `NEXT_PUBLIC_` variables
- We temporarily removed them, but that broke your working setup
- Now we're adding them back to match your working configuration
- The brand filtering will work with the existing setup

### 5. After adding the missing variables:

The site should work properly with:
- ✅ Product loading
- ✅ Authentication 
- ✅ Admin functionality
- ✅ Brand filtering

### 6. If issues persist:

1. Check Vercel deployment logs
2. Verify all environment variables are set correctly
3. Try a manual redeploy from Vercel dashboard
