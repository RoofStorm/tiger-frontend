'use client';

import { motion } from 'framer-motion';

export function ChallengeHeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative mb-12 md:mb-32 hidden md:block"
    >
      {/* Central Image - Always Center */}
      <div className="flex items-center justify-center relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/thuthachnhipsong/tiger_giaithuong.png"
          alt="TIGER giữ nhịp"
          width={600}
          height={200}
          className="w-full max-w-md md:max-w-[27rem] h-auto object-contain"
        />
      </div>
    </motion.div>
  );
}
