import GoogleProvider from 'next-auth/providers/google';
// FIXED: Updated to use singleton Prisma client
import prisma from './prisma';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    })
  ],
  secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
  // PRODUCTION FIX: Explicit URL configuration for Vercel with proper protocol
  url: process.env.NEXT_PUBLICNEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
  callbacks: {
    async jwt({ token, account, profile, trigger, session }) {
      // Handle account switching
      if (trigger === "update" && session?.switchAccount) {
        // User is switching accounts - clear current token data
        return {
          ...token,
          accessToken: null,
          refreshToken: null,
          shouldSwitchAccount: true
        };
      }

      // Persist the OAuth access_token and refresh_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at;
        token.shouldSwitchAccount = false;
      }
      
      // Add user info to token and create/update user in database
      if (profile) {
        try {
          // PRODUCTION FIX: Add connection timeout for database operations
          const isAdminEmail = profile.email === 'amirabdullah2508@gmail.com';
          
          // PRODUCTION FIX: Shorter timeout for serverless functions
          const dbTimeout = process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? 5000 : 10000;
          
          // Find or create user in database with timeout
          let user = await Promise.race([
            prisma.user.findUnique({
              where: { email: profile.email }
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database timeout')), dbTimeout)
            )
          ]);
          
          if (!user) {
            // Create new user with admin role if admin email
            user = await Promise.race([
              prisma.user.create({
                data: {
                  email: profile.email,
                  name: profile.name,
                  image: profile.picture,
                  emailVerified: new Date(),
                  role: isAdminEmail ? 'ADMIN' : 'USER'
                }
              }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database timeout')), dbTimeout)
              )
            ]);
          } else {
            // Update existing user - FORCE admin role for admin email
            user = await Promise.race([
              prisma.user.update({
                where: { email: profile.email },
                data: {
                  name: profile.name,
                  image: profile.picture,
                  emailVerified: new Date(),
                  role: isAdminEmail ? 'ADMIN' : user.role
                }
              }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database timeout')), dbTimeout)
              )
            ]);
          }

          // Set the database user ID
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.picture = user.image;
          token.role = user.role;
          
          console.log('✅ User authenticated successfully:', {
            email: user.email,
            role: user.role,
            isAdmin: user.role === 'ADMIN'
          });
          
        } catch (error) {
          console.error('❌ Error creating/updating user in database:', error);
          
          // PRODUCTION FIX: Enhanced fallback for database failures
          const isAdminEmail = profile.email === 'amirabdullah2508@gmail.com';
          token.id = profile.sub;
          token.email = profile.email;
          token.name = profile.name;
          token.picture = profile.picture;
          token.role = isAdminEmail ? 'ADMIN' : 'USER'; // Ensure admin gets admin role even if DB fails
          
          console.log('⚠️ Using fallback auth for:', {
            email: profile.email,
            role: token.role,
            reason: error.message
          });
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.picture;
      session.user.role = token.role;
      session.shouldSwitchAccount = token.shouldSwitchAccount;

      // Force refresh session if admin email but wrong role
      if (token.email === 'amirabdullah2508@gmail.com' && token.role !== 'ADMIN') {
        console.log('Session callback: Admin email detected but wrong role, forcing refresh');
        // This will trigger a new JWT callback
        token.role = 'ADMIN';
      }

      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Allow sign in
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 NextAuth redirect:', { url, baseUrl });
      
      // PRODUCTION FIX: Handle Vercel URLs properly
      const productionBaseUrl = process.env.NEXT_PUBLIC_NEXTAUTH_URL || baseUrl;
      
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        const redirectUrl = `${productionBaseUrl}${url}`;
        console.log('✅ Redirecting to relative URL:', redirectUrl);
        return redirectUrl;
      }
      
      // Allows callback URLs on the same origin
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(productionBaseUrl);
        if (urlObj.origin === baseUrlObj.origin) {
          console.log('✅ Redirecting to same origin:', url);
          return url;
        }
      } catch (e) {
        console.error('❌ URL parsing error:', e);
      }
      
      console.log('✅ Redirecting to base URL:', productionBaseUrl);
      return productionBaseUrl;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout', 
    error: '/auth/error',
  },
  debug: process.env.NEXT_PUBLIC_NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // PRODUCTION FIX: Ensure trust host for Vercel
  trustHost: true,
  // PRODUCTION FIX: Add explicit configuration for better error handling
  events: {
    async signIn({ user, account, profile }) {
      console.log('✅ User signed in:', { 
        email: user.email, 
        provider: account?.provider,
        role: user.role 
      });
    },
    async signOut({ token }) {
      console.log('👋 User signed out:', { email: token?.email });
    },
    async createUser({ user }) {
      console.log('🆕 New user created:', { email: user.email });
    },
    async session({ session, token }) {
      console.log('🔄 Session accessed:', { 
        email: session.user?.email,
        role: session.user?.role 
      });
    }
  },
  // PRODUCTION FIX: Add logger for debugging
  logger: {
    error(code, metadata) {
      console.error('❌ NextAuth Error:', { code, metadata });
    },
    warn(code) {
      console.warn('⚠️ NextAuth Warning:', code);
    },
    debug(code, metadata) {
      if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') {
        console.log('🐛 NextAuth Debug:', { code, metadata });
      }
    }
  }
};
