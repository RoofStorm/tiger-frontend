import { useCallback } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useUpdateUserPoints } from '@/hooks/useUpdateUserPoints';
import { useShareFacebookModal } from '@/contexts/ShareFacebookModalContext';
import { apiClient } from '@/lib/api';
import html2canvas from 'html2canvas';

interface MoodCardData {
  whisper?: string;
  reminder?: string;
}

interface UseShareMoodCardOptions {
  isAuthenticated: boolean;
  moodCardData: MoodCardData | null;
  onShareModalOpen?: () => void;
  onShareModalClose?: () => void;
}

/**
 * Custom hook to handle mood card sharing functionality
 * Includes image capture, upload, Facebook sharing, and points management
 * 
 * @param options Configuration options for the hook
 * @returns Object with share function and loading state
 * 
 * @example
 * const { share, isSharing } = useShareMoodCard({
 *   isAuthenticated,
 *   moodCardData,
 *   onShareModalOpen: () => setShowShareModal(true),
 * });
 */
export function useShareMoodCard({
  isAuthenticated,
  moodCardData,
  onShareModalOpen,
  onShareModalClose,
}: UseShareMoodCardOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useNextAuth();
  const { updateUserPoints } = useUpdateUserPoints();
  const { showModal: showShareFacebookModal } = useShareFacebookModal();

  // Generate UUID for cardId
  const generateCardId = useCallback((): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback: generate UUID-like string
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }, []);

  // Share mood card mutation
  const shareMoodCardMutation = useMutation({
    mutationFn: ({ cardId, platform }: { cardId: string; platform?: string }) =>
      apiClient.shareMoodCard(cardId, { ...(platform && { platform }) }),
    onSuccess: (result) => {
      // Check response format: could be { data: {...} } or direct {...}
      const responseData = result?.data || result;
      const pointsAwarded = responseData?.pointsAwarded === true;

      // Invalidate point logs to refresh point history
      queryClient.invalidateQueries({ queryKey: ['pointHistory', user?.id] });

      // Update user points immediately if pointsAwarded is true
      // This ensures header shows the correct points after bonus is awarded
      if (pointsAwarded) {
        updateUserPoints(user?.id);
        setTimeout(() => {
          // Hide button when sharing mood card
          showShareFacebookModal(true);
        }, 3000);
      } else {
        // Fallback: invalidate userDetails query to ensure UI is in sync
        queryClient.invalidateQueries({ queryKey: ['userDetails', user?.id] });
      }

      // Show success message with points info
      toast({
        title: 'Chia sẻ thành công!',
        description:
          responseData?.pointsMessage || result?.pointsMessage || 'Mood card đã được chia sẻ thành công.',
        variant: pointsAwarded ? 'success' : 'default',
        duration: 4000,
      });
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể chia sẻ mood card. Vui lòng thử lại.',
        variant: 'destructive',
        duration: 4000,
      });
    },
  });

  const share = useCallback(
    async (cardElementRef?: React.RefObject<HTMLDivElement | null>) => {
      // Check if user is not authenticated, show registration modal
      if (!isAuthenticated) {
        onShareModalOpen?.();
        return;
      }

      // If authenticated, share image to Facebook
      if (!cardElementRef?.current) {
        console.error('❌ [SHARE] Card element ref không tồn tại');
        toast({
          title: 'Lỗi',
          description: 'Không thể tạo ảnh để chia sẻ. Vui lòng thử lại.',
          variant: 'destructive',
          duration: 4000,
        });
        return;
      }

      try {
        toast({
          title: 'Đang xử lý...',
          description: 'Đang tạo ảnh để chia sẻ.',
          duration: 2000,
        });

        // Convert card to image
        const element = cardElementRef.current;

        const originalStyle = {
          opacity: element.style.opacity,
          visibility: element.style.visibility,
          pointerEvents: element.style.pointerEvents,
        };

        // Ensure element can be captured
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.style.pointerEvents = 'none';

        // Wait a bit to ensure render
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Wait for all images in element to load
        const images = element.querySelectorAll('img');
        await Promise.all(
          Array.from(images).map(
            (img) =>
              new Promise((resolve, reject) => {
                if (img.complete) {
                  resolve(null);
                } else {
                  img.onload = () => {
                    resolve(null);
                  };
                  img.onerror = (error) => {
                    reject(error);
                  };
                }
              })
          )
        );

        // Wait a bit more to ensure everything is fully rendered
        await new Promise((resolve) => setTimeout(resolve, 300));

        const canvas = await html2canvas(element, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: element.offsetWidth,
          height: element.offsetHeight,
        });

        // Restore original style
        element.style.opacity = originalStyle.opacity || '1';
        element.style.visibility = originalStyle.visibility || 'visible';
        element.style.pointerEvents = originalStyle.pointerEvents || 'auto';

        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
          if (!blob) {
            console.error('❌ [SHARE] Failed to create image blob');
            throw new Error('Failed to create image blob');
          }

          // Create File from blob
          const file = new File([blob], `TIGER mood card.png`, {
            type: 'image/png',
          });

          // Upload image to server
          try {
            const uploadResult = await apiClient.uploadFile(file);
            const imageUrl = uploadResult.data.url;

            // Auto generate cardId when sharing
            const cardId = generateCardId();

            // Create share URL with meta tags (similar to Corner2_2)
            const baseUrl =
              process.env.NEXT_PUBLIC_PUBLIC_URL ||
              (typeof window !== 'undefined' ? window.location.origin : null) ||
              process.env.NEXTAUTH_URL ||
              'https://tiger-corporation-vietnam.vn'; // Fallback to production URL

            // Create URL of share page with query params (has meta tags)
            const sharePageUrl = `${baseUrl}/nhip-song/share?imageUrl=${encodeURIComponent(imageUrl)}&whisper=${encodeURIComponent(moodCardData?.whisper || '')}&reminder=${encodeURIComponent(moodCardData?.reminder || '')}`;

            // Share URL of page (has meta tags) to Facebook instead of sharing image URL directly
            const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharePageUrl)}`;

            const popup = window.open(
              facebookShareUrl,
              'facebook-share-dialog',
              'width=800,height=600,scrollbars=yes,resizable=yes'
            );

            // Check if popup is blocked
            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
              console.error('❌ [SHARE] Popup bị chặn hoặc không thể mở');
              toast({
                title: 'Popup bị chặn',
                description: 'Vui lòng cho phép popup để chia sẻ.',
                variant: 'destructive',
                duration: 4000,
              });
              return;
            }

            // Focus on popup
            popup.focus();

            // Call API share with platform facebook to get points
            // Auto generate cardId when sending
            shareMoodCardMutation.mutate({ cardId, platform: 'facebook' });
          } catch (uploadError) {
            console.error('❌ [SHARE] Upload image lỗi:', uploadError);
            throw uploadError;
          }
        }, 'image/png');
      } catch (error) {
        console.error('❌ [SHARE] Error sharing image:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể chia sẻ ảnh. Vui lòng thử lại.',
          variant: 'destructive',
          duration: 4000,
        });
      }
    },
    [
      isAuthenticated,
      moodCardData,
      onShareModalOpen,
      toast,
      generateCardId,
      shareMoodCardMutation,
    ]
  );

  return {
    share,
    isSharing: shareMoodCardMutation.isPending,
  };
}

