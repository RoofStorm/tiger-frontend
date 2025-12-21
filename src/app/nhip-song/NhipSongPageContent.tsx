'use client';

import { useState, useEffect } from 'react';
import { EmojiSelectionSection } from './components/EmojiSelectionSection';
import { MoodCardFlipCard } from './components/MoodCardFlipCard';
import { ShareRegistrationModal } from './components/ShareRegistrationModal';
import { RewardModal } from './components/RewardModal';
import { useMoodCard } from '@/hooks/useMoodCard';
import { useGlobalNavigationLoading } from '@/hooks/useGlobalNavigationLoading';
import { useHeaderDarkMode } from '@/contexts/HeaderDarkModeContext';

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

  const handleShare = () => {
    setShowShareModal(true);
    setShowMoodCard(false);
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
