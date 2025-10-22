import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  checkDailyBonusAwarded,
  markDailyBonusAwarded,
  getTodayDateString,
} from './redis';
import { POINTS } from '@/constants/points';

// Helper function to award daily login bonus with Redis cache
async function awardDailyLoginBonus(userId: string, provider: string) {
  try {
    const today = getTodayDateString();

    // Check Redis cache first
    const alreadyAwarded = await checkDailyBonusAwarded(userId, today);

    if (alreadyAwarded) {
      console.log(
        `🎁 Daily login bonus already awarded today for ${provider} user:`,
        userId
      );
      return;
    }

    // Double-check with database as fallback
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const tomorrow = new Date(todayDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLogs = await prisma.pointLog.findMany({
      where: {
        userId: userId,
        reason: 'Daily login bonus',
        createdAt: {
          gte: todayDate,
          lt: tomorrow,
        },
      },
    });

    if (todayLogs.length > 0) {
      console.log(
        `🎁 Daily login bonus already awarded today (DB check) for ${provider} user:`,
        userId
      );
      // Mark in Redis cache for future requests
      await markDailyBonusAwarded(userId, today);
      return;
    }

    // Award points
    await prisma.pointLog.create({
      data: {
        userId: userId,
        points: POINTS.DAILY_LOGIN_BONUS,
        reason: 'Daily login bonus',
      },
    });

    // Update user points
    await prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: POINTS.DAILY_LOGIN_BONUS,
        },
      },
    });

    // Mark as awarded in Redis cache
    await markDailyBonusAwarded(userId, today);

    console.log(
      `🎁 Daily login bonus awarded successfully to ${provider} user: ${POINTS.DAILY_LOGIN_BONUS} points`
    );
  } catch (error) {
    console.error(
      `❌ Error awarding daily login bonus to ${provider} user:`,
      error
    );
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GoogleProvider({
      clientId: process.env.OAUTH_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.OAUTH_FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.OAUTH_FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Test database connection first
          await prisma.user.count();
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

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
          await awardDailyLoginBonus(user.id, 'credentials');

          return {
            id: user.id,
            email: user.email,
            name: user.name || 'User',
            image: user.avatarUrl || undefined,
            role: user.role,
          };
        } catch (error: unknown) {
          console.error('❌ Auth error:', error);
          console.error('❌ Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          });
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          console.log('🔍 Google sign in for user:', user.email);

          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Create new user for Google login
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || 'Google User',
                avatarUrl: user.image,
                loginMethod: 'GOOGLE',
                role: 'USER',
                status: 'ACTIVE',
                points: 0, // Starting points
              },
            });
          } else {
            // Update existing user's login method if needed
            if (existingUser.loginMethod !== 'GOOGLE') {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  loginMethod: 'GOOGLE',
                  avatarUrl: user.image,
                },
              });
              console.log('✅ Updated user login method to Google');
            }
          }

          // Award daily login bonus for all users (new and existing)
          const userId =
            existingUser?.id ||
            (
              await prisma.user.findUnique({
                where: { email: user.email! },
              })
            )?.id;

          if (userId) {
            await awardDailyLoginBonus(userId, 'google');
          }
        } catch (error) {
          console.error('❌ Error in Google sign in:', error);
          return false;
        }
      }

      if (account?.provider === 'facebook') {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Create new user for Facebook login
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || 'Facebook User',
                avatarUrl: user.image,
                loginMethod: 'FACEBOOK',
                role: 'USER',
                status: 'ACTIVE',
                points: 0, // Starting points
              },
            });
            console.log('✅ New Facebook user created:', newUser.email);
          } else {
            // Update existing user's login method if needed
            if (existingUser.loginMethod !== 'FACEBOOK') {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  loginMethod: 'FACEBOOK',
                  avatarUrl: user.image,
                },
              });
              console.log('✅ Updated user login method to Facebook');
            }
          }

          // Award daily login bonus for all users (new and existing)
          const userId =
            existingUser?.id ||
            (
              await prisma.user.findUnique({
                where: { email: user.email! },
              })
            )?.id;

          if (userId) {
            await awardDailyLoginBonus(userId, 'facebook');
          }
        } catch (error) {
          console.error('❌ Error in Facebook sign in:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        // For Google/Facebook login, we need to get the database user ID
        if (user.email) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email },
            });
            if (dbUser) {
              // Create a real JWT token with the user ID
              const accessToken = jwt.sign(
                {
                  sub: dbUser.id,
                  email: dbUser.email,
                  role: dbUser.role,
                },
                process.env.NEXTAUTH_SECRET!,
                { expiresIn: '1h' }
              );

              token.accessToken = accessToken; // Use real JWT token
              token.userId = dbUser.id;
              token.avatarUrl = dbUser.avatarUrl;

              // Add refresh token if available
              if (dbUser.refreshToken) {
                token.refreshToken = dbUser.refreshToken;
              }
            }
          } catch (error) {
            console.error('Error finding user in JWT callback:', error);
          }
        } else {
          // For credentials login, also create a real JWT token
          const accessToken = jwt.sign(
            {
              sub: user.id,
              email: user.email,
              role: user.role,
            },
            process.env.NEXTAUTH_SECRET!,
            { expiresIn: '1h' }
          );

          token.accessToken = accessToken; // Use real JWT token
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        const avatarUrl = (token as { avatarUrl?: string }).avatarUrl;

        session.user.id = (token as { userId?: string }).userId || token.sub!;
        session.user.role = token.role;
        session.user.image = avatarUrl || undefined;
        (session as { accessToken?: string }).accessToken =
          token.accessToken as string;
        (session as { refreshToken?: string }).refreshToken = (
          token as { refreshToken?: string }
        ).refreshToken;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
};
