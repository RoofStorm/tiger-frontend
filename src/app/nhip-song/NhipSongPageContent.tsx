'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { EmojiGrid } from '@/components/EmojiGrid';
import { Button } from '@/components/ui/button';
import { EmojiSelection } from '@/types';
import { EMOJI_OPTIONS } from '@/constants/emojis';
import { findCombinationByEmojis } from '@/constants/emojiCombinations';
import { RotateCcw, Share2 } from 'lucide-react';

export function NhipSongPageContent() {
  const [selectedEmojis, setSelectedEmojis] = useState<EmojiSelection[]>([]);
  const [showMoodCard, setShowMoodCard] = useState(false);
  const [whisper, setWhisper] = useState('');
  const [reminder, setReminder] = useState('');
  const [combinationCategory, setCombinationCategory] = useState<
    'mindful' | 'tiger-linked' | 'trendy' | null
  >(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const shareHandlerRef = useRef<(() => Promise<void>) | null>(null);

  const handleEmojiSelect = (emoji: EmojiSelection) => {
    const isAlreadySelected = selectedEmojis.some(
      selected => selected.id === emoji.id
    );

    if (isAlreadySelected) {
      setSelectedEmojis(prev =>
        prev.filter(selected => selected.id !== emoji.id)
      );
    } else {
      if (selectedEmojis.length < 3) {
        setSelectedEmojis(prev => [...prev, emoji]);
      }
    }
  };

  const handleEmojiRemove = (emojiId: string) => {
    setSelectedEmojis(prev => prev.filter(emoji => emoji.id !== emojiId));
  };

  const handleGenerateMoodCard = () => {
    if (selectedEmojis.length !== 3) return;

    const emojiStrings = selectedEmojis.map(emoji => emoji.emoji);
    const combination = findCombinationByEmojis(emojiStrings);

    if (combination) {
      setWhisper(combination.whisper);
      setReminder(combination.reminder);
      setCombinationCategory(combination.category);
    } else {
      setWhisper(
        'Bạn đã tạo ra một tổ hợp cảm xúc độc đáo. Hãy để những emoji này nói lên điều bạn đang cảm nhận.'
      );
      setReminder(
        'Mỗi cảm xúc đều có giá trị. Hãy lắng nghe và chấp nhận những gì bạn đang trải qua.'
      );
      setCombinationCategory(null);
    }

    setShowMoodCard(true);
  };

  const handleReset = () => {
    setSelectedEmojis([]);
    setShowMoodCard(false);
    setWhisper('');
    setReminder('');
    setCombinationCategory(null);
    setIsCardFlipped(false);
  };

  const handleSaveMoodCard = async () => {
    try {
      // TODO: Implement save to backend
      handleReset();
    } catch (error) {
      console.error('Failed to save mood card:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      <Header />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!showMoodCard ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-2 sm:space-y-4 text-center"
            >
              {/* Intro Text */}
              <p className="font-nunito text-[18px] text-gray-700 leading-relaxed px-4 mt-4">
                Giữa muôn vàn hối hả,
                <br />
                hãy giữ cho mình một nhịp riêng mà bạn muốn.
              </p>

              {/* Main Title */}
              <h2 className="font-prata text-[28px] text-tiger-blue-600 px-4">
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
                  onEmojiSelect={handleEmojiSelect}
                  onEmojiRemove={handleEmojiRemove}
                />
              </div>

              {/* Description Text */}
              <p className="font-noto-sans text-[14px] text-gray-700 leading-relaxed max-w-3xl mx-auto px-4">
                Mood là khởi đầu. Giữ nhịp đâu chỉ là cảm xúc mà còn là
                những điều bạn tự tạo ra mỗi ngày. Cùng Tiger tham gia thử
                thách Giữ Nhịp nhé.
              </p>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  onClick={handleGenerateMoodCard}
                  disabled={selectedEmojis.length !== 3}
                  className="w-full max-w-md mx-auto py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {selectedEmojis.length === 3
                    ? 'Tham gia ngay'
                    : `Chọn thêm ${3 - selectedEmojis.length} emoji`}
                </Button>
              </div>

              {/* Instruction Text */}
              <p className="font-noto-sans text-[12px] text-gray-600 pt-2">
                *Bạn chọn ít nhất 3 trạng thái đúng nhất với mình hiện tại
                nhé!
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full flex flex-col"
              onMouseEnter={() => {
                setIsCardFlipped(true);
              }}
              onMouseLeave={() => {
                setIsCardFlipped(false);
              }}
            >
              {/* Flip Card Container */}
              <div
                className="w-full max-w-md mx-auto"
                style={{ perspective: '1000px', minHeight: '500px', height: '70vh' }}
              >
                <div className="relative w-full h-full min-h-[500px] group cursor-pointer">
                  {/* Card */}
                  <div
                    className="relative w-full h-full min-h-[500px] transition-transform duration-700"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {/* Back of Card (tarot.jpg) */}
                    <div
                      className="absolute inset-0 w-full h-full"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="relative w-full h-full min-h-[500px]">
                        <Image
                          src="/tarot.jpg"
                          alt="Mood Card Back"
                          fill
                          className="object-contain"
                          priority
                          sizes="(max-width: 768px) 100vw, 800px"
                        />
                      </div>
                    </div>

                    {/* Front of Card (Content) */}
                    <div
                      className="absolute inset-0 w-full h-full p-8 flex flex-col"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      {/* Icon at top */}
                      <div className="flex justify-center mb-4">
                        <div className="relative w-16 h-16">
                          <Image
                            src="/moodcard/emojiCenter.png"
                            alt="Emoji Center"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-3xl font-bold text-blue-600 text-center mb-6 font-serif">
                        Lorem Ipsum
                      </h2>

                      {/* Whisper Section */}
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-black mb-3">
                          Whisper:
                        </h3>
                        <p className="text-base text-black leading-relaxed">
                          {whisper}
                        </p>
                      </div>

                      {/* Reminder Section */}
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-black mb-3">
                          Reminder:
                        </h3>
                        <p className="text-base text-black leading-relaxed">
                          {reminder}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Only show when card is flipped */}
              {isCardFlipped && (
                <>
                  <div className="p-4 grid grid-cols-2 gap-3 max-w-md mx-auto">
                    <Button
                      onClick={handleSaveMoodCard}
                      variant="outline"
                      className="w-full py-3 rounded-lg border border-gray-300 text-black hover:bg-gray-50 transition-colors"
                    >
                      Lưu cảm xúc
                    </Button>

                    <Button
                      onClick={() => shareHandlerRef.current?.()}
                      className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Chia sẻ ngay
                    </Button>
                  </div>

                  {/* Try Again Link */}
                  <div className="text-center pt-2 pb-4">
                    <span className="text-black">Chọn lại nhịp sống? </span>
                    <button
                      onClick={handleReset}
                      className="text-black underline hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                    >
                      <span>Thử lại ngay</span>
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

