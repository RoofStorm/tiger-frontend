'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function ChallengeHeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative mb-12 md:mb-48"
    >
      {/* Central Image - Always Center */}
      <div className="flex items-center justify-center">
        <Image
          src="/thuthachnhipsong/tiger_giu_nhip.svg"
          alt="Tiger giữ nhịp"
          width={600}
          height={200}
          className="w-full max-w-md md:max-w-lg lg:max-w-xl h-auto object-contain"
        />
      </div>
    </motion.div>
  );
}
