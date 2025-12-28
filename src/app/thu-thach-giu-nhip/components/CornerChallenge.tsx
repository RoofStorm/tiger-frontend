'use client';

import { ChallengeContainer } from './ChallengeContainer';
import { ChallengeHeaderSection } from './ChallengeHeaderSection';
import { ChallengeHeroSection } from './ChallengeHeroSection';
import { ChallengeCardsSection } from './ChallengeCardsSection';
import { LunchboxChallengeIntro } from './LunchboxChallengeIntro';
import { LunchboxUploadSection } from './LunchboxUploadSection';
import { LunchboxCarousel } from './LunchboxCarousel';
import { ShareNoteSection } from './ShareNoteSection';

export function CornerChallenge() {
  return (
    <>
      <ChallengeContainer>
        {/* Header Section - Title and Introduction */}
        <ChallengeHeaderSection />
        {/* Hero Section - CHỈ VÀNG TRAO TAY */}
        <ChallengeHeroSection />
        {/* Challenge Cards Section - LunchBox and Note Giữ Nhịp */}
        <ChallengeCardsSection />
        
      </ChallengeContainer>
      {/* Lunchbox Challenge Intro */}
      <LunchboxChallengeIntro />
      {/* Lunchbox Upload Section */}
      <LunchboxUploadSection />

      {/* Lunchbox carousel Section */}
      <LunchboxCarousel />

      {/* Share Note Section */}
      <ShareNoteSection />
    </>
  );
}
