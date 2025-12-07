'use client';

import { VideoProvider } from '@/contexts/VideoContext';
import { VideoPageContent } from './VideoPageContent';

export default function VideoPage() {
  return (
    <VideoProvider>
      <VideoPageContent />
    </VideoProvider>
  );
}

