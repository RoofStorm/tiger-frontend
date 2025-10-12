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
  register: (email: string, password: string, name: string) => Promise<void>;
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
          throw new Error('Invalid credentials');
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
    async (email: string, password: string, name: string) => {
      try {
        // Call your custom register API
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
          throw new Error('Registration failed');
        }

        // After successful registration, sign in
        await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        // Only clear cache if registration was successful
        setTimeout(() => {
          queryClient.clear();
        }, 100);

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
