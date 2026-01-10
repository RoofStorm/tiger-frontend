import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { useNextAuth } from '@/hooks/useNextAuth';

/**
 * Custom hook for handling product card interactions (hover/click)
 * Manages API calls to award points and tracks remaining clicks
 * 
 * @returns Object containing:
 * - remainingClicks: Current remaining clicks count
 * - handleProductCardInteraction: Function to call when product card is interacted with
 */
export function useProductCardInteraction() {
  const [remainingClicks, setRemainingClicks] = useState<number | null>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useNextAuth();

  // Reset remainingClicks when authentication status changes
  useEffect(() => {
    setRemainingClicks(null);
  }, [isAuthenticated]);

  /**
   * Send API request for product card interaction (hover or click)
   * Awards points and updates remaining clicks count
   */
  const handleProductCardInteraction = async () => {
    if (!isAuthenticated) {
      return;
    }

    // Check if remainingClicks is 0, if so, don't call API
    if (remainingClicks !== null && remainingClicks === 0) {
      return;
    }

    try {
      // Call API to award points for product card click (1 click at a time)
      const response = await apiClient.awardProductCardClick(1);
      
      // Update remainingClicks from response
      if (response.remainingClicks !== undefined) {
        setRemainingClicks(response.remainingClicks);
      }

      // Show toast notification with points awarded
      if (response.totalPoints && response.totalPoints > 0) {
        toast({
          title: 'Chúc mừng!',
          description: `Bạn đã được cộng ${response.totalPoints} điểm`,
          variant: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      // Silently fail - don't show error toast for this background action
      console.error('Failed to award product card click points:', error);
    }
  };

  return {
    remainingClicks,
    handleProductCardInteraction,
  };
}

