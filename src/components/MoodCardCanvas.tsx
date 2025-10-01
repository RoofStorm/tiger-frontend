'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { EmojiSelection } from '@/types';
import { Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MoodCardCanvasProps {
  emojis: EmojiSelection[];
  whisper: string;
  reminder: string;
  onSave?: (imageData: string) => void;
  onShare?: (imageData: string) => void;
}

export function MoodCardCanvas({ 
  emojis, 
  whisper, 
  reminder, 
  onSave, 
  onShare 
}: MoodCardCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    if (!canvasRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(canvasRef.current, {
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
      console.error('Failed to generate image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    const imageData = await generateImage();
    if (imageData && onShare) {
      onShare(imageData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mood Card Preview */}
      <div className="flex justify-center">
        <div
          ref={canvasRef}
          className="relative w-96 h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Tiger Logo */}
          <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>

          {/* Title */}
          <div className="absolute top-6 left-6 right-20">
            <h3 className="text-2xl font-bold text-gray-800">
              Nhịp sống hôm nay của bạn
            </h3>
          </div>

          {/* Emojis */}
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 flex space-x-4">
            {emojis.map((emoji, index) => (
              <div
                key={emoji.id}
                className="text-6xl animate-bounce"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {emoji.emoji}
              </div>
            ))}
          </div>

          {/* Whisper */}
          <div className="absolute top-40 left-6 right-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <h4 className="text-lg font-semibold text-purple-700 mb-2">
                Whisper
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {whisper}
              </p>
            </div>
          </div>

          {/* Reminder */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-yellow-100/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border-l-4 border-yellow-400">
              <h4 className="text-lg font-semibold text-yellow-800 mb-2">
                Reminder
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {reminder}
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-4 w-2 h-2 bg-purple-300 rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-8 w-1 h-1 bg-pink-300 rounded-full animate-pulse" />
          <div className="absolute bottom-1/3 left-8 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={generateImage}
          disabled={isGenerating}
          className="flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>{isGenerating ? 'Đang tạo...' : 'Tải xuống'}</span>
        </Button>
        <Button
          onClick={handleShare}
          disabled={isGenerating}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
        >
          <Share2 className="w-4 h-4" />
          <span>Chia sẻ</span>
        </Button>
      </div>
    </div>
  );
}

