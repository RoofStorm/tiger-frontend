'use client';

import { VideoProvider } from '@/contexts/VideoContext';
import { HomePageContent } from './HomePageContent';

export default function HomePage() {
  return (
    <VideoProvider>
      <HomePageContent />
    </VideoProvider>
  );
}
