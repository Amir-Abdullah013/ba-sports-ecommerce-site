import GoogleProvider from 'next-auth/providers/google';
// FIXED: Updated to use singleton Prisma client
import prisma from './prisma';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
          // Find or create user in database
          let user = await prisma.user.findUnique({
            where: { email: profile.email }
          });

          // Check if this is the admin email
          const isAdminEmail = profile.email === 'amirabdullah2508@gmail.com';
          
          if (!user) {
            // Create new user
            user = await prisma.user.create({
              data: {
                email: profile.email,
                name: profile.name,
                image: profile.picture,
                emailVerified: new Date(),
                role: isAdminEmail ? 'ADMIN' : 'USER'
              }
            });
          } else {
            // Update existing user - FORCE admin role for admin email
            user = await prisma.user.update({
              where: { email: profile.email },
              data: {
                name: profile.name,
                image: profile.picture,
                emailVerified: new Date(),
                role: isAdminEmail ? 'ADMIN' : user.role // Force ADMIN role for admin email
              }
            });
          }
          
          // Double-check: If this is admin email, ensure role is ADMIN
          if (isAdminEmail && user.role !== 'ADMIN') {
            user = await prisma.user.update({
              where: { email: profile.email },
              data: { role: 'ADMIN' }
            });
          }

          // Set the database user ID
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.picture = user.image;
          token.role = user.role;
          
          // Store account in localStorage for account switching
          if (typeof window !== 'undefined') {
            const accounts = JSON.parse(localStorage.getItem('userAccounts') || '[]');
            const existingAccount = accounts.find(acc => acc.email === profile.email);
            
            if (!existingAccount) {
              accounts.push({
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.image,
                lastUsed: new Date().toISOString()
              });
              localStorage.setItem('userAccounts', JSON.stringify(accounts));
            } else {
              // Update last used time
              existingAccount.lastUsed = new Date().toISOString();
              existingAccount.name = user.name;
              existingAccount.picture = user.image;
              localStorage.setItem('userAccounts', JSON.stringify(accounts));
            }
          }
        } catch (error) {
          console.error('Error creating/updating user:', error);
          // Fallback to profile.sub if database operation fails
          token.id = profile.sub;
          token.email = profile.email;
          token.name = profile.name;
          token.picture = profile.picture;
          token.role = 'USER'; // Default role
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
      // Check if this is the admin email and redirect to admin page
      if (url.includes('amirabdullah2508@gmail.com') || url.includes('admin')) {
        return `${baseUrl}/admin`;
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout', 
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
