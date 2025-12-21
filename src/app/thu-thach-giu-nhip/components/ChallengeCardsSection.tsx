'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function ChallengeCardsSection() {
  const handleLunchboxClick = () => {
    const element = document.getElementById('lunchbox-upload-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNoteClick = () => {
    const element = document.getElementById('highlighted-notes-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-screen relative left-1/2 -translate-x-1/2 grid grid-cols-1 lg:grid-cols-2 gap-0 mb-16 px-4">
      {/* Left - LunchBox Challenge Image */}
      <motion.div 
        className="relative w-full h-[300px] lg:h-[450px] flex items-center justify-center cursor-pointer p-4"
        onClick={handleLunchboxClick}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative w-full h-full">
          <Image
            src="/thuthachnhipsong/lunchbox_challenge.svg"
            alt="LunchBox Challenge"
            fill
            className="object-contain"
          />
        </div>
      </motion.div>

      {/* Right - Note Giữ Nhịp Image */}
      <motion.div 
        className="relative w-full h-[300px] lg:h-[450px] flex items-center justify-center cursor-pointer p-4"
        onClick={handleNoteClick}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative w-full h-full">
          <Image
            src="/thuthachnhipsong/note_giu_nhip.svg"
            alt="Note Giữ Nhịp"
            fill
            className="object-contain"
          />
        </div>
      </motion.div>
    </div>
  );
}
