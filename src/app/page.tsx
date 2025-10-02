'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Corner0 } from '@/components/Corner0/Corner0';
import { Corner1 } from '@/components/Corner1/Corner1';
import { Corner2_1 } from '@/components/Corner2_1/Corner2_1';
import { Corner2_2 } from '@/components/Corner2_2/Corner2_2';
import { Corner3 } from '@/components/Corner3/Corner3';
import { Corner4 } from '@/components/Corner4/Corner4';
import { Header } from '@/components/Header';
import { NavigationDots } from '@/components/NavigationDots';
import { VideoProvider, useVideo } from '@/contexts/VideoContext';
import { useCornerAnalytics } from '@/hooks/useCornerAnalytics';

function HomePageContent() {
  const { startTimer, stopTimer } = useCornerAnalytics();
  const [currentSection, setCurrentSection] = useState(0);
  const { isVideoPlaying } = useVideo();

  useEffect(() => {
    const handleScroll = () => {
      const corners = document.querySelectorAll('[data-corner]');
      
      corners.forEach((corner) => {
        const rect = corner.getBoundingClientRect();
        const cornerNumber = parseInt(corner.getAttribute('data-corner') || '0');
        
        // Check if corner is in viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          startTimer(cornerNumber);
        } else {
          stopTimer(cornerNumber);
        }
      });
    };

    // Throttle scroll events
    let timeoutId: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', throttledHandleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [startTimer, stopTimer]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      {/* Header chính - Ẩn khi video phát */}
      <AnimatePresence>
        {!isVideoPlaying && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3 }}
          >
            <Header />
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="relative">
        {/* Corner 0: Video Player */}
        <section data-corner="0" className="min-h-screen w-full">
          <Corner0 />
        </section>

        {/* Corner 1: Emoji Grid & Mood Card */}
        <section data-corner="1" className="min-h-screen w-full">
          <Corner1 />
        </section>

        {/* Corner 2.1: Made in Vietnam Products */}
        <section data-corner="2" className="min-h-screen w-full">
          <Corner2_1 />
        </section>

        {/* Corner 2.2: Image Upload & Gallery */}
        <section data-corner="3" className="min-h-screen w-full">
          <Corner2_2 />
        </section>

        {/* Corner 3: Flip Card */}
        <section data-corner="4" className="min-h-screen w-full">
          <Corner3 />
        </section>

        {/* Corner 4: Rewards */}
        <section data-corner="5" className="min-h-screen w-full">
          <Corner4 />
        </section>
      </main>

      {/* Navigation Dots - Ẩn khi video phát */}
      <AnimatePresence>
        {!isVideoPlaying && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <NavigationDots 
              currentSection={currentSection} 
              onSectionChange={setCurrentSection} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HomePage() {
  return (
    <VideoProvider>
      <HomePageContent />
    </VideoProvider>
  );
}