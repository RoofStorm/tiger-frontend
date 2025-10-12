import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          console.log('🔍 NextAuth authorize called with:', credentials.email);

          // Test database connection first
          console.log('🔗 Testing database connection...');
          const testConnection = await prisma.user.count();
          console.log('✅ Database connected, total users:', testConnection);

          // Find user in database
          console.log('🔍 Searching for user:', credentials.email);
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          console.log('👤 User found:', user ? 'Yes' : 'No');
          if (user) {
            console.log('👤 User details:', {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              hasPasswordHash: !!user.passwordHash,
              passwordHashLength: user.passwordHash?.length || 0,
            });
          }

          if (!user) {
            console.log('❌ User not found in database');
            return null;
          }

          // Verify password
          console.log('🔐 Verifying password...');
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash || ''
          );

          console.log('🔐 Password valid:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return null;
          }

          console.log('✅ Login successful for user:', user.email);

          // Award daily login bonus points
          try {
            console.log(
              '🎁 Attempting to award daily login bonus to user:',
              user.id
            );

            // Check if user already got daily bonus today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todayLogs = await prisma.pointLog.findMany({
              where: {
                userId: user.id,
                reason: 'Daily login bonus',
                createdAt: {
                  gte: today,
                  lt: tomorrow,
                },
              },
            });

            if (todayLogs.length === 0) {
              // Award points
              await prisma.pointLog.create({
                data: {
                  userId: user.id,
                  points: 50,
                  reason: 'Daily login bonus',
                },
              });

              // Update user points
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  points: {
                    increment: 50,
                  },
                },
              });

              console.log(
                '🎁 Daily login bonus awarded successfully: 50 points'
              );
            } else {
              console.log('🎁 Daily login bonus already awarded today');
            }
          } catch (error) {
            console.error('❌ Error awarding daily login bonus:', error);
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatarUrl,
            role: user.role,
          };
        } catch (error) {
          console.error('❌ Auth error:', error);
          console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
          });
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
  },
};
