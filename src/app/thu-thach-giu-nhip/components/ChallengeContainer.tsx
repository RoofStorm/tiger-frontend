'use client';

import { ReactNode } from 'react';

interface ChallengeContainerProps {
  children: ReactNode;
}

export function ChallengeContainer({ children }: ChallengeContainerProps) {
  return (
    <div style={{ backgroundColor: '#FFFDF5' }}>
      <div className="mx-auto sm:px-2 lg:px-4 py-4">
        {/* Container with Background */}
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            backgroundImage: 'url(/thuthachnhipsong/thuthachgiunhip_background.png)',
            backgroundSize: '90%',
            backgroundPosition: 'center 20px',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="max-w-7xl mx-auto sm:px-2 lg:px-4 pt-12 pb-0 md:pb-12">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
