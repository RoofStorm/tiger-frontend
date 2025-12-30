'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import { EmojiSelection } from '@/types';

interface MoodCardCanvasProps {
  selectedEmojis: EmojiSelection[];
  whisper: string;
  reminder: string;
  category?: 'mindful' | 'tiger-linked' | 'trendy' | null;
  onSave?: (imageData: string) => void;
  onShare?: (imageData: string) => void;
  onReady?: () => void;
  onDownloadReady?: (downloadHandler: () => Promise<void>) => void;
  onShareReady?: (shareHandler: () => Promise<void>) => void;
  onGeneratingChange?: (isGenerating: boolean) => void;
}

export function MoodCardCanvas({
  selectedEmojis,
  whisper,
  reminder,
  category,
  onSave,
  onShare,
  onReady,
  onDownloadReady,
  onShareReady,
  onGeneratingChange,
}: MoodCardCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    if (!canvasRef.current) return;

    setIsGenerating(true);
    if (onGeneratingChange) {
      onGeneratingChange(true);
    }
    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imageData = canvas.toDataURL('image/png');

      if (onSave) {
        onSave(imageData);
      }

      return imageData;
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
      if (onGeneratingChange) {
        onGeneratingChange(false);
      }
    }
  };

  const handleDownload = async () => {
    const imageData = await generateImage();
    if (imageData) {
      const link = document.createElement('a');
      link.download = `mood-card-${Date.now()}.png`;
      link.href = imageData;
      link.click();
    }
  };

  const handleShare = async () => {
    // const imageData = await generateImage();
    const imageData =
      'https://nonnomadically-remittent-abrielle.ngrok-free.dev/default-post-image.jpg';
    if (imageData && onShare) {
      onShare(imageData);
    }
  };

  // Call onReady when component mounts (mood card is ready for sharing)
  useEffect(() => {
    if (onReady) {
      onReady();
    }
    // Expose download and share handlers to parent
    if (onDownloadReady) {
      onDownloadReady(handleDownload);
    }
    if (onShareReady) {
      onShareReady(handleShare);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onReady, onDownloadReady, onShareReady]);

  const getCategoryColor = () => {
    switch (category) {
      case 'mindful':
        return 'from-green-400 to-emerald-500';
      case 'tiger-linked':
        return 'from-orange-400 to-amber-500';
      case 'trendy':
        return 'from-blue-400 to-cyan-500';
      default:
        return 'from-purple-400 to-pink-500';
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case 'mindful':
        return 'Mindful & Touching';
      case 'tiger-linked':
        return 'Tiger-linked';
      case 'trendy':
        return 'Trendy & Playful';
      default:
        return 'Custom Mood';
    }
  };

  return (
    <div className="space-y-4">
      {/* Mood Card Canvas */}
      <div
        ref={canvasRef}
        className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-xl border border-gray-200 min-h-[400px]"
      >
        {/* Category Badge */}
        {category && (
          <div
            className={`absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r ${getCategoryColor()} text-white text-xs font-medium`}
          >
            {getCategoryLabel()}
          </div>
        )}

        {/* Emojis */}
        <div className="flex justify-center space-x-4 mb-8">
          {selectedEmojis.map((emoji, index) => (
            <div
              key={emoji.id}
              className="animate-bounce flex items-center justify-center"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {emoji.imageUrl ? (
                <Image
                  src={emoji.imageUrl}
                  alt={emoji.label}
                  width={80}
                  height={80}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                />
              ) : (
                <div className="text-6xl">{emoji.emoji}</div>
              )}
            </div>
          ))}
        </div>

        {/* Whisper */}
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Whisper</h3>
          <p className="text-gray-600 leading-relaxed italic">
            &quot;{whisper}&quot;
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8" />

        {/* Reminder */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Reminder</h3>
          <p className="text-gray-600 leading-relaxed">{reminder}</p>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-xs text-gray-400">
            Generated by TIGER • {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>
      </div>
    </div>
  );
}
