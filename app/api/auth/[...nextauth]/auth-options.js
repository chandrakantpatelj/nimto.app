import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcrypt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import prisma from '@/lib/prisma';

const authOptions = {
  adapter: PrismaAdapter(prisma),
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

        // Get user role information
        const userWithRole = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            role: {
              select: {
                id: true,
                name: true,
                slug: true,
                isProtected: true,
                isDefault: true
              }
            }
          }
        });

        return {
          id: user.id,
          status: user.status,
          email: user.email,
          name: user.name || 'Anonymous',
          roleId: user.roleId,
          avatar: user.avatar,
          role: userWithRole?.role
        };
      },
    }),
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
            role: existingUser.role,
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
            password: '', // No password for OAuth users
            avatar: profile.picture || null,
            emailVerifiedAt: new Date(),
            roleId: defaultRole.id,
            status: 'ACTIVE',
          },
          include: {
            role: {
              select: {
                id: true,
                name: true,
                slug: true,
                isProtected: true,
                isDefault: true
              }
            }
          }
        });

        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name || 'Anonymous',
          status: newUser.status,
          avatar: newUser.avatar,
          roleId: newUser.roleId,
          role: newUser.role,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, session, trigger }) {
      if (trigger === 'update' && session?.user) {
        token = session.user;
      } else if (user) {
        // Always fetch the role from database to ensure we have the latest data
        let role = null;
        if (user.roleId) {
          try {
            role = await prisma.userRole.findUnique({
              where: { id: user.roleId },
            });
          } catch (error) {
            console.error('Error fetching role:', error);
          }
        }

        token.id = user.id || token.sub;
        token.email = user.email;
        token.name = user.name;
        token.avatar = user.avatar;
        token.status = user.status;
        token.roleId = user.roleId;
        token.roleName = role?.name;
        token.role = role ? {
          id: role.id,
          name: role.name,
          slug: role.slug,
          isProtected: role.isProtected,
          isDefault: role.isDefault
        } : null;
      }

      return token;
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          session.user.id = token.id;
          session.user.email = token.email;
          session.user.name = token.name;
          session.user.avatar = token.avatar;
          session.user.status = token.status;
          session.user.roleId = token.roleId;
          session.user.roleName = token.roleName;
          session.user.role = token.role;
        }
      } catch (error) {
        console.error('Error in session callback:', error);
      }
      
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
};

export default authOptions;
