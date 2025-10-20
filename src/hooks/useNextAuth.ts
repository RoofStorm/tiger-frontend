import { signIn, signOut } from 'next-auth/react';
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
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    referralCode?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function useNextAuth(): UseNextAuthReturn {
  const { user, loading, isAuthenticated } = useOptimizedSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Memoize computed values to prevent unnecessary re-renders
  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user?.role]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(
            result.error === 'CredentialsSignin'
              ? 'Email hoặc mật khẩu không đúng'
              : 'Đăng nhập thất bại'
          );
        }

        // Store userId in localStorage for fallback
        if (result?.ok) {
          // Get the user ID from the session after successful login
          setTimeout(async () => {
            const { getSession } = await import('next-auth/react');
            const session = await getSession();
            if (session?.user?.id) {
              localStorage.setItem('userId', session.user.id);
            }
          }, 100);
        }

        // Only clear cache if login was successful
        // Use setTimeout to avoid blocking the UI
        setTimeout(() => {
          queryClient.clear();
        }, 100);

        // Redirect based on role
        if (user?.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    [router, user?.role, queryClient]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      referralCode?: string
    ) => {
      try {
        // Call your custom register API
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, name, referralCode }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Đăng ký thất bại');
        }

        // After successful registration, sign in
        const signInResult = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          throw new Error(
            'Đăng nhập tự động thất bại. Vui lòng đăng nhập thủ công.'
          );
        }

        // Only clear cache if registration and sign in were successful
        setTimeout(() => {
          queryClient.clear();
        }, 100);

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
    [router, queryClient]
  );

  const logout = useCallback(async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('userId');

      // Clear cache before logout to prevent stale data
      queryClient.clear();

      await signOut({ redirect: false });
      router.push('/auth/login');
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
