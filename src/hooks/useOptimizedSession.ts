import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

// Custom hook to optimize session usage
export function useOptimizedSession() {
  const { data: session, status } = useSession();

  return useMemo(
    () => ({
      session,
      status,
      user: session?.user || null,
      loading: status === 'loading',
      isAuthenticated: !!session?.user,
    }),
    [session, status]
  );
}
