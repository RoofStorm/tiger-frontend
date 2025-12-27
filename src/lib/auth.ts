import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import jwt from 'jsonwebtoken';

// Helper function to call backend API for OAuth login
async function handleOAuthLogin(
  provider: 'facebook' | 'google',
  userData: {
    id: string;
    email?: string;
    name?: string;
    image?: string;
  }
) {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
  const oauthUrl = `${apiBaseUrl}/auth/oauth/${provider}`;

  // Xử lý email: Tạo email fallback nếu không có
  let userEmail = userData.email;
  if (!userEmail) {
    userEmail = `${provider}_${userData.id}@${provider}.temp`;
    console.warn(
      `⚠️ ${provider} không cung cấp email, sử dụng email tạm:`,
      userEmail
    );
  }

  try {
    const response = await fetch(oauthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providerId: userData.id,
        email: userEmail,
        name: userData.name || `${provider} User`,
        avatarUrl: userData.image,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'OAuth login failed',
      }));
      console.error(`❌ ${provider} OAuth API error:`, {
        status: response.status,
        error: errorData,
      });
      return null;
    }

    const data = await response.json();
    // Handle backend response format: { success: true, data: { user, accessToken, ... } }
    const responseData =
      data.success && data.data ? data.data : data;

    if (!responseData.user) {
      console.error(`❌ Invalid ${provider} OAuth response:`, data);
      return null;
    }

    console.log(`✅ ${provider} OAuth login successful:`, {
      userId: responseData.user.id,
      email: responseData.user.email,
      pointsAwarded: responseData.pointsAwarded,
    });

    return {
      id: responseData.user.id,
      email: responseData.user.email,
      name: responseData.user.name || userData.name || `${provider} User`,
      image: responseData.user.avatarUrl || userData.image,
      role: responseData.user.role || 'USER',
      accessToken: responseData.accessToken,
      refreshToken: responseData.refreshToken,
      // Store pointsAwarded flag to show daily login modal
      pointsAwarded: responseData.pointsAwarded || false,
    };
  } catch (error) {
    console.error(`❌ Error calling ${provider} OAuth API:`, error);
    return null;
  }
}

