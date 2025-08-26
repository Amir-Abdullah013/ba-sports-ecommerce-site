# 🚀 Production Deployment Checklist

## ✅ **Pre-Deployment Steps**

### **1. Environment Variables Setup**
- [ ] Set `DATABASE_URL` with Supabase connection pooler
- [ ] Set `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Set `NEXTAUTH_TRUST_HOST=true`
- [ ] Set `GOOGLE_CLIENT_ID` from Google Cloud Console
- [ ] Set `GOOGLE_CLIENT_SECRET` from Google Cloud Console
- [ ] Set `NODE_ENV=production`

### **2. Google OAuth Configuration**
- [ ] Create OAuth 2.0 credentials in Google Cloud Console
- [ ] Add authorized JavaScript origins: `https://your-domain.vercel.app`
- [ ] Add authorized redirect URIs: `https://your-domain.vercel.app/api/auth/callback/google`
- [ ] Configure OAuth consent screen

### **3. Database Setup**
- [ ] Verify Supabase project is active
- [ ] Run database migrations: `npx prisma db push`
- [ ] Verify connection pooling is enabled
- [ ] Test database connection

## 🔧 **Deployment Steps**

### **1. Deploy to Vercel**
```bash
# Connect repository to Vercel
vercel --prod

# Or through Vercel dashboard
```

### **2. Configure Environment Variables in Vercel**
1. Go to Vercel Dashboard > Project > Settings > Environment Variables
2. Add all required environment variables
3. Redeploy after adding variables

### **3. Test Deployment**
- [ ] Visit production URL
- [ ] Test sign-in functionality
- [ ] Verify products load correctly
- [ ] Test admin access
- [ ] Check API endpoints

## 🧪 **Testing Endpoints**

### **Health Check**
```bash
curl https://your-domain.vercel.app/api/debug/health
```

### **Production Verification**
```bash
curl https://your-domain.vercel.app/api/verify/production
```

### **Products API**
```bash
curl https://your-domain.vercel.app/api/products
```

### **Categories API**
```bash
curl https://your-domain.vercel.app/api/categories
```

## 🐛 **Common Issues & Solutions**

### **API Routes Return 500 Error**
- **Cause**: Database connection issues
- **Solution**: 
  - Verify `DATABASE_URL` uses connection pooler
  - Check Supabase project is not paused
  - Ensure `pgbouncer=true&connection_limit=1` parameters

### **NextAuth Sign-in Fails**
- **Cause**: OAuth configuration issues
- **Solution**:
  - Verify Google OAuth redirect URIs match production domain
  - Check `NEXTAUTH_URL` matches actual deployment URL
  - Ensure `NEXTAUTH_SECRET` is set

### **405 Method Not Allowed on Auth**
- **Cause**: NextAuth API routes not properly deployed
- **Solution**:
  - Verify `/api/auth/[...nextauth].js` exists
  - Check all auth-related environment variables
  - Redeploy after adding missing variables

### **Database Connection Timeout**
- **Cause**: Serverless function timeout
- **Solution**:
  - Use connection pooler URL (not direct connection)
  - Reduce database query timeout in production
  - Implement proper error handling

## 📊 **Monitoring & Debugging**

### **Vercel Function Logs**
1. Go to Vercel Dashboard > Project > Functions
2. Click on any function to view logs
3. Look for errors and performance metrics

### **Database Monitoring**
1. Go to Supabase Dashboard > Settings > Database
2. Check connection pooler statistics
3. Monitor active connections

### **Custom Debug Endpoints**
- `/api/debug/health` - System health check
- `/api/verify/production` - Comprehensive verification

## 🔒 **Security Checklist**

### **Database Security**
- [ ] Row Level Security (RLS) policies enabled
- [ ] Service role key kept secure
- [ ] Connection string uses SSL
- [ ] API keys stored in environment variables only

### **Authentication Security**
- [ ] NEXTAUTH_SECRET is cryptographically secure
- [ ] Google OAuth scope limited to necessary permissions
- [ ] Admin roles properly assigned
- [ ] Session timeouts configured

### **API Security**
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented (if needed)
- [ ] Error messages don't expose sensitive data
- [ ] HTTPS enforced

## 🚀 **Performance Optimization**

### **Database Performance**
- [ ] Connection pooling enabled
- [ ] Indexes created for frequently queried fields
- [ ] Query optimization implemented
- [ ] Pagination on large datasets

### **API Performance**
- [ ] Response caching headers set
- [ ] Efficient Prisma queries
- [ ] Error handling with graceful degradation
- [ ] Timeout configurations optimized

### **Frontend Performance**
- [ ] Static generation where possible
- [ ] Image optimization enabled
- [ ] Loading states implemented
- [ ] Error boundaries in place

## 📋 **Post-Deployment Verification**

### **Functionality Tests**
- [ ] User registration/sign-in works
- [ ] Products display correctly
- [ ] Categories filter properly
- [ ] Admin panel accessible
- [ ] Order placement works
- [ ] Database operations succeed

### **Performance Tests**
- [ ] Page load times under 3 seconds
- [ ] API response times under 1 second
- [ ] No memory leaks in serverless functions
- [ ] Database queries optimized

### **Error Handling Tests**
- [ ] Network failures handled gracefully
- [ ] Database timeouts don't crash app
- [ ] Invalid inputs properly validated
- [ ] User-friendly error messages shown

## 🆘 **Emergency Rollback Plan**

### **If Deployment Fails**
1. Check Vercel function logs for specific errors
2. Verify all environment variables are set correctly
3. Test individual API endpoints
4. Rollback to previous deployment if needed

### **Database Issues**
1. Check Supabase project status
2. Verify connection string format
3. Test database connectivity manually
4. Contact Supabase support if needed

### **Auth Issues**
1. Verify Google OAuth configuration
2. Check NextAuth environment variables
3. Test auth flow step by step
4. Review Google Cloud Console settings

## 📞 **Support Resources**

- **Vercel Documentation**: https://vercel.com/docs
- **NextAuth.js Documentation**: https://next-auth.js.org
- **Supabase Documentation**: https://supabase.com/docs
- **Prisma Documentation**: https://www.prisma.io/docs

## ✅ **Final Verification**

Before going live, ensure:
- [ ] All checklist items completed
- [ ] All tests passing
- [ ] Performance metrics acceptable
- [ ] Error handling working
- [ ] Security measures in place
- [ ] Monitoring set up
- [ ] Backup and recovery plan ready

Your e-commerce website is now ready for production! 🎉
