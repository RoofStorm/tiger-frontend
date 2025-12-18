'use client';

import { EmojiSelection } from '@/types';
import { motion } from 'framer-motion';

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
  onEmojiRemove,
}: EmojiGridProps) {
  const isSelected = (emojiId: string) =>
    selectedEmojis.some(emoji => emoji.id === emojiId);

  const canSelect = selectedEmojis.length < 3;

  return (
    <div>
      {/* Emoji Grid - 4 columns for 12 emojis */}
      <div className="grid grid-cols-4 max-w-2xl mx-auto items-stretch">
        {emojis.map((emoji, index) => {
          const selected = isSelected(emoji.id);
          const disabled = !canSelect && !selected;

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
                      rotate: [
                        0, -6, 6, -6, 6, -4, 4, -3, 3, -2, 0
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 2,
                      delay: index * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ) : (
                  <motion.div
                    className="text-2xl sm:text-3xl"
                    animate={{
                      rotate: [
                        0, -6, 6, -6, 6, -4, 4, -3, 3, -2, 0
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 2,
                      delay: index * 0.2,
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
