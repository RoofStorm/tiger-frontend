'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EMOJI_OPTIONS } from '@/constants/emojis';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function EmojiPicker({
  onEmojiSelect,
  className = '',
  textareaRef,
}: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);

    // Refocus textarea after emoji selection
    setTimeout(() => {
      if (textareaRef?.current) {
        textareaRef.current.focus();
        // Move cursor to end
        const length = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    }, 100);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:bg-gray-50 transition-colors"
      >
        <Smile className="w-4 h-4" />
        <span className="text-sm">Thêm emoji</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Picker */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-80"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Chọn emoji
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              {/* Emoji Grid */}
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {EMOJI_OPTIONS.map(option => (
                  <motion.button
                    key={option.id}
                    type="button"
                    onClick={() => handleEmojiClick(option.emoji)}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                      {option.emoji}
                    </span>
                    <span className="text-xs text-gray-600 text-center leading-tight">
                      {option.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  Click vào emoji để thêm vào caption
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
