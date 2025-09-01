# 🚨 URGENT: Fix Your Vercel Deployment

Your site is still showing 500 errors because the environment variables haven't been updated in Vercel yet. Here's exactly what you need to do:

## Step 1: Check Current Environment Status

First, let's see what's wrong. Visit this diagnostic endpoint I created:
```
https://ba-sports-ecommerce-site.vercel.app/api/debug/environment
```

This will show you which environment variables are missing.

## Step 2: Update Vercel Environment Variables

### Go to Vercel Dashboard:
1. Visit: https://vercel.com/dashboard
2. Find your `ba-sports-ecommerce-site` project
3. Click on it
4. Go to **Settings** tab
5. Click **Environment Variables** in the left sidebar

### Add These Environment Variables:

**⚠️ CRITICAL: Remove any old variables with `NEXT_PUBLIC_` prefix first!**

Add these new variables:

```env
DATABASE_URL
Value: your-postgresql-database-url-here
Environment: Production, Preview, Development

NEXTAUTH_SECRET  
Value: your-super-secret-key-minimum-32-characters-long
Environment: Production, Preview, Development

NEXTAUTH_URL
Value: https://ba-sports-ecommerce-site.vercel.app
Environment: Production, Preview, Development

GOOGLE_CLIENT_ID
Value: your-google-client-id
Environment: Production, Preview, Development

GOOGLE_CLIENT_SECRET
Value: your-google-client-secret
Environment: Production, Preview, Development

NODE_ENV
Value: production
Environment: Production
```

### Remove These Old Variables (if they exist):
- `NEXT_PUBLIC_DATABASE_URL`
- `NEXT_PUBLIC_NEXTAUTH_SECRET`
- `NEXT_PUBLIC_NEXTAUTH_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_NODE_ENV`

## Step 3: Redeploy Your Application

After updating the environment variables:

1. **Option A - Force Redeploy:**
   - In Vercel dashboard → Deployments tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"

2. **Option B - Git Push:**
   ```bash
   git add .
   git commit -m "trigger redeploy after env var update"
   git push origin main
   ```

## Step 4: Verify the Fix

1. **Check the diagnostic endpoint:**
   ```
   https://ba-sports-ecommerce-site.vercel.app/api/debug/environment
   ```
   Should show all environment variables as `true`

2. **Test the APIs:**
   - https://ba-sports-ecommerce-site.vercel.app/api/products
   - https://ba-sports-ecommerce-site.vercel.app/api/categories?active=true
   - https://ba-sports-ecommerce-site.vercel.app/api/auth/session

3. **Test your website:**
   - https://ba-sports-ecommerce-site.vercel.app/products
   - Should load without 500 errors

## Step 5: Check Vercel Function Logs (If Still Issues)

If you still see errors:

1. Go to Vercel Dashboard → Your Project
2. Click **Functions** tab
3. Click on any function (e.g., `api/products.func`)
4. Click **View Function Logs**
5. Look for error messages and share them with me

## Common Issues & Solutions

### Issue: "Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON"
**Cause:** NextAuth is returning an HTML error page instead of JSON
**Solution:** Make sure `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set correctly

### Issue: Database connection failed
**Cause:** `DATABASE_URL` is not set or incorrect
**Solution:** Verify your database URL is correct and accessible

### Issue: Still seeing NEXT_PUBLIC_ errors
**Cause:** Old environment variables still exist
**Solution:** Delete all old `NEXT_PUBLIC_` prefixed variables

## After Fixing - Clean Up

Once everything works, delete the diagnostic endpoint:
```bash
rm src/pages/api/debug/environment.js
git add .
git commit -m "remove debug endpoint"
git push origin main
```

## Need Help?

If you're still having issues after following these steps:

1. Share the output from the diagnostic endpoint
2. Share any error messages from Vercel function logs
3. Confirm which environment variables you've set in Vercel

The fix is simple - just need to update those environment variables in Vercel! 🚀
