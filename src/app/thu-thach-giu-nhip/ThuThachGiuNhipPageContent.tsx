'use client';

import { CornerChallenge } from './components/CornerChallenge';

export function ThuThachGiuNhipPageContent() {
  return (
    <div className="min-h-screen">
      <main style={{ backgroundColor: '#FFFDF5', minHeight: 'calc(100vh - 80px)' }}>
        <CornerChallenge />
      </main>
    </div>
  );
}
