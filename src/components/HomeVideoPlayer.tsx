'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVideo } from '@/contexts/VideoContext';

interface HomeVideoPlayerProps {
  onVideoEnded?: () => void;
  onSkip?: () => void;
}

export function HomeVideoPlayer({ onVideoEnded, onSkip }: HomeVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasShownIntro, setHasShownIntro] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Sử dụng context để chia sẻ trạng thái video
  const { setIsVideoPlaying } = useVideo();

  // Helper function để thêm debug log
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs((prev) => [...prev.slice(-19), logMessage]); // Giữ tối đa 20 logs
  };

  // Fetch signed URL from backend - hardcode filename "tiger 11.mp4"
  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (!videoRef.current) return;

      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
      const videoFilename = 'tiger 11.mp4'; // Hardcode filename
      const fallbackUrl = `${apiUrl}/storage/video/${encodeURIComponent(videoFilename)}`;

      addDebugLog('🔄 Starting to fetch video URL...');
      addDebugLog(`📡 API URL: ${apiUrl}`);
      addDebugLog(`📁 Video filename: ${videoFilename}`);

      // Nếu đã dùng fallback, không thử lại signed URL
      if (useFallback) {
        videoRef.current.src = fallbackUrl;
        addDebugLog('⚠️ Using fallback streaming endpoint (CORS issue)');
        addDebugLog(`🔗 Fallback URL: ${fallbackUrl}`);
        return;
      }

      try {
        const signedUrl = `${apiUrl}/storage/video-signed/${encodeURIComponent(videoFilename)}`;
        addDebugLog(`🌐 Fetching signed URL: ${signedUrl}`);
        
        const response = await fetch(signedUrl);
        addDebugLog(`📥 Response status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const result = await response.json();
          addDebugLog(`📦 Response data: ${JSON.stringify(result).substring(0, 200)}...`);
          
          // API response format: { success: true, data: { url: "..." }, message: "Success" }
          const videoUrl = result.data?.url;
          if (videoUrl) {
            videoRef.current.src = videoUrl;
            addDebugLog('✅ Loaded video with Signed URL from Cloudflare R2');
            addDebugLog(`🔗 Video URL: ${videoUrl.substring(0, 100)}...`);
          } else {
            // Fallback to NestJS streaming endpoint
            setUseFallback(true);
            videoRef.current.src = fallbackUrl;
            addDebugLog('⚠️ No URL in response, using fallback');
            addDebugLog(`🔗 Fallback URL: ${fallbackUrl}`);
          }
        } else {
          // Fallback to NestJS streaming endpoint
          setUseFallback(true);
          videoRef.current.src = fallbackUrl;
          addDebugLog(`⚠️ Response not OK (${response.status}), using fallback`);
          addDebugLog(`🔗 Fallback URL: ${fallbackUrl}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        addDebugLog(`❌ Error fetching signed URL: ${errorMsg}`);
        // Fallback to NestJS streaming endpoint
        setUseFallback(true);
        if (videoRef.current) {
          videoRef.current.src = fallbackUrl;
          addDebugLog(`🔗 Using fallback URL: ${fallbackUrl}`);
        }
      }
    };

    fetchVideoUrl();
  }, [useFallback]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setIsVideoReady(true);
      setIsLoading(false);
      addDebugLog('✅ Video metadata loaded successfully');
      addDebugLog(`📹 Video source: ${video.currentSrc?.substring(0, 100)}...`);
      addDebugLog(`⏱️ Video duration: ${video.duration} seconds`);
      addDebugLog(`📐 Video dimensions: ${video.videoWidth}x${video.videoHeight}`);
    };
    const handleCanPlay = () => {
      setIsVideoReady(true);
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
      setIsPlaying(true);
      setIsVideoEnded(false);
      setIsVideoPlaying(true); // Cập nhật context
    };
    const handlePause = () => {
      setIsPlaying(false);
      setIsVideoPlaying(false); // Cập nhật context
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setIsVideoPlaying(false); // Cập nhật context
      setIsVideoEnded(true);
      if (!hasShownIntro) {
        setHasShownIntro(true);
        if (onVideoEnded) onVideoEnded();
      }
    };
    const handleError = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      const error = video.error;
      
      let errorDetails = 'Unknown error';
      if (error) {
        errorDetails = `Code: ${error.code}, Message: ${error.message || 'No message'}`;
        addDebugLog(`❌ Video error: ${errorDetails}`);
        addDebugLog(`📹 Current source: ${video.currentSrc?.substring(0, 100)}...`);
        addDebugLog(`🔄 Network state: ${video.networkState}`);
        addDebugLog(`📊 Ready state: ${video.readyState}`);
      }
      
      // Nếu đang dùng signed URL từ Cloudflare R2 và gặp lỗi, thử fallback
      if (error && video.currentSrc.includes('cloudflarestorage.com') && !useFallback) {
        addDebugLog('⚠️ Error loading from Cloudflare R2, switching to fallback');
        
        // Switch to fallback streaming endpoint
        setUseFallback(true);
        const apiUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
        const videoFilename = 'tiger 11.mp4';
        // Remove crossOrigin để tránh CORS issue với fallback
        video.removeAttribute('crossorigin');
        const fallbackUrl = `${apiUrl}/storage/video/${encodeURIComponent(videoFilename)}`;
        video.src = fallbackUrl;
        addDebugLog(`🔗 Switching to fallback: ${fallbackUrl}`);
        setVideoError(null);
        setIsLoading(true);
        return;
      }
      
      // Nếu đã dùng fallback mà vẫn lỗi, hiển thị error message
      if (useFallback || !video.currentSrc.includes('cloudflarestorage.com')) {
        addDebugLog('❌ Video loading failed after fallback');
        setVideoError(`Video loading failed: ${errorDetails}`);
        setIsLoading(false);
      }
    };
    const handleLoadStart = () => {
      setVideoError(null);
      setIsVideoReady(false);
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
  }, [setIsVideoPlaying, onVideoEnded, hasShownIntro, useFallback]);

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
    setIsPlaying(false);
    setIsVideoPlaying(false);
    setIsVideoEnded(true);
    if (onVideoEnded) onVideoEnded();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="w-full h-full md:h-auto object-contain"
          muted={isMuted}
          playsInline
          autoPlay
          preload="metadata"
          {...(useFallback ? {} : { crossOrigin: 'anonymous' })}
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
      <div className="absolute top-6 right-6 z-40">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
          onClick={toggleMute}
          disabled={isLoading}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Skip Button - bottom-right over video */}
      <div className="absolute bottom-6 right-6 z-40">
        <button
          onClick={handleSkip}
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
      <div className="absolute top-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-black/90 text-white text-xs p-4 rounded-lg max-h-[60vh] overflow-y-auto">
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
          <div>Use Fallback: {useFallback ? '✅' : '❌'}</div>
          <div>Current Source: {videoRef.current?.currentSrc ? '✅' : '❌'}</div>
          {videoRef.current?.error && (
            <div className="text-red-400">
              Error: {videoRef.current.error.code} - {videoRef.current.error.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

