'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface VideoContextType {
  isVideoPlaying: boolean;
  setIsVideoPlaying: (playing: boolean) => void;
}

export const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: ReactNode }) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <VideoContext.Provider value={{ isVideoPlaying, setIsVideoPlaying }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
}
