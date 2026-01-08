'use client';

import { motion } from 'framer-motion';
import { useCallback, useRef } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useZoneView } from '@/hooks/useZoneView';

export function ChallengeCardsSection() {
  const zoneARef = useRef<HTMLDivElement>(null);
  const { trackClick } = useAnalytics();

  // Track time on Zone A
  useZoneView(zoneARef, {
    page: 'challenge',
    zone: 'zoneA',
  });

  const handleLunchboxClick = useCallback(() => {
    // Track click on Lunchbox Challenge card
    trackClick('challenge', {
      zone: 'zoneA',
      component: 'card',
      metadata: { label: 'lunchbox_challenge' },
    });

    const element = document.getElementById('lunchbox-upload-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [trackClick]);

  const handleNoteClick = useCallback(() => {
    // Track click on Note Giữ Nhịp card
    trackClick('challenge', {
      zone: 'zoneA',
      component: 'card',
      metadata: { label: 'note_giu_nhip_challenge' },
    });

    const element = document.getElementById('highlighted-notes-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [trackClick]);

  return (
    <div ref={zoneARef} className="w-screen relative left-1/2 -translate-x-1/2 grid grid-cols-1 lg:grid-cols-2 gap-0 md:mb-2 px-4 lg:top-[-100px]">
      {/* Left - LunchBox Challenge Image */}
      <motion.div 
        className="relative w-full h-[300px] lg:h-[450px] flex items-center justify-center cursor-pointer p-2"
        onClick={handleLunchboxClick}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative w-full h-full">
          {/* Mobile Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/thuthachnhipsong/lunchbox_challenge_mobile.png"
            alt="LunchBox Challenge"
            className="object-contain md:hidden w-full h-full"
            fetchPriority="high"
          />
          {/* Desktop Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/thuthachnhipsong/lunchbox_challenge.png"
            style={{ scale: 0.9 }}
            alt="LunchBox Challenge"
            className="hidden md:block w-full h-full object-contain"
            fetchPriority="high"
          />
        </div>
      </motion.div>

      {/* Right - Note Giữ Nhịp Image */}
      <motion.div 
        className="relative w-full h-[300px] lg:h-[450px] flex items-center justify-center cursor-pointer p-2"
        onClick={handleNoteClick}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative w-full h-full">
          {/* Mobile Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/thuthachnhipsong/note_giu_nhip_mobile.png"
            alt="Note Giữ Nhịp"
            className="w-full h-full object-contain md:hidden"
            fetchPriority="high"
          />
          {/* Desktop Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/thuthachnhipsong/note_giu_nhip.png"
            alt="Note Giữ Nhịp"
            style={{ scale: 0.9 }}
            className="hidden md:block w-full h-full object-contain"
            fetchPriority="high"
          />
        </div>
      </motion.div>
    </div>
  );
}
