import { useState, useCallback } from 'react';
import { EmojiSelection } from '@/types';
import { findCombinationByEmojis } from '@/constants/emojiCombinations';

export type CombinationCategory = 'mindful' | 'tiger-linked' | 'trendy' | null;

interface MoodCardData {
  whisper: string;
  reminder: string;
  category: CombinationCategory;
}

const DEFAULT_WHISPER = 'Bạn đã tạo ra một tổ hợp cảm xúc độc đáo. Hãy để những emoji này nói lên điều bạn đang cảm nhận.';
const DEFAULT_REMINDER = 'Mỗi cảm xúc đều có giá trị. Hãy lắng nghe và chấp nhận những gì bạn đang trải qua.';

export function useMoodCard() {
  const [selectedEmojis, setSelectedEmojis] = useState<EmojiSelection[]>([]);
  const [moodCardData, setMoodCardData] = useState<MoodCardData | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const handleEmojiSelect = useCallback((emoji: EmojiSelection) => {
    setSelectedEmojis(prev => {
      const isAlreadySelected = prev.some(selected => selected.id === emoji.id);
      
      if (isAlreadySelected) {
        return prev.filter(selected => selected.id !== emoji.id);
      } else {
        if (prev.length < 3) {
          return [...prev, emoji];
        }
        return prev;
      }
    });
  }, []);

  const handleEmojiRemove = useCallback((emojiId: string) => {
    setSelectedEmojis(prev => prev.filter(emoji => emoji.id !== emojiId));
  }, []);

  const generateMoodCard = useCallback(() => {
    if (selectedEmojis.length !== 3) return null;

    const emojiStrings = selectedEmojis.map(emoji => emoji.emoji);
    const combination = findCombinationByEmojis(emojiStrings);

    const data: MoodCardData = combination
      ? {
          whisper: combination.whisper,
          reminder: combination.reminder,
          category: combination.category,
        }
      : {
          whisper: DEFAULT_WHISPER,
          reminder: DEFAULT_REMINDER,
          category: null,
        };

    setMoodCardData(data);
    return data;
  }, [selectedEmojis]);

  const reset = useCallback(() => {
    setSelectedEmojis([]);
    setMoodCardData(null);
    setIsCardFlipped(false);
  }, []);

  return {
    selectedEmojis,
    moodCardData,
    isCardFlipped,
    setIsCardFlipped,
    handleEmojiSelect,
    handleEmojiRemove,
    generateMoodCard,
    reset,
  };
}
