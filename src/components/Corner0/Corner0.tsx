'use client';

import { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Corner0() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center">
      {/* Video Container */}
      <div className="relative w-full max-w-4xl mx-auto">
        <video
          ref={videoRef}
          className="w-full h-auto rounded-lg shadow-2xl"
          poster="/api/placeholder/800/450"
          muted={isMuted}
          loop
        >
          <source src="/videos/tiger-intro.mp4" type="video/mp4" />
          <source src="/videos/tiger-intro.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>

        {/* Video Overlay */}
        <div className="absolute inset-0 bg-black/20 rounded-lg" />

        {/* Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="lg"
            className="w-20 h-20 rounded-full bg-white/90 hover:bg-white text-black"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>
        </div>

        {/* Video Controls */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center space-x-4 bg-black/50 backdrop-blur-sm rounded-lg p-4">
            {/* Progress Bar */}
            <div className="flex-1">
              <div className="w-full bg-white/30 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Time Display */}
            <span className="text-white text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Mute Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content Overlay */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white z-10">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            Tiger
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl">
            Chia sẻ cảm xúc, nhận phần thưởng
          </p>
          <p className="text-lg md:text-xl opacity-90 max-w-xl">
            Khám phá 5 góc cảm xúc đặc biệt và tạo ra những khoảnh khắc ý nghĩa
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

