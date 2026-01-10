'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { EmojiSelectionSection } from './components/EmojiSelectionSection';
import { MoodCardFlipCard } from './components/MoodCardFlipCard';
import { ShareRegistrationModal } from './components/ShareRegistrationModal';
import { RewardModal } from './components/RewardModal';
import { RewardImageModal } from '@/components/RewardImageModal';
import { useMoodCard } from '@/hooks/useMoodCard';
import { useGlobalNavigationLoading } from '@/hooks/useGlobalNavigationLoading';
import { useHeaderDarkMode } from '@/contexts/HeaderDarkModeContext';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useZoneView } from '@/hooks/useZoneView';
import { useDarkModeByTime } from '@/hooks/useDarkModeByTime';
import { useShareMoodCard } from '@/hooks/useShareMoodCard';

interface UIState {
  showMoodCard: boolean;
  showShareModal: boolean;
  showRewardModal: boolean;
  showChallengePopup: boolean;
}

export function NhipSongPageContent() {
  // Grouped UI state management
  const [uiState, setUIState] = useState<UIState>({
    showMoodCard: false,
    showShareModal: false,
    showRewardModal: false,
    showChallengePopup: false,
  });

  const { navigateWithLoading } = useGlobalNavigationLoading();
  const { setIsDarkMode } = useHeaderDarkMode();
  const { isAuthenticated } = useNextAuth();
  const pageRef = useRef<HTMLDivElement>(null);
  const { trackClick } = useAnalytics();
  
  // Use custom hooks for dark mode and sharing
  const isDark = useDarkModeByTime();

  // Track time on Emoji page
  useZoneView(pageRef, {
    page: 'emoji',
    zone: 'overview',
    enabled: !uiState.showMoodCard, // Only track when showing emoji selection
  });

  // Update header dark mode when share modal changes
  useEffect(() => {
    setIsDarkMode(uiState.showShareModal);
  }, [uiState.showShareModal, setIsDarkMode]);

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

  // Use share hook
  const { share: handleShare } = useShareMoodCard({
    isAuthenticated,
    moodCardData,
    onShareModalOpen: () => {
      setUIState(prev => ({ ...prev, showShareModal: true, showMoodCard: false }));
    },
    onShareModalClose: () => {
      setUIState(prev => ({ ...prev, showShareModal: false }));
    },
  });

  const handleGenerateMoodCard = () => {
    // Track CTA click "Tham gia ngay"
    trackClick('emoji', {
      zone: 'overview',
      component: 'button',
      metadata: { label: 'tham_gia_ngay' },
    });
    
    const data = generateMoodCard();
    if (data) {
      setUIState(prev => ({ ...prev, showMoodCard: true }));
    }
  };

  const handleReset = () => {
    reset();
    setUIState(prev => ({ ...prev, showMoodCard: false }));
  };

  const handleMoodCardClose = () => {
    setUIState(prev => ({ ...prev, showMoodCard: false, showChallengePopup: true }));
  };

  const handleSaveMoodCard = async () => {
    try {
      // TODO: Implement save to backend
      handleReset();
    } catch (error) {
      console.error('Failed to save mood card:', error);
    }
  };

  const handleRegister = () => {
    setUIState(prev => ({ ...prev, showShareModal: false, showRewardModal: true }));
  };

  const handleLogin = () => {
    // TODO: Implement login logic
    setUIState(prev => ({ ...prev, showShareModal: false }));
  };

  const handleNextPage = () => {
    setUIState(prev => ({ ...prev, showRewardModal: false }));
    navigateWithLoading('/thu-thach-giu-nhip', 'Đang chuyển đến Thử thách giữ nhịp...');
  };

  return (
    <div ref={pageRef}>
      <main className="relative min-h-[calc(100vh-80px)] mt-[64px] xl:mt-[80px]">
        {/* Background Image using Next.js Image component */}
        <Image
          src={
            isDark
              ? '/nhipsong/nhipsong_dark_background.jpg'
              : '/nhipsong/nhipsong_light_background.jpg'
          }
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{
            objectPosition: isDark ? 'center' : 'bottom',
          }}
        />
        
        {/* Content with z-index to appear above background */}
        <div className={`relative z-10 max-w-xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 flex flex-col ${isDark ? 'justify-start py-6' : 'justify-center md:justify-start py-6 2xl:py-12'}`}>
          {!uiState.showMoodCard ? (
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
                onClose={handleMoodCardClose}
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
        isOpen={uiState.showShareModal}
        onClose={() => setUIState(prev => ({ ...prev, showShareModal: false }))}
        onRegister={handleRegister}
        onLogin={handleLogin}
      />

      {/* Reward Modal */}
      <RewardModal
        isOpen={uiState.showRewardModal}
        onClose={() => setUIState(prev => ({ ...prev, showRewardModal: false }))}
        onNextPage={handleNextPage}
      />

      {/* Challenge Popup */}
      <RewardImageModal
        isOpen={uiState.showChallengePopup}
        onClose={() => setUIState(prev => ({ ...prev, showChallengePopup: false }))}
        imagePath="/popup/thamgia_thuthachgiunhip.png"
        alt="Tham gia thử thách giữ nhịp"
        showCloseButton={false}
        buttonText=""
        closeOnContentClick={true}
        contentClickTriggerButtonClick={true}
        onButtonClick={() => {
          setUIState(prev => ({ ...prev, showChallengePopup: false }));
          navigateWithLoading('/thu-thach-giu-nhip', 'Đang chuyển đến Thử thách giữ nhịp...');
        }}
      />
    </div>
  );
}
