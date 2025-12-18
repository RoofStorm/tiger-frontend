'use client';

import { Header } from '@/components/Header';
import { CornerChallenge } from './components/CornerChallenge';

export function ThuThachGiuNhipPageContent() {
  return (
    <div className="min-h-screen">
      <Header />
      <main style={{ backgroundColor: '#FFFDF5', minHeight: 'calc(100vh - 80px)' }}>
        <CornerChallenge />
      </main>
    </div>
  );
}
