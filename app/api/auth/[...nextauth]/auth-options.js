import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcrypt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import prisma from '@/lib/prisma';

const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember me', type: 'boolean' },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error(
            JSON.stringify({
              code: 400,
              message: 'Please enter both email and password.',
            }),
          );
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error(
            JSON.stringify({
              code: 404,
              message: 'User not found. Please register first.',
            }),
          );
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password || '',
        );

        if (!isPasswordValid) {
          throw new Error(
            JSON.stringify({
              code: 401,
              message: 'Invalid credentials. Incorrect password.',
            }),
          );
        }

        if (user.status !== 'ACTIVE') {
          throw new Error(
            JSON.stringify({
              code: 403,
              message: 'Account not activated. Please verify your email.',
            }),
          );
        }

        // Update `lastSignInAt` field
        await prisma.user.update({
          where: { id: user.id },
          data: { lastSignInAt: new Date() },
        });

        return {
          id: user.id,
          status: user.status,
          email: user.email,
          name: user.name || 'Anonymous',
          roleId: user.roleId,
          avatar: user.avatar,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
            async profile(profile) {
              const existingUser = await prisma.user.findUnique({
                where: { email: profile.email },
                include: {
                  role: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              });

              if (existingUser) {
                // Update `lastSignInAt` field for existing users
                await prisma.user.update({
                  where: { id: existingUser.id },
                  data: {
                    name: profile.name,
                    avatar: profile.picture || null,
                    lastSignInAt: new Date(),
                  },
                });

                return {
                  id: existingUser.id,
                  email: existingUser.email,
                  name: existingUser.name || 'Anonymous',
                  status: existingUser.status,
                  roleId: existingUser.roleId,
                  roleName: existingUser.role.slug,
                  avatar: existingUser.avatar,
                };
              }

              const defaultRole = await prisma.userRole.findFirst({
                where: { isDefault: true },
              });

              if (!defaultRole) {
                throw new Error(
                  'Default role not found. Unable to create a new user.',
                );
              }

              // Create a new user and account
              const newUser = await prisma.user.create({
                data: {
                  email: profile.email,
                  name: profile.name,
                  password: null, // No password for OAuth users
                  avatar: profile.picture || null,
                  emailVerifiedAt: new Date(),
                  roleId: defaultRole.id,
                  status: 'ACTIVE',
                },
              });

              return {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name || 'Anonymous',
                status: newUser.status,
                avatar: newUser.avatar,
                roleId: newUser.roleId,
                roleName: defaultRole.slug,
              };
            },
          }),
        ]
      : []),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, session, trigger }) {
      if (trigger === 'update' && session?.user) {
        token = session.user;
      } else {
        if (user && user.roleId) {
          const role = await prisma.userRole.findUnique({
            where: { id: user.roleId },
          });

          token.id = user.id || token.sub;
          token.email = user.email;
          token.name = user.name;
          token.avatar = user.avatar;
          token.status = user.status;
          token.roleId = user.roleId;
          token.roleName = role?.slug;
        } else if (token.id) {
          // Performance-optimized strategy: Smart caching with intelligent refresh
          const now = Date.now();
          const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
          const lastFetch = token.lastFetch || 0;

          // Check if we need to refresh data
          const shouldRefresh =
            !token.lastFetch || // First time
            now - lastFetch > CACHE_DURATION || // Cache expired
            token.forceRefresh; // Manual refresh requested

          if (shouldRefresh) {
            try {
              const currentUser = await prisma.user.findUnique({
                where: {
                  id: token.id,
                  isTrashed: false,
                  status: 'ACTIVE',
                },
                include: {
                  role: {
                    select: {
                      id: true,
                      slug: true,
                      name: true,
                    },
                  },
                },
              });

              if (!currentUser) {
                console.log(
                  `User ${token.id} not found or inactive, invalidating session`,
                );
                return null;
              }

              // Update token with fresh data and cache timestamp
              token.roleId = currentUser.roleId;
              token.roleName = currentUser.role?.slug;
              token.status = currentUser.status;
              token.email = currentUser.email;
              token.name = currentUser.name;
              token.avatar = currentUser.avatar;
              token.lastFetch = now;
              token.forceRefresh = false; // Reset force refresh flag
            } catch (error) {
              console.error('Error fetching user data in JWT callback:', error);
              // On database error, return null to invalidate session
              return null;
            }
          } else {
            // Use cached data - no database query needed
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      // If token is null (user not found/deleted), return null to invalidate session
      if (!token) {
        return null;
      }

      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.avatar = token.avatar;
        session.user.status = token.status;
        session.user.roleId = token.roleId;
        session.user.roleName = token.roleName;
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
};

export default authOptions;
