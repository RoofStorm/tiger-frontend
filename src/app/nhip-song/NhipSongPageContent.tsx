'use client';

import React, { useState, useEffect, useRef } from 'react';
import { EmojiSelectionSection } from './components/EmojiSelectionSection';
import { MoodCardFlipCard } from './components/MoodCardFlipCard';
import { ShareRegistrationModal } from './components/ShareRegistrationModal';
import { RewardModal } from './components/RewardModal';
import { useMoodCard } from '@/hooks/useMoodCard';
import { useGlobalNavigationLoading } from '@/hooks/useGlobalNavigationLoading';
import { useHeaderDarkMode } from '@/contexts/HeaderDarkModeContext';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import html2canvas from 'html2canvas';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useZoneView } from '@/hooks/useZoneView';

const getBackgroundImage = (): string => {
  const now = new Date();
  const hour = now.getHours();
  const isDark = hour >= 18 || hour < 6;
  
  // Thêm timestamp để tránh browser cache (chỉ thay đổi mỗi giờ)
  const cacheBuster = Math.floor(now.getTime() / (1000 * 60 * 60)); // Thay đổi mỗi giờ
  
  const bgImage = isDark 
    ? `url(/nhipsong/nhipsong_dark_background.jpg?v=${cacheBuster})`
    : `url(/nhipsong/nhipsong_light_background.jpg?v=${cacheBuster})`;
    
  return bgImage;
};

const isDarkMode = (): boolean => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 18 || hour < 6;
};

