'use client';

import React, { useState, useEffect } from 'react';
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

const getBackgroundImage = (): string => {
  const now = new Date();
  const hour = now.getHours();
  const isDark = hour >= 18 || hour < 6;
  
  // Thêm timestamp để tránh browser cache (chỉ thay đổi mỗi giờ)
  const cacheBuster = Math.floor(now.getTime() / (1000 * 60 * 60)); // Thay đổi mỗi giờ
  
  const bgImage = isDark 
    ? `url(/nhipsong/nhipsong_dark_background.svg?v=${cacheBuster})`
    : `url(/nhipsong/nhipsong_light_background.svg?v=${cacheBuster})`;
  
  console.log('getBackgroundImage - hour:', hour, 'isDark:', isDark, 'bgImage:', bgImage);
  
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

  // Update header dark mode when showShareModal changes
  useEffect(() => {
    setIsDarkMode(showShareModal);
  }, [showShareModal, setIsDarkMode]);

  // Debug: Log khi backgroundImage thay đổi
  useEffect(() => {
    console.log('backgroundImage state changed to:', backgroundImage);
    console.log('isDark state changed to:', isDark);
  }, [backgroundImage, isDark]);

  // Cập nhật background image và dark mode dựa trên thời gian
  // Chỉ chạy trên client side sau khi component mount để tránh SSR/hydration mismatch
  useEffect(() => {
    const updateBackground = () => {
      const newBgImage = getBackgroundImage();
      const newIsDark = isDarkMode();
      
      console.log('updateBackground - Setting backgroundImage:', newBgImage, 'isDark:', newIsDark);
      
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
    console.log('🚀 [SHARE] Bắt đầu quá trình share');
    console.log('🔐 [SHARE] Authentication status:', isAuthenticated);
    
    // Kiểm tra nếu chưa đăng nhập thì hiện modal đăng ký/đăng nhập
    if (!isAuthenticated) {
      console.log('❌ [SHARE] User chưa đăng nhập, hiển thị modal đăng ký/đăng nhập');
      setShowShareModal(true);
      setShowMoodCard(false);
      return;
    }

    console.log('✅ [SHARE] User đã đăng nhập, tiếp tục quá trình share');
    console.log('📋 [SHARE] Card element ref:', cardElementRef);
    console.log('📋 [SHARE] Card element current:', cardElementRef?.current);

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
      console.log('📸 [SHARE] Bắt đầu capture card thành image');
      toast({
        title: 'Đang xử lý...',
        description: 'Đang tạo ảnh để chia sẻ.',
        duration: 2000,
      });

      // Convert card thành image
      const element = cardElementRef.current;
      console.log('📐 [SHARE] Element dimensions:', {
        width: element.offsetWidth,
        height: element.offsetHeight,
      });
      
      const originalStyle = {
        opacity: element.style.opacity,
        visibility: element.style.visibility,
        pointerEvents: element.style.pointerEvents,
      };

      // Đảm bảo element có thể được capture
      element.style.opacity = '1';
      element.style.visibility = 'visible';
      element.style.pointerEvents = 'none';
      console.log('🎨 [SHARE] Đã cập nhật style của element để capture');

      // Đợi một chút để đảm bảo render
      console.log('⏳ [SHARE] Đợi 100ms để render...');
      await new Promise(resolve => setTimeout(resolve, 100));

      // Đợi tất cả images trong element load xong
      const images = element.querySelectorAll('img');
      console.log('🖼️ [SHARE] Tìm thấy', images.length, 'images trong element');
      await Promise.all(
        Array.from(images).map(
          (img, index) =>
            new Promise((resolve, reject) => {
              if (img.complete) {
                console.log(`✅ [SHARE] Image ${index + 1} đã load xong`);
                resolve(null);
              } else {
                console.log(`⏳ [SHARE] Đang đợi image ${index + 1} load...`);
                img.onload = () => {
                  console.log(`✅ [SHARE] Image ${index + 1} đã load xong`);
                  resolve(null);
                };
                img.onerror = (error) => {
                  console.error(`❌ [SHARE] Image ${index + 1} load lỗi:`, error);
                  reject(error);
                };
              }
            })
        )
      );

      // Đợi thêm một chút để đảm bảo mọi thứ đã render hoàn toàn
      console.log('⏳ [SHARE] Đợi thêm 300ms để render hoàn toàn...');
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('🎬 [SHARE] Bắt đầu html2canvas...');
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
      });
      console.log('✅ [SHARE] html2canvas thành công, canvas size:', {
        width: canvas.width,
        height: canvas.height,
      });

      // Khôi phục style ban đầu
      element.style.opacity = originalStyle.opacity || '1';
      element.style.visibility = originalStyle.visibility || 'visible';
      element.style.pointerEvents = originalStyle.pointerEvents || 'auto';
      console.log('🔄 [SHARE] Đã khôi phục style ban đầu của element');

      // Convert canvas thành blob
      console.log('💾 [SHARE] Bắt đầu convert canvas thành blob...');
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('❌ [SHARE] Failed to create image blob');
          throw new Error('Failed to create image blob');
        }

        console.log('✅ [SHARE] Blob created, size:', blob.size, 'bytes');

        // Tạo File từ blob
        const file = new File([blob], `mood-card-${Date.now()}.png`, {
          type: 'image/png',
        });
        console.log('📁 [SHARE] File created:', {
          name: file.name,
          size: file.size,
          type: file.type,
        });

        // Upload image lên server
        console.log('☁️ [SHARE] Bắt đầu upload image lên server...');
        try {
          const uploadResult = await apiClient.uploadFile(file);
          console.log('✅ [SHARE] Upload thành công:', uploadResult);
          const imageUrl = uploadResult.data.url;
          console.log('🔗 [SHARE] Image URL:', imageUrl);

          // Tạo URL share với meta tags (giống Corner2_2)
          const baseUrl =
            process.env.NEXT_PUBLIC_PUBLIC_URL ||
            (typeof window !== 'undefined' ? window.location.origin : null) ||
            process.env.NEXTAUTH_URL ||
            'https://tiger-corporation-vietnam.vn'; // Fallback to production URL
          
          console.log('🌐 [SHARE] Base URL:', baseUrl);
          
          // Tạo title và description cho mood card
          const shareTitle = moodCardData?.reminder
            ? (moodCardData.reminder.length > 50
                ? moodCardData.reminder.substring(0, 50) + '...'
                : moodCardData.reminder) + ' - Tiger Nhịp Sống'
            : moodCardData?.whisper
            ? `"${moodCardData.whisper.length > 50 ? moodCardData.whisper.substring(0, 50) + '...' : moodCardData.whisper}" - Tiger Nhịp Sống`
            : 'Mood Card - Tiger Nhịp Sống';
          
          const shareDescription = moodCardData?.whisper && moodCardData?.reminder
            ? `"${moodCardData.whisper}"\n\n${moodCardData.reminder}\n\n#TigerNhịpSống #MoodCard`
            : moodCardData?.whisper
            ? `"${moodCardData.whisper}"\n\n#TigerNhịpSống #MoodCard`
            : moodCardData?.reminder
            ? `${moodCardData.reminder}\n\n#TigerNhịpSống #MoodCard`
            : 'Khám phá cảm xúc của bạn qua mood card. Cùng TIGER tham gia thử thách Giữ Nhịp nhé.';

          console.log('📝 [SHARE] Share metadata:', {
            shareTitle,
            shareDescription,
            whisper: moodCardData?.whisper,
            reminder: moodCardData?.reminder,
          });

          // Tạo URL của page share với query params (có meta tags)
          const sharePageUrl = `${baseUrl}/nhip-song/share?imageUrl=${encodeURIComponent(imageUrl)}&whisper=${encodeURIComponent(moodCardData?.whisper || '')}&reminder=${encodeURIComponent(moodCardData?.reminder || '')}`;
          console.log('🔗 [SHARE] Share page URL:', sharePageUrl);

          // Share URL của page (có meta tags) lên Facebook thay vì share URL của image trực tiếp
          const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharePageUrl)}`;
          console.log('📱 [SHARE] Facebook share URL:', facebookShareUrl);
          
          // Console log để debug (giống Corner2_2)
          console.log('🖼️ [NHIP SONG SHARE DEBUG]', {
            imageUrl,
            sharePageUrl,
            shareTitle,
            shareDescription,
            whisper: moodCardData?.whisper,
            reminder: moodCardData?.reminder,
            baseUrl,
          });
          
          console.log('🚪 [SHARE] Bắt đầu mở popup Facebook...');
          const popup = window.open(
            facebookShareUrl,
            'facebook-share-dialog',
            'width=800,height=600,scrollbars=yes,resizable=yes'
          );

          console.log('🔍 [SHARE] Popup object:', popup);
          console.log('🔍 [SHARE] Popup closed:', popup?.closed);
          console.log('🔍 [SHARE] Popup closed type:', typeof popup?.closed);

          // Kiểm tra nếu popup bị block
          if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            console.error('❌ [SHARE] Popup bị chặn hoặc không thể mở');
            console.error('❌ [SHARE] Popup check details:', {
              popupExists: !!popup,
              popupClosed: popup?.closed,
              popupClosedType: typeof popup?.closed,
            });
            toast({
              title: 'Popup bị chặn',
              description: 'Vui lòng cho phép popup để chia sẻ.',
              variant: 'destructive',
              duration: 4000,
            });
            return;
          }

          console.log('✅ [SHARE] Popup đã mở thành công');
          
          // Focus vào popup
          popup.focus();
          console.log('👆 [SHARE] Đã focus vào popup');

          toast({
            title: 'Chia sẻ thành công',
            description: 'Đang mở Facebook để chia sẻ ảnh của bạn.',
            duration: 3000,
          });
          console.log('✅ [SHARE] Quá trình share hoàn tất thành công');
        } catch (uploadError) {
          console.error('❌ [SHARE] Upload image lỗi:', uploadError);
          throw uploadError;
        }
      }, 'image/png');
    } catch (error) {
      console.error('❌ [SHARE] Error sharing image:', error);
      console.error('❌ [SHARE] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
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

  const handleExploreMore = () => {
    navigateWithLoading('/thu-thach-giu-nhip', 'Đang chuyển đến Thử thách giữ nhịp...');
  };

  return (
    <div>
      <main 
        style={{
          backgroundImage: backgroundImage || 'url(/nhipsong/nhipsong_light_background.svg)',
          backgroundSize: 'cover',
          backgroundPosition: isDark ? 'center' : 'bottom',
          backgroundRepeat: 'no-repeat',
          height: 'calc(100vh)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                onExploreMore={handleExploreMore}
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
