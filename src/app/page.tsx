'use client';

import { useEffect } from 'react';
import { Corner0 } from '@/components/Corner0/Corner0';
import { Corner1 } from '@/components/Corner1/Corner1';
import { Corner2 } from '@/components/Corner2/Corner2';
import { Corner3 } from '@/components/Corner3/Corner3';
import { Corner4 } from '@/components/Corner4/Corner4';
import { Header } from '@/components/Header';
import { useCornerAnalytics } from '@/hooks/useCornerAnalytics';

export default function HomePage() {
  const { startTimer, stopTimer } = useCornerAnalytics();

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
      <Header />
      
      <main className="relative">
        {/* Corner 0: Video Player */}
        <section data-corner="0" className="min-h-screen">
          <Corner0 />
        </section>

        {/* Corner 1: Emoji Grid & Mood Card */}
        <section data-corner="1" className="min-h-screen">
          <Corner1 />
        </section>

        {/* Corner 2: Image Upload & Gallery */}
        <section data-corner="2" className="min-h-screen">
          <Corner2 />
        </section>

        {/* Corner 3: Flip Card */}
        <section data-corner="3" className="min-h-screen">
          <Corner3 />
        </section>

        {/* Corner 4: Rewards */}
        <section data-corner="4" className="min-h-screen">
          <Corner4 />
        </section>
      </main>
    </div>
  );
}