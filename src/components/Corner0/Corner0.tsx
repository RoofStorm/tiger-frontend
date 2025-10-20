'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVideo } from '@/contexts/VideoContext';

export function Corner0() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sử dụng context để chia sẻ trạng thái video
  const { setIsVideoPlaying } = useVideo();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsVideoReady(true);
      setIsLoading(false);
      console.log('✅ Video metadata loaded successfully');
      console.log('📹 Video source:', video.currentSrc);
      console.log('⏱️ Video duration:', video.duration, 'seconds');
    };
    const handleCanPlay = () => {
      setIsVideoReady(true);
      setIsLoading(false);
    };
    const handlePlay = () => {
      setIsPlaying(true);
      setIsVideoEnded(false);
      setIsVideoPlaying(true); // Cập nhật context
      // Ẩn controls sau 3 giây khi bắt đầu phát
      setTimeout(() => setShowControls(false), 3000);
    };
    const handlePause = () => {
      setIsPlaying(false);
      setIsVideoPlaying(false); // Cập nhật context
      // Hiện controls ngay khi pause
      setShowControls(true);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setIsVideoPlaying(false); // Cập nhật context
      setIsVideoEnded(true);
      setShowControls(true);
    };
    const handleError = (e: Event) => {
      console.warn('Video loading error, trying fallback:', e);
      setVideoError('Video loading failed, trying fallback...');
      setIsLoading(false);
    };
    const handleLoadStart = () => {
      setVideoError(null);
      setIsVideoReady(false);
      setIsLoading(true);
      console.log('🎬 Video loading started...');
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [setIsVideoPlaying]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
      } else {
        // Đảm bảo video đã sẵn sàng trước khi play
        if (!isVideoReady) {
          return;
        }

        // Reset video về đầu nếu đã kết thúc
        if (video.ended) {
          video.currentTime = 0;
        }

        await video.play();
      }
    } catch (err: unknown) {
      console.error('Play failed:', err);
      setVideoError(
        'Không thể phát video: ' +
          (err instanceof Error ? err.message : 'Unknown error')
      );
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

  // Handle mouse movement để hiện controls khi hover
  const handleMouseMove = () => {
    if (isPlaying) {
      setShowControls(true);
      // Ẩn lại sau 2 giây
      setTimeout(() => setShowControls(false), 2000);
    }
  };

  // Debug: Log states để kiểm tra
  useEffect(() => {
    // States are tracked for debugging
  }, [isPlaying, showControls, isVideoEnded, isLoading, isVideoReady]);

  return (
    <div
      data-corner="0"
      className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          crossOrigin="anonymous"
        >
          {/* Load video từ MinIO - ưu tiên cao nhất */}
          <source
            src="http://localhost:4000/api/storage/video/exampleclip.mp4"
            type="video/mp4"
          />
          {/* Fallback video từ local nếu MinIO không khả dụng */}
          {/* <source src="/videos/exampleclip.mp4" type="video/mp4" /> */}
          {/* <source src="/videos/exampleclip.mkv" type="video/x-matroska" /> */}
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Loading Indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/50"
          >
            <div className="text-center text-white">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 mx-auto mb-4"
              >
                <Loader2 className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">
                Video đang load từ MinIO
              </h3>
              <p className="text-white/70">Vui lòng chờ trong giây lát...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug Info - Chỉ hiển thị trong development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black/70 text-white text-xs p-2 rounded z-40">
          <div>
            🎬 Video Source: {videoRef.current?.currentSrc || 'Loading...'}
          </div>
          <div>
            📊 Status:{' '}
            {isLoading ? 'Loading...' : isVideoReady ? 'Ready' : 'Not ready'}
          </div>
          <div>
            ⏱️ Duration: {duration ? `${duration.toFixed(1)}s` : 'Unknown'}
          </div>
        </div>
      )}

      {/* Error Message */}
      {videoError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-red-900/80">
          <div className="text-center text-white p-8 bg-red-800 rounded-lg max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Lỗi Video</h3>
            <p className="mb-4">{videoError}</p>
            <div className="text-sm text-red-200 space-y-2">
              <p>• Kiểm tra file video có tồn tại không</p>
              <p>• Đảm bảo format MP4 với codec H.264</p>
              <p>• Thử refresh trang</p>
            </div>
            <button
              onClick={() => setVideoError(null)}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Hero Content - Chỉ có controls */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Navigation - Ẩn khi phát video */}
        <AnimatePresence>
          {(!isPlaying || showControls) && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex justify-between items-center p-6 lg:p-8"
            >
              <div className="text-white">
                <h1 className="text-2xl lg:text-3xl font-bold">Tiger</h1>
              </div>
              <div className="flex items-center space-x-4">
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content - Chỉ có CTA Button */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-8">
          <div className="text-center">
            {/* CTA Buttons - Ẩn/hiện khi phát video */}
            <AnimatePresence>
              {(showControls || !isPlaying) && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <Button
                    size="lg"
                    className={`w-20 h-20 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 ${
                      isVideoReady
                        ? 'bg-white/90 hover:bg-white text-black'
                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    }`}
                    onClick={togglePlay}
                    disabled={!isVideoReady}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Video Progress - Ẩn/hiện khi phát video */}
        <AnimatePresence>
          {(showControls || !isPlaying) && isVideoReady && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="px-6 lg:px-8 pb-8"
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center space-x-4 bg-black/30 backdrop-blur-sm rounded-2xl p-4">
                  {/* Progress Bar */}
                  <div className="flex-1">
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Time Display */}
                  <span className="text-white text-sm font-medium min-w-[120px] text-center">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll Indicator - Chỉ hiện khi video kết thúc */}
        <AnimatePresence>
          {isVideoEnded && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
            >
              <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
