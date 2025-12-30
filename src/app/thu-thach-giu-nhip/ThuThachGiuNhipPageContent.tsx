'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HomeVideoPlayer } from '@/components/HomeVideoPlayer';
import { CornerChallenge } from './components/CornerChallenge';
import { useZoneView } from '@/hooks/useZoneView';

export function ThuThachGiuNhipPageContent() {
  const [showVideo, setShowVideo] = useState(true);
  const mainRef = useRef<HTMLElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // Track time on Challenge page (Overview)
  useZoneView(pageRef, {
    page: 'challenge',
    zone: 'overview',
    enabled: !showVideo, // Only track when content is shown
  });

  const handleVideoEnded = () => {
    setShowVideo(false);
  };

  const handleSkipVideo = () => {
    setShowVideo(false);
  };

  return (
    <div ref={pageRef} className="">
      {/* Video Player - hiển thị trước khi show content */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            key="video-player"
            exit={{ y: '-100%' }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[70]"
          >
            <HomeVideoPlayer
              onVideoEnded={handleVideoEnded}
              onSkip={handleSkipVideo}
              videoUrl="https://s3.tiger-corporation-vietnam.vn/tiger-videos/Coner2.mp4"
              showMuteButton={false}
            />
          </motion.div>
        )}

        {!showVideo && (
          <motion.main
            key="main-content"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            ref={mainRef}
            className="min-h-screen"
            style={{ backgroundColor: '#FFFDF5', minHeight: 'calc(100vh - 80px)' }}
          >
            <CornerChallenge />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
