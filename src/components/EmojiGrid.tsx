'use client';

import { EmojiSelection } from '@/types';
import { X } from 'lucide-react';

interface EmojiGridProps {
  emojis: EmojiSelection[];
  selectedEmojis: EmojiSelection[];
  onEmojiSelect: (emoji: EmojiSelection) => void;
  onEmojiRemove: (emojiId: string) => void;
}

export function EmojiGrid({ emojis, selectedEmojis, onEmojiSelect, onEmojiRemove }: EmojiGridProps) {
  const isSelected = (emojiId: string) => 
    selectedEmojis.some(emoji => emoji.id === emojiId);

  const canSelect = selectedEmojis.length < 3;

  return (
    <div className="space-y-8">
      {/* Selected Emojis Display */}
      {selectedEmojis.length > 0 && (
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">
            Emoji đã chọn:
          </h3>
          <div className="flex justify-center gap-4 flex-wrap">
            {selectedEmojis.map((emoji) => (
              <div
                key={emoji.id}
                className="relative group bg-white rounded-2xl p-4 shadow-lg border-2 border-purple-200"
              >
                <div className="text-4xl mb-2">{emoji.emoji}</div>
                <div className="text-sm font-medium text-gray-600">
                  {emoji.label}
                </div>
                <button
                  onClick={() => onEmojiRemove(emoji.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
        {emojis.map((emoji) => {
          const selected = isSelected(emoji.id);
          const disabled = !canSelect && !selected;

          return (
            <button
              key={emoji.id}
              onClick={() => !disabled && onEmojiSelect(emoji)}
              disabled={disabled}
              className={`
                relative p-4 rounded-2xl transition-all duration-200 transform hover:scale-105
                ${selected 
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
            {[1, 2, 3].map((step) => (
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

