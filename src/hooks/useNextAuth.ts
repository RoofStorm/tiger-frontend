import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOptimizedSession } from './useOptimizedSession';

interface UseNextAuthReturn {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: 'USER' | 'ADMIN';
  } | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    referralCode?: string,
    username?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function useNextAuth(): UseNextAuthReturn {
  const { user, loading, isAuthenticated } = useOptimizedSession();
  const { update } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Memoize computed values to prevent unnecessary re-renders
  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user?.role]);

  const login = useCallback(
    async (username: string, password: string) => {
      try {
        const result = await signIn('credentials', {
          username,
          password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(
            result.error === 'CredentialsSignin'
              ? 'Tên đăng nhập hoặc mật khẩu không đúng'
              : 'Đăng nhập thất bại'
          );
        }

        if (result?.ok) {
          // Force refresh session immediately
          await update();

          // Wait a bit for session to be ready
          await new Promise(resolve => setTimeout(resolve, 200));

          // Get the updated session
          const { getSession } = await import('next-auth/react');
          const updatedSession = await getSession();

          if (updatedSession?.user?.id) {
            localStorage.setItem('userId', updatedSession.user.id);

            // Try to get tokens from session
            const accessToken = (updatedSession as { accessToken?: string })
              .accessToken;
            const refreshToken = (updatedSession as { refreshToken?: string })
              .refreshToken;

            if (accessToken) {
              localStorage.setItem('accessToken', accessToken);
            }
            if (refreshToken) {
              localStorage.setItem('refreshToken', refreshToken);
            }

            // Clear the flag when user logs in to allow modal to show if pointsAwarded is true
            // The DailyLoginModalProvider will check the session and show the modal
            localStorage.removeItem('dailyLoginModalShown');
          }

          // Clear cache after session is updated
          queryClient.clear();

          // Mark video as watched when user logs in
          localStorage.setItem('hasWatchedVideo', 'true');

          // Note: Login is now handled via modal, no redirect needed

          // Refresh router to ensure all components update (header, etc.)
          // Use setTimeout to ensure URL replacement happens first
          setTimeout(() => {
            router.refresh();
          }, 0);

          // Don't navigate - just update the UI (header will update automatically)
        }
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    [router, queryClient, update]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      referralCode?: string,
      username?: string
    ) => {
      try {
        // Call your custom register API
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, name, referralCode, username }),
        });

        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.error || 'Đăng ký thất bại');
        }

        // After successful registration, sign in with username
        // Use the username that was provided during registration, or get from response
        const userData = responseData.user || responseData;
        const loginUsername = username || userData?.username || name.toLowerCase().replace(/\s+/g, '');
        
        const signInResult = await signIn('credentials', {
          username: loginUsername,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          throw new Error(
            'Đăng nhập tự động thất bại. Vui lòng đăng nhập thủ công.'
          );
        }

        // Force refresh session after registration login
        if (signInResult?.ok) {
          await update();

          // Wait for session to update
          await new Promise(resolve => setTimeout(resolve, 200));

          // Clear cache and refresh router
          queryClient.clear();
          router.refresh();
        }

        // Show success toast
        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: 'Đăng ký thành công!',
          description: 'Chào mừng bạn đến với Tiger.',
          duration: 3000,
        });

        // Navigate to home page
        router.push('/');
      } catch (error) {
        console.error('Registration failed:', error);
        throw error;
      }
    },
    [router, queryClient, update]
  );

  const logout = useCallback(async () => {
    try {
      // Clear all auth-related data from localStorage
      localStorage.removeItem('userId');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('dailyLoginModalShown');

      // Clear cache before logout to prevent stale data
      queryClient.clear();

      await signOut({ redirect: false });
      // Refresh router to update UI (header, etc.) but stay on current page
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [router, queryClient]);

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
  };
}
