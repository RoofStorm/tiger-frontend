'use client';

import { EmojiSelection } from '@/types';

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
    <div className="space-y-8">
      {/* Emoji Grid - 4 columns for 16 emojis */}
      <div className="grid grid-cols-4 gap-4 sm:gap-6">
        {emojis.map(emoji => {
          const selected = isSelected(emoji.id);
          const disabled = !canSelect && !selected;

          return (
            <button
              key={emoji.id}
              onClick={() => !disabled && onEmojiSelect(emoji)}
              disabled={disabled}
              className={`
                relative p-4 rounded-2xl transition-all duration-200 transform hover:scale-105
                ${
                  selected
                    ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg scale-105'
                    : 'bg-white hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="text-3xl mb-2">{emoji.emoji}</div>
              <div className="text-xs font-medium text-center leading-tight">
                {emoji.label}
              </div>
              {selected && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Progress Indicator */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-lg">
          <div className="flex space-x-1">
            {[1, 2, 3].map(step => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-colors ${
                  step <= selectedEmojis.length
                    ? 'bg-purple-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-600 ml-2">
            {selectedEmojis.length}/3
          </span>
        </div>
      </div>
    </div>
  );
}
