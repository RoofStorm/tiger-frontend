'use client';

import { ReactNode } from 'react';
import Image from 'next/image';

interface ChallengeContainerProps {
  children: ReactNode;
}

export function ChallengeContainer({ children }: ChallengeContainerProps) {
  return (
    <div className="bg-[#FFFDF5]">
      <div className="mx-auto sm:px-2 lg:px-4 py-4 mt-[64px] xl:mt-[80px]">
        <div className="relative rounded-lg overflow-hidden">
          {/* Background image */}
          <Image
            src="/thuthachnhipsong/thuthachgiunhip_background.png"
            alt=""
            fill
            sizes="100vw"
            className="object-contain object-center translate-y-[50px]"
            priority={false}
          />

          {/* Content */}
          <div className="relative z-10 max-w-8xl mx-auto sm:px-2 lg:px-4 pt-4 pb-0 md:pb-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
