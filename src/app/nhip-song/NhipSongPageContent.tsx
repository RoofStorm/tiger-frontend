'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { EmojiSelectionSection } from './components/EmojiSelectionSection';
import { MoodCardFlipCard } from './components/MoodCardFlipCard';
import { ShareRegistrationModal } from './components/ShareRegistrationModal';
import { RewardModal } from './components/RewardModal';
import { useMoodCard } from '@/hooks/useMoodCard';
import { useGlobalNavigationLoading } from '@/hooks/useGlobalNavigationLoading';

export function NhipSongPageContent() {
  const [showMoodCard, setShowMoodCard] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const { navigateWithLoading } = useGlobalNavigationLoading();

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

  return (
    <div className="min-h-screen">
      <Header isDarkMode={showShareModal} />
      <main 
        className="pt-5 min-h-[calc(100vh-80px)]"
        style={{
          backgroundImage: 'url(/nhipsong/nhipsong_light_background.jpg)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!showMoodCard ? (
            <EmojiSelectionSection
              selectedEmojis={selectedEmojis}
              onEmojiSelect={handleEmojiSelect}
              onEmojiRemove={handleEmojiRemove}
              onGenerateMoodCard={handleGenerateMoodCard}
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
