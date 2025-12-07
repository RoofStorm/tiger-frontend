'use client';

import { Header } from '@/components/Header';
import { Corner4 } from '@/components/Corner4/Corner4';

export function UuDaiPageContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      <Header />
      <main className="pt-20">
        <Corner4 />
      </main>
    </div>
  );
}

