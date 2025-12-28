'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVideo } from '@/contexts/VideoContext';

interface HomeVideoPlayerProps {
  onVideoEnded?: () => void;
  onSkip?: () => void;
  videoUrl?: string;
  showMuteButton?: boolean;
}

export function HomeVideoPlayer({ onVideoEnded, onSkip, videoUrl, showMuteButton = true }: HomeVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasShownIntro, setHasShownIntro] = useState(false);
  const [hasUnmuted, setHasUnmuted] = useState(false);

  // Sử dụng context để chia sẻ trạng thái video
  const { setIsVideoPlaying } = useVideo();

  // Helper function để thêm debug log
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
  };

  // TEMPORARY: Sử dụng URL trực tiếp thay vì fetch từ API
  // TODO: Sau này sẽ quay lại fetch signed URL từ backend
  // Xử lý CORS bằng cách fetch video qua blob và tạo object URL
  useEffect(() => {
    const loadVideoUrl = async () => {
      if (!videoRef.current) return;

      // URL mặc định là Coner2.mp4, có thể override qua prop
      const defaultVideoUrl = 'https://s3.tiger-corporation-vietnam.vn/tiger-videos/tiger%2011.mp4';
      const finalVideoUrl = videoUrl || defaultVideoUrl;

      addDebugLog('🔄 Starting to load video URL...');
      addDebugLog(`🌐 User Agent: ${navigator.userAgent}`);
      addDebugLog(`📱 Is Mobile: ${/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}`);
      
      // Check video format support before loading
      const testVideoElement = document.createElement('video');
      const mp4Support = testVideoElement.canPlayType('video/mp4');
      const h264Support = testVideoElement.canPlayType('video/mp4; codecs="avc1.42E01E"');
      addDebugLog(`🎬 Browser MP4 support: ${mp4Support || 'no'}`);
      addDebugLog(`🎬 Browser H.264 support: ${h264Support || 'no'}`);

      try {
        addDebugLog(`🔗 Fetching video via blob to avoid CORS: ${finalVideoUrl}`);
        
        // Fetch video qua blob để tránh CORS
        const response = await fetch(finalVideoUrl, {
          mode: 'cors',
          credentials: 'omit',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        addDebugLog(`✅ Created blob URL from video`);
        videoRef.current.src = blobUrl;
        addDebugLog('✅ Loaded video with blob URL (CORS handled)');
        
        // Cleanup blob URL khi component unmount
        return () => {
          URL.revokeObjectURL(blobUrl);
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        addDebugLog(`❌ Error fetching video: ${errorMsg}`);
        
        // Fallback: thử set URL trực tiếp (không có crossOrigin)
        addDebugLog(`🔄 Trying direct URL without CORS...`);
        try {
          videoRef.current.src = finalVideoUrl;
          addDebugLog('✅ Fallback: Using direct URL');
        } catch (fallbackError) {
          const fallbackMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
          addDebugLog(`❌ Fallback also failed: ${fallbackMsg}`);
          setVideoError(`Không thể tải video: ${errorMsg}. Vui lòng kiểm tra kết nối mạng hoặc CORS settings.`);
          setIsLoading(false);
        }
      }
    };

    loadVideoUrl();
  }, [videoUrl]);

  // OLD CODE: Fetch signed URL from backend - hardcode filename "tiger 11.mp4"
  // IMPORTANT: Only use presigned URL directly - NO fallback to proxy endpoint
  // HTML5 video doesn't need CORS, presigned URLs must be called directly from FE
  // useEffect(() => {
  //   const fetchVideoUrl = async () => {
  //     if (!videoRef.current) return;

  //     const apiUrl =
  //       process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
  //     const videoFilename = 'tiger 11.mp4'; // Hardcode filename

  //     addDebugLog('🔄 Starting to fetch video URL...');
  //     addDebugLog(`📡 API URL: ${apiUrl}`);
  //     addDebugLog(`📁 Video filename: ${videoFilename}`);
  //     addDebugLog(`🌐 User Agent: ${navigator.userAgent}`);
  //     addDebugLog(`📱 Is Mobile: ${/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}`);
      
  //     // Check video format support before loading
  //     const testVideoElement = document.createElement('video');
  //     const mp4Support = testVideoElement.canPlayType('video/mp4');
  //     const h264Support = testVideoElement.canPlayType('video/mp4; codecs="avc1.42E01E"');
  //     addDebugLog(`🎬 Browser MP4 support: ${mp4Support || 'no'}`);
  //     addDebugLog(`🎬 Browser H.264 support: ${h264Support || 'no'}`);

  //     try {
  //       const signedUrl = `${apiUrl}/storage/video-signed/${encodeURIComponent(videoFilename)}`;
  //       addDebugLog(`🌐 Fetching signed URL: ${signedUrl}`);
        
  //       const response = await fetch(signedUrl);
  //       addDebugLog(`📥 Response status: ${response.status} ${response.statusText}`);
        
  //       if (response.ok) {
  //         const result = await response.json();
  //         addDebugLog(`📦 Response data: ${JSON.stringify(result).substring(0, 200)}...`);
          
  //         // API response format: { success: true, data: { url: "..." }, message: "Success" }
  //         const videoUrl = result.data?.url;
  //         if (videoUrl) {
  //           videoRef.current.src = videoUrl;
  //           addDebugLog('✅ Loaded video with Signed URL from Cloudflare R2');
  //           addDebugLog(`🔗 Video URL: ${videoUrl.substring(0, 100)}...`);
  //         } else {
  //           const errorMsg = 'No presigned URL in API response';
  //           addDebugLog(`❌ ${errorMsg}`);
  //           setVideoError(`Không thể tải video: ${errorMsg}. Vui lòng kiểm tra backend API.`);
  //           setIsLoading(false);
  //         }
  //       } else {
  //         const errorMsg = `API returned ${response.status} ${response.statusText}`;
  //         addDebugLog(`❌ ${errorMsg}`);
  //         setVideoError(`Không thể tải video: ${errorMsg}. Vui lòng kiểm tra backend API.`);
  //         setIsLoading(false);
  //       }
  //     } catch (error) {
  //       const errorMsg = error instanceof Error ? error.message : String(error);
  //       addDebugLog(`❌ Error fetching signed URL: ${errorMsg}`);
  //       setVideoError(`Không thể tải video: ${errorMsg}. Vui lòng kiểm tra kết nối mạng.`);
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchVideoUrl();
  // }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setIsLoading(false);
      addDebugLog('✅ Video metadata loaded successfully');
      addDebugLog(`📹 Video source: ${video.currentSrc?.substring(0, 100)}...`);
      addDebugLog(`⏱️ Video duration: ${video.duration} seconds`);
      addDebugLog(`📐 Video dimensions: ${video.videoWidth}x${video.videoHeight}`);
    };
    const handleCanPlay = () => {
      setIsLoading(false);
      addDebugLog('▶️ Video can play');
      // Auto play khi video ready
      video.play().then(() => {
        addDebugLog('✅ Auto play started');
      }).catch((err) => {
        const errorMsg = err instanceof Error ? err.message : String(err);
        addDebugLog(`❌ Auto play failed: ${errorMsg}`);
      });
    };
    const handlePlay = () => {
      setIsVideoPlaying(true); // Cập nhật context
    };
    const handlePause = () => {
      setIsVideoPlaying(false); // Cập nhật context
    };
    const handleEnded = () => {
      setIsVideoPlaying(false); // Cập nhật context
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
        addDebugLog(`❌ Video error: ${errorDetails}`);
        addDebugLog(`📹 Current source: ${video.currentSrc?.substring(0, 100)}...`);
        addDebugLog(`🔄 Network state: ${video.networkState} (0=EMPTY, 1=IDLE, 2=LOADING, 3=NO_SOURCE, 4=LOADED_METADATA)`);
        addDebugLog(`📊 Ready state: ${video.readyState} (0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA, 3=HAVE_FUTURE_DATA, 4=HAVE_ENOUGH_DATA)`);
        addDebugLog(`🌐 User Agent: ${navigator.userAgent}`);
        addDebugLog(`📱 Is Mobile: ${/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}`);
        
        // Check video format support
        const errorTestVideo = document.createElement('video');
        const mp4SupportError = errorTestVideo.canPlayType('video/mp4');
        const h264SupportError = errorTestVideo.canPlayType('video/mp4; codecs="avc1.42E01E"');
        addDebugLog(`🎬 Can play MP4: ${mp4SupportError || 'no'}`);
        addDebugLog(`🎬 Can play H.264: ${h264SupportError || 'no'}`);
      }
      
      // Video error - show error message (no fallback)
      addDebugLog('❌ Video loading failed');
      setVideoError(`Video loading failed: ${errorDetails}`);
      setIsLoading(false);
    };
    const handleLoadStart = () => {
      setVideoError(null);
      setIsLoading(true);
      addDebugLog('🎬 Video loading started...');
      addDebugLog(`📹 Video source: ${video.src?.substring(0, 100)}...`);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

      return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [setIsVideoPlaying, onVideoEnded, hasShownIntro]);

  // Skip button: stop video and trigger callback immediately
  const handleSkip = () => {
    if (onSkip) {
      onSkip();
      return;
    }
    const video = videoRef.current;
    if (!video || hasShownIntro) return;
    try {
      video.pause();
    } catch {}
    setIsVideoPlaying(false);
    if (onVideoEnded) onVideoEnded();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle first tap anywhere on screen to unmute
  const handleFirstTap = () => {
    if (hasUnmuted || !isMuted) return; // Chỉ unmute nếu chưa unmute và đang muted
    
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    setIsMuted(false);
    setHasUnmuted(true);
    addDebugLog('🔊 Unmuted video on first tap');
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[70] bg-black"
      onClick={handleFirstTap}
      onTouchStart={handleFirstTap}
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="w-full h-full md:h-auto object-contain"
          muted={isMuted}
          playsInline
          autoPlay
          preload="metadata"
        >
          {/* Video URL will be loaded dynamically via Signed URL */}
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-t via-black/40 to-transparent" />
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
                Video đang tải
              </h3>
              <p className="text-white/70">Vui lòng chờ trong giây lát...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Controls - Mute Button */}
      {showMuteButton && (
        <div className="absolute top-6 right-6 z-40">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            disabled={isLoading}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
        </div>
      )}

      {/* Skip Button - bottom-right over video */}
      <div className="absolute bottom-6 right-6 z-40">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="px-3 py-1.5 text-xs md:text-sm rounded-full bg-black/60 hover:bg-black/75 text-white border border-white/20 transition-colors"
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer' }}
        >
          {isLoading ? 'Đang tải...' : 'Bỏ qua'}
        </button>
      </div>

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
              onClick={() => {
                setVideoError(null);
                handleSkip();
              }}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              Bỏ qua
            </button>
          </div>
        </div>
      )}

      {/* Debug Panel - hiển thị logs trên màn hình */}
      {/* Commented out - không hiển thị logs trên màn hình */}
      {/* <div className="absolute top-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-black/90 text-white text-xs p-4 rounded-lg max-h-[60vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold text-sm">🔍 Debug Logs</h4>
          <button
            onClick={() => setDebugLogs([])}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            Clear
          </button>
        </div>
        <div className="space-y-1 font-mono">
          {debugLogs.length === 0 ? (
            <p className="text-gray-400">No logs yet...</p>
          ) : (
            debugLogs.map((log, index) => (
              <div key={index} className="text-xs break-words">
                {log}
              </div>
            ))
          )}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-700 text-xs">
          <div>Video Ready: {isVideoReady ? '✅' : '❌'}</div>
          <div>Loading: {isLoading ? '⏳' : '✅'}</div>
          <div>Playing: {isPlaying ? '▶️' : '⏸️'}</div>
          <div>Muted: {isMuted ? '🔇' : '🔊'}</div>
          <div>Current Source: {videoRef.current?.currentSrc ? '✅' : '❌'}</div>
          {videoRef.current?.error && (
            <div className="text-red-400">
              Error: {videoRef.current.error.code} - {videoRef.current.error.message}
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
}

