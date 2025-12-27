'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HomeVideoPlayer } from '@/components/HomeVideoPlayer';
import { CornerChallenge } from './components/CornerChallenge';

export function ThuThachGiuNhipPageContent() {
  const [showVideo, setShowVideo] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

  const handleVideoEnded = () => {
    setShowVideo(false);
  };

  const handleSkipVideo = () => {
    setShowVideo(false);
  };

  return (
    <div className="">
      {/* Video Player - hiển thị trước khi show content */}
      <AnimatePresence>
        {showVideo && (
          <HomeVideoPlayer
            onVideoEnded={handleVideoEnded}
            onSkip={handleSkipVideo}
            videoUrl="https://s3.tiger-corporation-vietnam.vn/tiger-videos/Coner2.mp4"
            showMuteButton={false}
          />
        )}
      </AnimatePresence>

      {/* Main Content - chỉ hiển thị sau khi video kết thúc */}
      <AnimatePresence>
        {!showVideo && (
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
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
