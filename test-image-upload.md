# Image Upload Fix - Test Guide

## ✅ What I Fixed:

1. **Increased Next.js body size limit** from 1MB to 10MB
2. **Added specific body size limit** to admin products API route
3. **Optimized image processing** to reduce file sizes before upload
4. **Reduced max file size** from 5MB to 2MB for better performance

## 🧪 How to Test:

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Go to admin products page**:
   ```
   http://localhost:3000/admin/products
   ```

3. **Click "Add Product"** button

4. **Fill in the product details**:
   - Name: "Cricket Gloves"
   - Description: "Premium cricket gloves offering comfort, grip, protection, and durability."
   - Price: 70
   - Original Price: 100
   - Category: Cricket
   - Stock: 50
   - Rating: 4.5

5. **Upload images**:
   - Click on the image upload areas
   - Select image files (JPG, PNG, etc.)
   - Images will be automatically optimized and compressed

6. **Submit the form** - should now work without the 413 error!

## 🔧 Technical Changes Made:

### 1. Next.js Configuration (`next.config.mjs`):
```javascript
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

### 2. Admin Products API (`src/pages/api/admin/products.js`):
```javascript
export const config = {
  runtime: 'nodejs',
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
```

### 3. Image Optimization (`src/pages/admin/products.js`):
- Reduced max file size from 5MB to 2MB
- Added automatic image resizing (max 800px)
- Added JPEG compression (70% quality)
- Optimized base64 conversion

## 🎯 Expected Results:

- ✅ No more "Body exceeded 1mb limit" errors
- ✅ Faster image uploads due to optimization
- ✅ Smaller payload sizes
- ✅ Better performance overall

## 🚨 If Issues Persist:

1. **Clear browser cache** and try again
2. **Restart the development server** completely
3. **Check browser console** for any JavaScript errors
4. **Try with smaller images** first (under 1MB)

The fix should resolve the 413 error and allow you to successfully add products with images!
