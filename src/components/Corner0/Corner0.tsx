'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVideo } from '@/contexts/VideoContext';

interface Corner0Props {
  onVideoEnded?: () => void;
  hideSkip?: boolean;
  onSkip?: () => void;
}

export function Corner0({ onVideoEnded, hideSkip = false, onSkip }: Corner0Props) {
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
  const [hasShownIntro, setHasShownIntro] = useState(false);

  // Sử dụng context để chia sẻ trạng thái video
  const { setIsVideoPlaying } = useVideo();

  // Fetch signed URL from backend
  // IMPORTANT: Only use presigned URL directly - NO fallback to proxy endpoint
  // HTML5 video doesn't need CORS, presigned URLs must be called directly from FE
  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (!videoRef.current) return;

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
        const videoFilename =
          process.env.NEXT_PUBLIC_VIDEO_FILENAME || 'exampleclip.mp4';

        const response = await fetch(
          `${apiUrl}/storage/video-signed/${videoFilename}`
        );
        if (response.ok) {
          const result = await response.json();
          // API response format: { success: true, data: { url: "..." }, message: "Success" }
          const videoUrl = result.data?.url;
          if (videoUrl) {
            videoRef.current.src = videoUrl;
          } else {
            const errorMsg = 'No presigned URL in API response';
            console.error(`❌ ${errorMsg}`);
            setVideoError(`Không thể tải video: ${errorMsg}. Vui lòng kiểm tra backend API.`);
            setIsLoading(false);
          }
        } else {
          const errorMsg = `API returned ${response.status} ${response.statusText}`;
          console.error(`❌ ${errorMsg}`);
          setVideoError(`Không thể tải video: ${errorMsg}. Vui lòng kiểm tra backend API.`);
          setIsLoading(false);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('❌ Error fetching signed URL:', errorMsg);
        setVideoError(`Không thể tải video: ${errorMsg}. Vui lòng kiểm tra kết nối mạng.`);
        setIsLoading(false);
      }
    };

    fetchVideoUrl();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsVideoReady(true);
      setIsLoading(false);
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
      if (!hasShownIntro) {
        setHasShownIntro(true);
        if (onVideoEnded) onVideoEnded();
      }
    };
    const handleError = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      const error = video.error;
      
      // Error code meanings:
      // 1 = MEDIA_ERR_ABORTED
      // 2 = MEDIA_ERR_NETWORK
      // 3 = MEDIA_ERR_DECODE
      // 4 = MEDIA_ERR_SRC_NOT_SUPPORTED
      const errorCodeNames: { [key: number]: string } = {
        1: 'MEDIA_ERR_ABORTED',
        2: 'MEDIA_ERR_NETWORK',
        3: 'MEDIA_ERR_DECODE',
        4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'
      };
      
      let errorDetails = 'Unknown error';
      if (error) {
        const errorName = errorCodeNames[error.code] || `Unknown(${error.code})`;
        errorDetails = `Code: ${error.code} (${errorName}), Message: ${error.message || 'No message'}`;
      }
      
      console.error('❌ Video loading error:', errorDetails);
      console.error('📹 Current source:', video.currentSrc);
      setVideoError(`Video loading failed: ${errorDetails}`);
      setIsLoading(false);
    };
    const handleLoadStart = () => {
      setVideoError(null);
      setIsVideoReady(false);
      setIsLoading(true);
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
      setIsVideoPlaying(false);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [setIsVideoPlaying, onVideoEnded, hasShownIntro]);

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

  // Skip button: stop video and trigger intro modal immediately
  const handleSkipIntro = () => {
    setIsVideoPlaying(false);
    if (onSkip) {
      onSkip();
      return;
    }
    const video = videoRef.current;
    if (!video || hasShownIntro) return;
    try {
      video.pause();
    } catch {}
    setIsPlaying(false);
    setIsVideoEnded(true);
    setShowControls(true);
    if (onVideoEnded) onVideoEnded();
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
          playsInline
          autoPlay
          preload="metadata"
          crossOrigin="anonymous"
        >
          {/* Video URL will be loaded dynamically via Signed URL */}
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

      {/* Skip Intro Button - bottom-right over video - luôn hiển thị khi không hideSkip */}
      {!hideSkip && (
        <div className="absolute bottom-6 right-6 z-40">
          <button
            onClick={handleSkipIntro}
            className="px-3 py-1.5 text-xs md:text-sm rounded-full bg-black/60 hover:bg-black/75 text-white border border-white/20 transition-colors"
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer' }}
          >
            {isLoading ? 'Đang tải...' : 'Bỏ qua'}
          </button>
        </div>
      )}

      {/* Debug Info - tắt hiển thị */}
      {false && (
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
                <h1 className="text-2xl lg:text-3xl font-bold">TIGER</h1>
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
