'use client';

import { EmojiSelection } from '@/types';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface EmojiGridProps {
  emojis: EmojiSelection[];
  selectedEmojis: EmojiSelection[];
  onEmojiSelect: (emoji: EmojiSelection) => void;
  onEmojiRemove: (emojiId: string) => void;
}

export function EmojiGrid({
  emojis,
  selectedEmojis,
  onEmojiSelect,
  // onEmojiRemove,
}: EmojiGridProps) {
  const isSelected = (emojiId: string) =>
    selectedEmojis.some(emoji => emoji.id === emojiId);

  const canSelect = selectedEmojis.length < 3;

  // Generate random delays and durations for each emoji
  const animationConfigs = useMemo(() => {
    return emojis.map(() => ({
      delay: Math.random() * 2, // Random delay 0-2 seconds
      duration: 2 + Math.random() * 1.5, // Random duration 2-3.5 seconds
      repeatDelay: Math.random() * 1.5, // Random repeat delay 0-1.5 seconds
      yValues: [
        0,
        -8 - Math.random() * 4, // Random float up -8 to -12
        0,
        -6 - Math.random() * 3, // Random float up -6 to -9
        0,
        -4 - Math.random() * 2, // Random float up -4 to -6
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
                      ease: "easeInOut",
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
                      ease: "easeInOut",
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
                <div className="text-xs font-medium text-center leading-tight line-clamp-2">
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
