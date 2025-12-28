import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to update user points in header and other components
 * When pointsAwarded is true, this will immediately refetch userDetails query
 * to ensure the UI reflects the latest points after bonus is awarded
 * 
 * Usage:
 * const { updateUserPoints } = useUpdateUserPoints();
 * 
 * // In mutation onSuccess:
 * if (pointsAwarded) {
 *   updateUserPoints(userId);
 * }
 */
export function useUpdateUserPoints() {
  const queryClient = useQueryClient();

  const updateUserPoints = useCallback(
    (userId?: string) => {
      if (userId) {
        // Refetch userDetails query immediately to update points in header
        // Using refetchQueries ensures immediate refetch, not just marking as stale
        queryClient.refetchQueries({
          queryKey: ['userDetails', userId],
        });
      }
      // Also refetch all userDetails queries to ensure consistency across all components
      queryClient.refetchQueries({ queryKey: ['userDetails'] });
    },
    [queryClient]
  );

  return { updateUserPoints };
}