// Daily login bonus is now handled by backend API
// No need to handle it in frontend anymore

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
      authorization: {
        params: {
          scope: 'email,public_profile',
        },
      },
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name || profile.first_name || 'Facebook User',
          email: profile.email || `${profile.id}@facebook.temp`, // Fallback email nếu không có
          image: profile.picture?.data?.url || profile.picture,
          role: 'USER', // Default role
        };
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.error('❌ Missing credentials: username or password is empty');
          return null;
        }

        try {
          // Call backend API for login
          const apiBaseUrl =
            process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
          const loginUrl = `${apiBaseUrl}/auth/login`;

          console.log('🔐 Attempting login:', {
            username: credentials.username,
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
                username: credentials.username,
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
              } catch {
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
              pointsAwarded: responseData.pointsAwarded,
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
              // Store pointsAwarded flag to show daily login modal
              pointsAwarded: responseData.pointsAwarded || false,
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
          console.log('🔵 Google signIn callback:', {
            hasEmail: !!user.email,
            email: user.email,
            hasName: !!user.name,
            name: user.name,
            hasImage: !!user.image,
            userId: user.id,
          });

          if (!user.email) {
            console.error('❌ No email provided by Google');
            return false;
          }

          // Call backend API to handle OAuth login
          const backendUser = await handleOAuthLogin('google', {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          });

          if (!backendUser) {
            console.error('❌ Failed to authenticate with backend API');
            return false;
          }

          // Update user object with backend data
          user.id = backendUser.id;
          user.email = backendUser.email;
          user.name = backendUser.name;
          user.image = backendUser.image;
          user.role = backendUser.role;

          // Store tokens and pointsAwarded for JWT callback
          interface UserWithTokens {
            accessToken?: string;
            refreshToken?: string;
            pointsAwarded?: boolean;
          }
          const userWithTokens = user as typeof user & UserWithTokens;
          userWithTokens.accessToken = backendUser.accessToken;
          userWithTokens.refreshToken = backendUser.refreshToken;
          userWithTokens.pointsAwarded = backendUser.pointsAwarded;

          return true;
        } catch (error) {
          console.error('❌ Error in Google sign in:', error);
          return false;
        }
      }

      if (account?.provider === 'facebook') {
        try {
          console.log('🔵 Facebook signIn callback:', {
            hasEmail: !!user.email,
            email: user.email,
            hasName: !!user.name,
            name: user.name,
            hasImage: !!user.image,
            userId: user.id,
          });

          // Call backend API to handle OAuth login
          const backendUser = await handleOAuthLogin('facebook', {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          });

          if (!backendUser) {
            console.error('❌ Failed to authenticate with backend API');
            return false;
          }

          // Update user object with backend data
          user.id = backendUser.id;
          user.email = backendUser.email;
          user.name = backendUser.name;
          user.image = backendUser.image;
          user.role = backendUser.role;

          // Store tokens and pointsAwarded for JWT callback
          interface UserWithTokens {
            accessToken?: string;
            refreshToken?: string;
            pointsAwarded?: boolean;
          }
          const userWithTokens = user as typeof user & UserWithTokens;
          userWithTokens.accessToken = backendUser.accessToken;
          userWithTokens.refreshToken = backendUser.refreshToken;
          userWithTokens.pointsAwarded = backendUser.pointsAwarded;

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
          pointsAwarded?: boolean;
        }
        const userWithTokens = user as UserWithTokens;
        if (userWithTokens.accessToken) {
          // Use accessToken from backend API
          token.accessToken = userWithTokens.accessToken;
          token.refreshToken = userWithTokens.refreshToken;
          // Store pointsAwarded flag
          token.pointsAwarded = userWithTokens.pointsAwarded || false;
        } else {
          // For OAuth providers (Google/Facebook), tokens are already provided by backend API
          // AccessToken and refreshToken are attached to user object in signIn callback
          interface UserWithTokens {
            accessToken?: string;
            refreshToken?: string;
            image?: string;
            pointsAwarded?: boolean;
          }
          const userWithTokens = user as UserWithTokens;
          
          if (userWithTokens.accessToken) {
            // Use tokens from backend API
            token.accessToken = userWithTokens.accessToken;
            token.refreshToken = userWithTokens.refreshToken;
            token.avatarUrl = userWithTokens.image;
            // Store pointsAwarded flag
            token.pointsAwarded = userWithTokens.pointsAwarded || false;
          } else {
            // Fallback: Create JWT token if backend didn't provide one
            // This should not happen if backend API is working correctly
            console.warn('⚠️ No accessToken from backend, creating fallback JWT');
            const accessToken = jwt.sign(
              {
                sub: user.id,
                email: user.email,
                role: user.role || 'USER',
              },
              process.env.NEXTAUTH_SECRET!,
              { expiresIn: '1h' }
            );
            token.accessToken = accessToken;
            token.avatarUrl = user.image;
            token.pointsAwarded = false;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        const avatarUrl = (token as { avatarUrl?: string }).avatarUrl;
        const pointsAwarded = (token as { pointsAwarded?: boolean }).pointsAwarded;

        session.user.id = (token as { userId?: string }).userId || token.sub!;
        session.user.role = token.role;
        session.user.image = avatarUrl || undefined;
        (session as { accessToken?: string }).accessToken =
          token.accessToken as string;
        (session as { refreshToken?: string }).refreshToken = (
          token as { refreshToken?: string }
        ).refreshToken;
        // Store pointsAwarded flag in session
        (session as { pointsAwarded?: boolean }).pointsAwarded = pointsAwarded || false;
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
