'use client';

import { motion } from 'framer-motion';

export function ChallengeHeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative mb-12 md:mb-48"
    >
      {/* Central Text in Yellow Oval - Always Center */}
      <div className="flex items-center justify-center">
        <div className="bg-[#FFE5B4] rounded-full px-8 py-6 lg:px-12 lg:py-8">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-noto-sans text-gray-700 font-medium whitespace-nowrap">
            CHỈ VÀNG TRAO TAY
          </p>
        </div>
      </div>
    </motion.div>
  );
}
