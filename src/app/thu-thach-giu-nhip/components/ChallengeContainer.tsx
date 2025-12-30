'use client';

import { ReactNode } from 'react';

interface ChallengeContainerProps {
  children: ReactNode;
}

export function ChallengeContainer({ children }: ChallengeContainerProps) {
  return (
    <div style={{ backgroundColor: '#FFFDF5' }}>
      <div className="mx-auto sm:px-2 lg:px-4 py-4 mt-[64px] xl:mt-[80px]">
        {/* Container with Background */}
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            backgroundImage: 'url(/thuthachnhipsong/thuthachgiunhip_background.png)',
            backgroundSize: '70%',
            backgroundPosition: 'center 50px',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="max-w-8xl mx-auto sm:px-2 lg:px-4 pt-4 pb-0 md:pb-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
