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
          src="/thuthachnhipsong/tiger_giu_nhip.svg"
          alt="Tiger giữ nhịp"
          width={600}
          height={200}
          className="w-full max-w-md md:max-w-[27rem] h-auto object-contain"
        />
        {/* Prize Value Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            {/* Top text */}
            <p
              className="font-nunito"
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontStyle: 'normal',
                fontSize: '20px',
                lineHeight: '30px',
                letterSpacing: '0%',
                color: '#000000',
              }}
            >
              Tổng giá trị giải thưởng
            </p>
            {/* Number and unit */}
            <div className="flex flex-col items-center justify-center">
              <span
                className="font-nunito font-bold"
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                  fontSize: '54px',
                  lineHeight: '60px',
                  color: '#FDB022',
                }}
              >
                12.000.000
              </span>
              <span
                className="font-nunito"
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '14px',
                  color: '#000000',
                  fontWeight: 700,
                }}
              >
                VNĐ
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
