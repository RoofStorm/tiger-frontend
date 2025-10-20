'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { EmojiSelection } from '@/types';
import { findCombinationByEmojis } from '@/constants/emojiCombinations';
import { EMOJI_OPTIONS } from '@/constants/emojis';

export default function MoodCardDisplay() {
  const searchParams = useSearchParams();
  const [moodCardData, setMoodCardData] = useState<{
    emojis: EmojiSelection[];
    whisper: string;
    reminder: string;
    combination: any;
  } | null>(null);

  useEffect(() => {
    const emojisParam = searchParams.get('emojis');
    const whisper = searchParams.get('whisper') || '';
    const reminder = searchParams.get('reminder') || '';

    if (emojisParam) {
      const emojiIds = emojisParam.split(',');
      // Map emoji IDs to emoji objects
      const emojis: EmojiSelection[] = emojiIds.map(id => {
        const emojiOption = EMOJI_OPTIONS.find(option => option.id === id);
        return emojiOption
          ? {
              id: emojiOption.id,
              emoji: emojiOption.emoji,
              label: emojiOption.label,
            }
          : {
              id: `unknown-${id}`,
              emoji: '❓',
              label: 'Unknown',
            };
      });

      // Tìm combination bằng emoji strings
      const emojiStrings = emojis.map(e => e.emoji);
      const combination = findCombinationByEmojis(emojiStrings);

      setMoodCardData({
        emojis,
        whisper,
        reminder,
        combination,
      });
    }
  }, [searchParams]);

  if (!moodCardData) {
    return (
      <div className="text-center text-gray-600">
        <p>Không tìm thấy mood card</p>
      </div>
    );
  }

  const { emojis, whisper, reminder, combination } = moodCardData;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-gradient-to-r from-purple-200 to-pink-200">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Mood Card
          </h2>
          <div className="flex justify-center space-x-4 text-6xl">
            {emojis.map((emoji, index) => (
              <span
                key={index}
                className="transform hover:scale-110 transition-transform duration-200"
              >
                {emoji.emoji}
              </span>
            ))}
          </div>
        </div>

        {/* Combination Info */}
        {combination && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {combination.category === 'mindful' && '🧘 Mindful'}
              {combination.category === 'tiger-linked' && '🐅 Tiger Spirit'}
              {combination.category === 'trendy' && '✨ Trendy'}
            </h3>
            <p className="text-gray-700">{combination.description}</p>
          </div>
        )}

        {/* Whisper */}
        {whisper && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              💭 Whisper
            </h3>
            <p className="text-gray-700 italic">"{whisper}"</p>
          </div>
        )}

        {/* Reminder */}
        {reminder && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🔔 Reminder
            </h3>
            <p className="text-gray-700">{reminder}</p>
          </div>
        )}

        {/* Caption Summary */}
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            📝 Caption
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {whisper && reminder
              ? `"${whisper}"\n\n${reminder}\n\n#TigerMoodCorner #MoodCard ${emojis.map(e => e.emoji).join(' ')}`
              : whisper
                ? `"${whisper}"\n\n#TigerMoodCorner #MoodCard ${emojis.map(e => e.emoji).join(' ')}`
                : reminder
                  ? `${reminder}\n\n#TigerMoodCorner #MoodCard ${emojis.map(e => e.emoji).join(' ')}`
                  : `Khám phá cảm xúc của bạn qua emoji: ${emojis.map(e => e.emoji).join(' ')}\n\n#TigerMoodCorner #MoodCard`}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Tạo mood card của bạn tại{' '}
            <span className="font-semibold text-purple-600">
              Tiger Mood Corner
            </span>
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-8">
        <a
          href="/"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
        >
          🎨 Tạo Mood Card Của Bạn
        </a>
      </div>
    </div>
  );
}
