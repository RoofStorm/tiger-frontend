import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

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
          const testConnection = await prisma.user.count();
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
            name: user.name || 'User',
            image: user.avatarUrl || user.image || undefined,
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
          try {
            const userId =
              existingUser?.id ||
              (
                await prisma.user.findUnique({
                  where: { email: user.email! },
                })
              )?.id;

            if (userId) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);

              const todayLogs = await prisma.pointLog.findMany({
                where: {
                  userId: userId,
                  reason: 'Daily login bonus',
                  createdAt: {
                    gte: today,
                    lt: tomorrow,
                  },
                },
              });

              if (todayLogs.length === 0) {
                await prisma.pointLog.create({
                  data: {
                    userId,
                    points: 50,
                    reason: 'Daily login bonus',
                  },
                });

                await prisma.user.update({
                  where: { id: userId },
                  data: {
                    points: {
                      increment: 50,
                    },
                  },
                });

                console.log(
                  '🎁 Daily login bonus awarded to Google user: 50 points'
                );
              } else {
                console.log('🎁 Daily login bonus already awarded today');
              }
            }
          } catch (error) {
            console.error(
              '❌ Error awarding daily login bonus to Google user:',
              error
            );
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
          try {
            const userId =
              existingUser?.id ||
              (
                await prisma.user.findUnique({
                  where: { email: user.email! },
                })
              )?.id;

            if (userId) {
              const today = new Date();
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(0, 0, 0, 0);

              const todayLogs = await prisma.pointLog.findMany({
                where: {
                  userId: userId,
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
                    userId: userId,
                    points: 50,
                    reason: 'Daily login bonus',
                  },
                });

                // Update user points
                await prisma.user.update({
                  where: { id: userId },
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
            }
          } catch (error) {
            console.error('❌ Error awarding daily login bonus:', error);
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
        // For Google login, we need to get the database user ID
        if (user.email) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email },
            });
            if (dbUser) {
              token.accessToken = dbUser.id; // Use database user ID
              token.userId = dbUser.id;
              token.avatarUrl = dbUser.avatarUrl; // Add avatar URL to token
            }
          } catch (error) {
            console.error('Error finding user in JWT callback:', error);
          }
        } else {
          token.accessToken = user.id; // Fallback for credentials login
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
