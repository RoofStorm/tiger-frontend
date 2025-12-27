'use client';

import { VideoProvider } from '@/contexts/VideoContext';
import { ThuThachGiuNhipPageContent } from './ThuThachGiuNhipPageContent';

export default function ThuThachGiuNhipPage() {
  return (
    <VideoProvider>
      <ThuThachGiuNhipPageContent />
    </VideoProvider>
  );
}

