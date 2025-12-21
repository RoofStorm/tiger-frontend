'use client';

import { EmojiSelection } from '@/types';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface EmojiGridProps {
  emojis: EmojiSelection[];
  selectedEmojis: EmojiSelection[];
  onEmojiSelect: (emoji: EmojiSelection) => void;
  onEmojiRemove: (emojiId: string) => void;
  isDarkMode?: boolean;
}

export function EmojiGrid({
  emojis,
  selectedEmojis,
  onEmojiSelect,
  // onEmojiRemove,
  isDarkMode = false,
}: EmojiGridProps) {
  const isSelected = (emojiId: string) =>
    selectedEmojis.some(emoji => emoji.id === emojiId);

  const canSelect = selectedEmojis.length < 3;

  // Generate random delays and durations for each emoji
  const animationConfigs = useMemo(() => {
    return emojis.map(() => ({
      delay: Math.random() * 3, // Random delay 0-3 seconds
      duration: 4 + Math.random() * 2, // Random duration 4-6 seconds (slower)
      repeatDelay: Math.random() * 1, // Random repeat delay 0-1 seconds
      yValues: [
        0,
        -4 - Math.random() * 2, // Random float up -4 to -6 (gentler)
        0,
        -3 - Math.random() * 1.5, // Random float up -3 to -4.5
        0,
        -2 - Math.random() * 1, // Random float up -2 to -3
        0,
      ],
    }));
  }, [emojis.length]);

  return (
    <div>
      {/* Emoji Grid - 4 columns for 12 emojis */}
      <div className="grid grid-cols-4 max-w-2xl mx-auto items-stretch">
        {emojis.map((emoji, index) => {
          const selected = isSelected(emoji.id);
          const disabled = !canSelect && !selected;
          const config = animationConfigs[index];

          return (
            <button
              key={emoji.id}
              onClick={() => !disabled && onEmojiSelect(emoji)}
              disabled={disabled}
              className={`
                relative flex flex-col p-1 rounded-xl transition-colors duration-200
                border-2 border-transparent hover:border-purple-300
                h-full
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center justify-center mb-1 h-[4.5rem] sm:h-[5rem]">
                {emoji.imageUrl ? (
                  <motion.img
                    src={emoji.imageUrl}
                    alt={emoji.label}
                    className="w-[70px] h-[70px] object-contain"
                    animate={{
                      y: config.yValues,
                    }}
                    transition={{
                      duration: config.duration,
                      repeat: Infinity,
                      repeatDelay: config.repeatDelay,
                      delay: config.delay,
                      ease: [0.4, 0, 0.6, 1], // Smooth ease curve for gentle floating
                    }}
                  />
                ) : (
                  <motion.div
                    className="text-2xl sm:text-3xl"
                    animate={{
                      y: config.yValues,
                    }}
                    transition={{
                      duration: config.duration,
                      repeat: Infinity,
                      repeatDelay: config.repeatDelay,
                      delay: config.delay,
                      ease: [0.4, 0, 0.6, 1], // Smooth ease curve for gentle floating
                    }}
                  >
                    {emoji.emoji}
                  </motion.div>
                )}
              </div>
              <div className="flex items-center justify-center gap-1.5 h-[2rem]">
                <input
                  type="checkbox"
                  checked={selected}
                  readOnly
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer flex-shrink-0"
                />
                <div className={`text-xs font-medium text-center leading-tight line-clamp-2 ${isDarkMode ? 'text-white' : ''}`}>
                  {emoji.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
