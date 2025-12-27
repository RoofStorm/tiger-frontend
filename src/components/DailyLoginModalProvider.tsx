'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { DailyLoginModal } from './DailyLoginModal';

export function DailyLoginModalProvider() {
  const { data: session, status } = useSession();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      const pointsAwarded = (session as { pointsAwarded?: boolean }).pointsAwarded;
    //   const pointsAwarded = true;
      const hasShownModal = localStorage.getItem('dailyLoginModalShown');
      
      // Only show modal if pointsAwarded is explicitly true and modal hasn't been shown
      if (pointsAwarded === true && !hasShownModal) {
        // Small delay to ensure UI is ready
        const timer = setTimeout(() => {
          setShowModal(true);
          localStorage.setItem('dailyLoginModalShown', 'true');
        }, 500);
        
        return () => clearTimeout(timer);
      }
    } else if (status === 'unauthenticated') {
      // Clear the flag when user logs out so modal can show again on next login
      localStorage.removeItem('dailyLoginModalShown');
      setShowModal(false);
    }
  }, [session, status]);

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <DailyLoginModal
      isOpen={showModal}
      onClose={handleClose}
    />
  );
}

