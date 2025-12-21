'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { EmojiGrid } from '@/components/EmojiGrid';
import { EmojiSelection } from '@/types';
import { EMOJI_OPTIONS } from '@/constants/emojis';

interface EmojiSelectionSectionProps {
  selectedEmojis: EmojiSelection[];
  onEmojiSelect: (emoji: EmojiSelection) => void;
  onEmojiRemove: (emojiId: string) => void;
  onGenerateMoodCard: () => void;
  isDarkMode?: boolean;
}

export function EmojiSelectionSection({
  selectedEmojis,
  onEmojiSelect,
  onEmojiRemove,
  onGenerateMoodCard,
  isDarkMode = false,
}: EmojiSelectionSectionProps) {
  const requiredEmojiCount = 3;
  const remainingCount = requiredEmojiCount - selectedEmojis.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-2 sm:space-y-4 text-center"
    >
      {/* Intro Text */}
      <p className={`font-nunito text-[14px] md:text-[18px] leading-relaxed px-4 mt-2 md:mt-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
        Giữa muôn vàn hối hả,
        <br />
        hãy giữ cho mình một nhịp riêng mà bạn muốn.
      </p>

      {/* Main Title */}
      <h2 className={`font-prata text-[20px] md:text-[28px] px-4 ${isDarkMode ? 'text-white' : 'text-tiger-blue-600'}`}>
        Chọn nhịp sống của bạn hôm nay.
      </h2>

      {/* Emoji Grid */}
      <div>
        <EmojiGrid
          emojis={EMOJI_OPTIONS.map(emojiOption => ({
            id: emojiOption.id,
            emoji: emojiOption.emoji,
            label: emojiOption.label,
            imageUrl: emojiOption.imageUrl,
          }))}
          selectedEmojis={selectedEmojis}
          onEmojiSelect={onEmojiSelect}
          onEmojiRemove={onEmojiRemove}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <Button
          onClick={onGenerateMoodCard}
          disabled={selectedEmojis.length !== requiredEmojiCount}
          className="w-full max-w-md mx-auto py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {selectedEmojis.length === requiredEmojiCount
            ? 'Tham gia ngay'
            : `Chọn thêm ${remainingCount} emoji`}
        </Button>
      </div>

      {/* Instruction Text */}
      <p className={`font-noto-sans text-[12px] pt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        *Bạn chọn ít nhất 3 trạng thái đúng nhất với mình hiện tại nhé!
      </p>
    </motion.div>
  );
}
