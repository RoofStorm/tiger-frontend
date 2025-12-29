'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface VideoContextType {
  isVideoPlaying: boolean;
  setIsVideoPlaying: (playing: boolean) => void;
  isContentReady: boolean;
  setIsContentReady: (ready: boolean) => void;
}

export const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: ReactNode }) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);

  return (
    <VideoContext.Provider value={{ isVideoPlaying, setIsVideoPlaying, isContentReady, setIsContentReady }}>
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

// Optional hook that returns null if VideoContext is not available
export function useVideoOptional() {
  return useContext(VideoContext);
}