export function NhipSongPageContent() {
  const [showMoodCard, setShowMoodCard] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  // Không set initial value từ function để tránh SSR/hydration mismatch trong production
  // Sẽ được set trong useEffect sau khi component mount trên client
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [isDark, setIsDark] = useState<boolean>(false);
  const { navigateWithLoading } = useGlobalNavigationLoading();
  const { setIsDarkMode } = useHeaderDarkMode();
  const { isAuthenticated } = useNextAuth();
  const { toast } = useToast();
  const pageRef = useRef<HTMLDivElement>(null);
  const { trackClick } = useAnalytics();

  // Track time on Emoji page
  useZoneView(pageRef, {
    page: 'emoji',
    zone: 'overview',
    enabled: !showMoodCard, // Only track when showing emoji selection
  });

  // Update header dark mode when showShareModal changes
  useEffect(() => {
    setIsDarkMode(showShareModal);
  }, [showShareModal, setIsDarkMode]);


  // Preload background images để tối ưu hóa hiệu năng
  useEffect(() => {
    // Preload cả 2 background images (dark và light) để tránh delay khi switch
    const preloadImages = () => {
      const darkBg = new Image();
      darkBg.src = '/nhipsong/nhipsong_dark_background.jpg';
      
      const lightBg = new Image();
      lightBg.src = '/nhipsong/nhipsong_light_background.jpg';
    };

    preloadImages();
  }, []);

  // Cập nhật background image và dark mode dựa trên thời gian
  // Chỉ chạy trên client side sau khi component mount để tránh SSR/hydration mismatch
  useEffect(() => {
    const updateBackground = () => {
      const newBgImage = getBackgroundImage();
      const newIsDark = isDarkMode();
      
      setBackgroundImage(newBgImage);
      setIsDark(newIsDark);
    };

    // Cập nhật ngay khi component mount trên client
    updateBackground();

    // Kiểm tra lại mỗi phút để đảm bảo background được cập nhật khi thời gian thay đổi
    const interval = setInterval(updateBackground, 60000); // 60000ms = 1 phút

    return () => clearInterval(interval);
  }, []);

  const {
    selectedEmojis,
    moodCardData,
    isCardFlipped,
    setIsCardFlipped,
    handleEmojiSelect,
    handleEmojiRemove,
    generateMoodCard,
    reset,
  } = useMoodCard();

  const handleGenerateMoodCard = () => {
    // Track CTA click "Tham gia ngay"
    trackClick('emoji', {
      zone: 'overview',
      component: 'button',
      metadata: { label: 'tham_gia_ngay' },
    });
    
    const data = generateMoodCard();
    if (data) {
      setShowMoodCard(true);
    }
  };

  const handleReset = () => {
    reset();
    setShowMoodCard(false);
  };

  const handleSaveMoodCard = async () => {
    try {
      // TODO: Implement save to backend
      handleReset();
    } catch (error) {
      console.error('Failed to save mood card:', error);
    }
  };

  const handleShare = async (cardElementRef?: React.RefObject<HTMLDivElement | null>) => {
    // Kiểm tra nếu chưa đăng nhập thì hiện modal đăng ký/đăng nhập
    if (!isAuthenticated) {
      setShowShareModal(true);
      setShowMoodCard(false);
      return;
    }

    // Nếu đã đăng nhập thì share image lên Facebook
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

      // Convert card thành image
      const element = cardElementRef.current;
      
      const originalStyle = {
        opacity: element.style.opacity,
        visibility: element.style.visibility,
        pointerEvents: element.style.pointerEvents,
      };

      // Đảm bảo element có thể được capture
      element.style.opacity = '1';
      element.style.visibility = 'visible';
      element.style.pointerEvents = 'none';

      // Đợi một chút để đảm bảo render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Đợi tất cả images trong element load xong
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

      // Đợi thêm một chút để đảm bảo mọi thứ đã render hoàn toàn
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
      });

      // Khôi phục style ban đầu
      element.style.opacity = originalStyle.opacity || '1';
      element.style.visibility = originalStyle.visibility || 'visible';
      element.style.pointerEvents = originalStyle.pointerEvents || 'auto';

      // Convert canvas thành blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('❌ [SHARE] Failed to create image blob');
          throw new Error('Failed to create image blob');
        }

        // Tạo File từ blob
        const file = new File([blob], `mood-card-${Date.now()}.png`, {
          type: 'image/png',
        });

        // Upload image lên server
        try {
          const uploadResult = await apiClient.uploadFile(file);
          const imageUrl = uploadResult.data.url;

          // Tạo URL share với meta tags (giống Corner2_2)
          const baseUrl =
            process.env.NEXT_PUBLIC_PUBLIC_URL ||
            (typeof window !== 'undefined' ? window.location.origin : null) ||
            process.env.NEXTAUTH_URL ||
            'https://tiger-corporation-vietnam.vn'; // Fallback to production URL
          
          // Tạo title và description cho mood card
          // const shareTitle = moodCardData?.reminder
          //   ? (moodCardData.reminder.length > 50
          //       ? moodCardData.reminder.substring(0, 50) + '...'
          //       : moodCardData.reminder) + ' - TIGER Nhịp Sống'
          //   : moodCardData?.whisper
          //   ? `"${moodCardData.whisper.length > 50 ? moodCardData.whisper.substring(0, 50) + '...' : moodCardData.whisper}" - Tiger Nhịp Sống`
          //   : 'Mood Card - TIGER Nhịp Sống';
          
          // const shareDescription = moodCardData?.whisper && moodCardData?.reminder
          //   ? `"${moodCardData.whisper}"\n\n${moodCardData.reminder}\n\n#TigerNhịpSống #MoodCard`
          //   : moodCardData?.whisper
          //   ? `"${moodCardData.whisper}"\n\n#TigerNhịpSống #MoodCard`
          //   : moodCardData?.reminder
          //   ? `${moodCardData.reminder}\n\n#TigerNhịpSống #MoodCard`
          //   : 'Khám phá cảm xúc của bạn qua mood card. Cùng TIGER tham gia thử thách Giữ Nhịp nhé.';

          // Tạo URL của page share với query params (có meta tags)
          const sharePageUrl = `${baseUrl}/nhip-song/share?imageUrl=${encodeURIComponent(imageUrl)}&whisper=${encodeURIComponent(moodCardData?.whisper || '')}&reminder=${encodeURIComponent(moodCardData?.reminder || '')}`;

          // Share URL của page (có meta tags) lên Facebook thay vì share URL của image trực tiếp
          const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharePageUrl)}`;
          
          const popup = window.open(
            facebookShareUrl,
            'facebook-share-dialog',
            'width=800,height=600,scrollbars=yes,resizable=yes'
          );

          // Kiểm tra nếu popup bị block
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

          // Focus vào popup
          popup.focus();

          toast({
            title: 'Chia sẻ thành công',
            description: 'Đang mở Facebook để chia sẻ ảnh của bạn.',
            duration: 3000,
          });
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
  };

  const handleRegister = () => {
    setShowShareModal(false);
    setShowRewardModal(true);
  };

  const handleLogin = () => {
    // TODO: Implement login logic
    setShowShareModal(false);
  };

  const handleNextPage = () => {
    setShowRewardModal(false);
    navigateWithLoading('/thu-thach-giu-nhip', 'Đang chuyển đến Thử thách giữ nhịp...');
  };

  // const handleExploreMore = () => {
  //   navigateWithLoading('/thu-thach-giu-nhip', 'Đang chuyển đến Thử thách giữ nhịp...');
  // };

  return (
    <div ref={pageRef}>
      <main 
        style={{
          backgroundImage: backgroundImage || 'url(/nhipsong/nhipsong_light_background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: isDark ? 'center' : 'bottom',
          backgroundRepeat: 'no-repeat',
          minHeight:'calc(100vh - 80px)'
        }}
        className="mt-[64px] xl:mt-[80px] flex flex-col md:block"
      >
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[64px] xl:mt-[80px] flex-1 flex flex-col ${isDark ? 'justify-start py-6' : 'justify-center md:justify-start py-6 2xl:py-12'}`}>
          {!showMoodCard ? (
            <EmojiSelectionSection
              selectedEmojis={selectedEmojis}
              onEmojiSelect={handleEmojiSelect}
              onEmojiRemove={handleEmojiRemove}
              onGenerateMoodCard={handleGenerateMoodCard}
              isDarkMode={isDark}
            />
          ) : (
            moodCardData && (
              <MoodCardFlipCard
                whisper={moodCardData.whisper}
                reminder={moodCardData.reminder}
                isCardFlipped={isCardFlipped}
                onCardFlip={setIsCardFlipped}
                onSave={handleSaveMoodCard}
                onShare={handleShare}
                onReset={handleReset}
                cardNumber={moodCardData.cardNumber}
                frontCardImage={moodCardData.frontCardImage}
                contentCardImage={moodCardData.contentCardImage}
              />
            )
          )}
        </div>
      </main>

      {/* Share Registration Modal */}
      <ShareRegistrationModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onRegister={handleRegister}
        onLogin={handleLogin}
      />

      {/* Reward Modal */}
      <RewardModal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        onNextPage={handleNextPage}
      />
    </div>
  );
}
