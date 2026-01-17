'use client';

import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HomeVideoPlayer } from '@/components/HomeVideoPlayer';
import { useZoneView } from '@/hooks/useZoneView';
import { useHomeVideo } from '@/hooks/useHomeVideo';
import { HomeContentSection } from '@/components/home/HomeContentSection';
import styles from './HomePageContent.module.css';

export function HomePageContent() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { showVideo, handleVideoEnded, handleSkipVideo } = useHomeVideo();

  // Track time on Welcome page
  useZoneView(pageRef, {
    page: 'welcome',
    zone: 'overview',
    enabled: !showVideo, // Only track when content is shown
  });

  return (
    <div ref={pageRef}>
      {/* Video Player - hiển thị trước khi show content */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            key="video-player"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[70]"
          >
            <HomeVideoPlayer
              onVideoEnded={handleVideoEnded}
              onSkip={handleSkipVideo}
              videoUrl="https://s3.tiger-corporation-vietnam.vn/tiger-videos/tiger%2021.mp4"
            />
          </motion.div>
        )}

        {!showVideo && (
          <motion.main
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className={`relative flex flex-col md:block mt-[64px] xl:mt-[80px] ${styles.mainContent}`}
          >
            <HomeContentSection />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}

