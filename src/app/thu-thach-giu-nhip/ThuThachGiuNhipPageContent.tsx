'use client';

import { Header } from '@/components/Header';
import { CornerChallenge } from '@/app/thu-thach-giu-nhip/CornerChallenge';

export function ThuThachGiuNhipPageContent() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFDF5' }}>
        <Header />
        <CornerChallenge />
    </div>
  );
}
