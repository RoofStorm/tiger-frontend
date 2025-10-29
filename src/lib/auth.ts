import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import { prisma } from './prisma';
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
          // Call backend API for login
          const apiBaseUrl =
            process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

          console.log('🔐 Calling backend login API...');
          const response = await fetch(`${apiBaseUrl}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({
              message: 'Login failed',
            }));
            console.error('❌ Login failed:', errorData.message);
            return null;
          }

          const data = await response.json();
          console.log('✅ Login successful for user:', data.user?.email);

          // Store tokens for later use in JWT callback
          // We'll attach these to the user object so they're available in JWT callback
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name || 'User',
            image: data.user.avatarUrl || undefined,
            role: data.user.role,
            // Store tokens for JWT callback
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
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
    maxAge: 14 * 24 * 60 * 60, // 14 days
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
          // NOTE: This uses direct DB access. If user already logged in with credentials today,
          // Redis/DB check will prevent duplicate. Should refactor to use backend API for consistency.
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
          // NOTE: This uses direct DB access. If user already logged in with credentials today,
          // Redis/DB check will prevent duplicate. Should refactor to use backend API for consistency.
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
        token.userId = user.id;

        // For credentials login, use tokens from backend API
        interface UserWithTokens {
          accessToken?: string;
          refreshToken?: string;
        }
        const userWithTokens = user as UserWithTokens;
        if (userWithTokens.accessToken) {
          // Use accessToken from backend API
          token.accessToken = userWithTokens.accessToken;
          token.refreshToken = userWithTokens.refreshToken;
        } else {
          // For Google/Facebook login, we need to get the database user ID
          // This still uses direct DB access for OAuth providers
          // TODO: Refactor OAuth flow to use backend API as well
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
                token.avatarUrl = dbUser.avatarUrl;

                // Add refresh token if available
                if (dbUser.refreshToken) {
                  token.refreshToken = dbUser.refreshToken;
                }
              }
            } catch (error) {
              console.error('Error finding user in JWT callback:', error);
            }
          }
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
