import { useState, useEffect } from 'react';
import { useVideo } from '@/contexts/VideoContext';

export function useHomeVideo() {
  const [showVideo, setShowVideo] = useState(true);
  const { setIsContentReady } = useVideo();

  // Reset video context state when home page mounts
  useEffect(() => {
    setIsContentReady(false);
    // Note: isVideoPlaying will be set by HomeVideoPlayer
  }, [setIsContentReady]);

  const handleVideoEnded = () => {
    setShowVideo(false);
    setIsContentReady(true); // Content đã sẵn sàng sau khi video kết thúc
  };

  const handleSkipVideo = () => {
    setShowVideo(false);
    setIsContentReady(true); // Content đã sẵn sàng sau khi skip video
  };

  return {
    showVideo,
    handleVideoEnded,
    handleSkipVideo,
  };
}

