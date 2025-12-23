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
} from './cache';
import { POINTS } from '@/constants/points';

// Helper function to award daily login bonus with in-memory cache
async function awardDailyLoginBonus(userId: string, provider: string) {
  try {
    const today = getTodayDateString();

    // Check in-memory cache first (fast)
    const alreadyAwarded = await checkDailyBonusAwarded(userId, today);

    if (alreadyAwarded) {
      return;
    }

    // Double-check with database as fallback (source of truth)
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
      // Mark in cache for future requests
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

    // Mark as awarded in cache
    await markDailyBonusAwarded(userId, today);
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
          console.error('❌ Missing credentials: email or password is empty');
          return null;
        }

        try {
          // Call backend API for login
          const apiBaseUrl =
            process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
          const loginUrl = `${apiBaseUrl}/auth/login`;

          console.log('🔐 Attempting login:', {
            email: credentials.email,
            apiUrl: loginUrl,
            timestamp: new Date().toISOString(),
          });

          // Add timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

          try {
            const response = await fetch(loginUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            console.log('📡 Backend response:', {
              status: response.status,
              statusText: response.statusText,
              ok: response.ok,
            });

            if (!response.ok) {
              let errorData;
              try {
                errorData = await response.json();
              } catch (parseError) {
                // If response is not JSON, try to get text
                const text = await response.text();
                errorData = {
                  message: text || 'Login failed',
                  status: response.status,
                };
              }

              // Backend error format: { success: false, error: "...", message: "..." }
              const errorMessage =
                errorData.error ||
                errorData.message ||
                `Login failed with status ${response.status}`;

              console.error('❌ Login failed:', {
                status: response.status,
                statusText: response.statusText,
                error: errorMessage,
                errorData,
              });

              return null;
            }

            const data = await response.json();
            console.log('✅ Login response received:', {
              hasSuccess: !!data.success,
              hasData: !!data.data,
              hasUser: !!(data.success && data.data ? data.data.user : data.user),
            });

            // Backend wraps response in { success: true, data: {...} } format via ResponseInterceptor
            // Handle both wrapped and unwrapped formats for flexibility
            const responseData = data.success && data.data ? data.data : data;

            if (!responseData.user) {
              console.error(
                '❌ Invalid response format: missing user data',
                JSON.stringify(data, null, 2)
              );
              return null;
            }

            console.log('✅ Login successful for user:', {
              id: responseData.user.id,
              email: responseData.user.email,
              hasAccessToken: !!responseData.accessToken,
            });

            // Store tokens for later use in JWT callback
            // We'll attach these to the user object so they're available in JWT callback
            return {
              id: responseData.user.id,
              email: responseData.user.email,
              name: responseData.user.name || 'User',
              image: responseData.user.avatarUrl || undefined,
              role: responseData.user.role,
              // Store tokens for JWT callback
              accessToken: responseData.accessToken,
              refreshToken: responseData.refreshToken,
            };
          } catch (fetchError: unknown) {
            clearTimeout(timeoutId);

            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
              console.error('❌ Login timeout: Backend did not respond within 15 seconds');
              console.error('❌ API URL:', loginUrl);
            } else {
              console.error('❌ Fetch error:', fetchError);
            }

            throw fetchError; // Re-throw to be caught by outer catch
          }
        } catch (error: unknown) {
          console.error('❌ Auth error:', error);
          console.error('❌ Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            name: error instanceof Error ? error.name : undefined,
            stack: error instanceof Error ? error.stack : undefined,
            apiUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api'}/auth/login`,
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
          if (!user.email) {
            console.error('❌ No email provided by Google');
            return false;
          }

          // Check if user exists
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Create new user for Google login
            existingUser = await prisma.user.create({
              data: {
                email: user.email,
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
              existingUser = await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  loginMethod: 'GOOGLE',
                  avatarUrl: user.image,
                },
              });
            }
          }

          // Award daily login bonus (non-blocking - don't fail sign in if this fails)
          if (existingUser?.id) {
            try {
              // Use Promise with timeout to prevent hanging
              await Promise.race([
                awardDailyLoginBonus(existingUser.id, 'google'),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('Timeout')), 5000)
                ),
              ]).catch(error => {
                console.warn(
                  '⚠️ Daily bonus award failed (non-critical):',
                  error
                );
                // Don't throw - allow sign in to continue
              });
            } catch (error) {
              console.warn(
                '⚠️ Error awarding daily bonus (non-critical):',
                error
              );
              // Continue with sign in even if bonus fails
            }
          }

          return true;
        } catch (error) {
          console.error('❌ Error in Google sign in:', error);
          return false;
        }
      }

      if (account?.provider === 'facebook') {
        try {
          if (!user.email) {
            console.error('❌ No email provided by Facebook');
            return false;
          }

          // Check if user exists
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Create new user for Facebook login
            existingUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || 'Facebook User',
                avatarUrl: user.image,
                loginMethod: 'FACEBOOK',
                role: 'USER',
                status: 'ACTIVE',
                points: 0, // Starting points
              },
            });
          } else {
            // Update existing user's login method if needed
            if (existingUser.loginMethod !== 'FACEBOOK') {
              existingUser = await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  loginMethod: 'FACEBOOK',
                  avatarUrl: user.image,
                },
              });
            }
          }

          // Award daily login bonus (non-blocking - don't fail sign in if this fails)
          if (existingUser?.id) {
            try {
              // Use Promise with timeout to prevent hanging
              await Promise.race([
                awardDailyLoginBonus(existingUser.id, 'facebook'),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('Timeout')), 5000)
                ),
              ]).catch(error => {
                console.warn(
                  '⚠️ Daily bonus award failed (non-critical):',
                  error
                );
                // Don't throw - allow sign in to continue
              });
            } catch (error) {
              console.warn(
                '⚠️ Error awarding daily bonus (non-critical):',
                error
              );
              // Continue with sign in even if bonus fails
            }
          }

          return true;
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
};
