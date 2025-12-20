'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { EmojiSelectionSection } from './components/EmojiSelectionSection';
import { MoodCardFlipCard } from './components/MoodCardFlipCard';
import { ShareRegistrationModal } from './components/ShareRegistrationModal';
import { RewardModal } from './components/RewardModal';
import { useMoodCard } from '@/hooks/useMoodCard';
import { useGlobalNavigationLoading } from '@/hooks/useGlobalNavigationLoading';

const getBackgroundImage = (): string => {
  const now = new Date();
  const hour = now.getHours();
  // Từ 18:00 (6 giờ chiều) đến 05:59 (gần 6 giờ sáng) dùng dark background
  // Từ 06:00 (6 giờ sáng) đến 17:59 (gần 6 giờ chiều) dùng light background
  if (hour >= 18 || hour < 6) {
    return 'url(/nhipsong/nhipsong_dark_background.svg)';
  }
  return 'url(/nhipsong/nhipsong_light_background.svg)';
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
  const [backgroundImage, setBackgroundImage] = useState<string>(getBackgroundImage());
  const [isDark, setIsDark] = useState<boolean>(isDarkMode());
  const { navigateWithLoading } = useGlobalNavigationLoading();

  // Cập nhật background image và dark mode dựa trên thời gian
  useEffect(() => {
    const updateBackground = () => {
      setBackgroundImage(getBackgroundImage());
      setIsDark(isDarkMode());
    };

    // Cập nhật ngay khi component mount
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
      <Header isDarkMode={showShareModal} />
      <main 
        style={{
          backgroundImage: backgroundImage,
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
