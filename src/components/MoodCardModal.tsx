'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import { EmojiGrid } from '@/components/EmojiGrid';
import { Button } from '@/components/ui/button';
// import { useToast } from '@/hooks/use-toast';
import { EmojiSelection } from '@/types';
import { findCombinationByEmojis } from '@/constants/emojiCombinations';
import { EMOJI_OPTIONS } from '@/constants/emojis';

interface MoodCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
  showHeader?: boolean;
}

export function MoodCardModal({
  isOpen,
  onClose,
  showCloseButton = true,
  showHeader = true,
}: MoodCardModalProps) {
  const [selectedEmojis, setSelectedEmojis] = useState<EmojiSelection[]>([]);
  const [showMoodCard, setShowMoodCard] = useState(false);
  const [whisper, setWhisper] = useState('');
  const [reminder, setReminder] = useState('');
  const [, setCombinationCategory] = useState<
    'mindful' | 'tiger-linked' | 'trendy' | null
  >(null);
  const [, setMoodCardImage] = useState<string>('');
  const [isGenerating, ] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  // const downloadHandlerRef = useRef<(() => Promise<void>) | null>(null);
  const shareHandlerRef = useRef<(() => Promise<void>) | null>(null);
  // const { toast } = useToast();

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

  const handleSaveMoodCard = async () => {
    try {
      // TODO: Implement save to backend
      setSelectedEmojis([]);
      setShowMoodCard(false);
      setCombinationCategory(null);
      setMoodCardImage('');
      onClose();
    } catch (error) {
      console.error('Failed to save mood card:', error);
    }
  };

  // const handleMoodCardGenerated = (imageData: string) => {
  //   setMoodCardImage(imageData);
  // };

  // const handleMoodCardReady = () => {
  //   setMoodCardImage('ready');
  // };

  // const handleShareMoodCard = (imageData?: string) => {
  //   if (!moodCardImage && !showMoodCard && !imageData) {
  //     toast({
  //       title: 'Lỗi',
  //       description: 'Vui lòng tạo mood card trước khi chia sẻ.',
  //       variant: 'destructive',
  //       duration: 4000,
  //     });
  //     return;
  //   }

  //   if (imageData) {
  //     openFacebookShareDialog();
  //     return;
  //   }

  //   openFacebookShareDialog();
  // };

  // const openFacebookShareDialog = () => {
  //   const baseUrl =
  //     process.env.NEXT_PUBLIC_PUBLIC_URL ||
  //     (typeof window !== 'undefined' ? window.location.origin : null) ||
  //     process.env.NEXTAUTH_URL ||
  //     'https://tiger-frontend-eta.vercel.app';
  //   const shareUrl = `${baseUrl}/mood-card?emojis=${selectedEmojis.map(e => e.id).join(',')}&whisper=${encodeURIComponent(whisper)}&reminder=${encodeURIComponent(reminder)}`;

  //   const emojiLabels = selectedEmojis.map(e => e.label).join(', ');
  //   const emojiString = selectedEmojis.map(e => e.emoji).join(' ');

  //   let moodCardTitle = '';
  //   if (reminder) {
  //     const shortReminder =
  //       reminder.length > 50 ? reminder.substring(0, 50) + '...' : reminder;
  //     moodCardTitle = `${shortReminder} - Tiger Mood Corner`;
  //   } else if (whisper) {
  //     const shortWhisper =
  //       whisper.length > 50 ? whisper.substring(0, 50) + '...' : whisper;
  //     moodCardTitle = `"${shortWhisper}" - Tiger Mood Corner`;
  //   } else {
  //     moodCardTitle = `Mood Card: ${emojiLabels} - Tiger Mood Corner`;
  //   }

  //   let moodCardDescription = '';
  //   if (whisper && reminder) {
  //     moodCardDescription = `"${whisper}"\n\n${reminder}\n\n#TigerMoodCorner #MoodCard ${emojiString}`;
  //   } else if (whisper) {
  //     moodCardDescription = `"${whisper}"\n\n#TigerMoodCorner #MoodCard ${emojiString}`;
  //   } else if (reminder) {
  //     moodCardDescription = `${reminder}\n\n#TigerMoodCorner #MoodCard ${emojiString}`;
  //   } else {
  //     moodCardDescription = `Khám phá cảm xúc của bạn qua emoji: ${emojiString}\n\n#TigerMoodCorner #MoodCard`;
  //   }

  //   const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  //   const popup = window.open(
  //     facebookShareUrl,
  //     'facebook-share-dialog',
  //     'width=800,height=600,scrollbars=yes,resizable=yes'
  //   );

  //   if (!popup || popup.closed || typeof popup.closed === 'undefined') {
  //     toast({
  //       title: 'Popup bị chặn',
  //       description: 'Vui lòng cho phép popup để chia sẻ mood card.',
  //       variant: 'destructive',
  //       duration: 4000,
  //     });
  //     return;
  //   }

  //   popup.focus();

  //   toast({
  //     title: 'Chia sẻ mood card',
  //     description: 'Đang mở Facebook để chia sẻ mood card của bạn.',
  //     duration: 3000,
  //   });
  // };

  const handleReset = () => {
    setSelectedEmojis([]);
    setShowMoodCard(false);
    setWhisper('');
    setReminder('');
    setCombinationCategory(null);
    setMoodCardImage('');
    setIsCardFlipped(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={`${showMoodCard ? 'max-w-sm' : 'max-w-xl'} w-full max-h-[90vh] rounded-3xl overflow-hidden flex flex-col ${
            showMoodCard && !isCardFlipped
              ? 'bg-transparent shadow-none border-none'
              : 'bg-gradient-to-b from-gray-50 to-gray-100 shadow-2xl border border-gray-200'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header - Close button only */}
          {(showHeader || showCloseButton) && (
            <div className={`flex items-center justify-end ${showMoodCard && !isCardFlipped ? 'p-2' : 'p-4'}`}>
              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className={`p-2 rounded-full transition-colors ${
                    showMoodCard && !isCardFlipped
                      ? 'hover:bg-white/20 bg-white/10'
                      : 'hover:bg-gray-200'
                  }`}
                  aria-label="Đóng"
                >
                  <X className={`w-6 h-6 ${showMoodCard && !isCardFlipped ? 'text-white' : 'text-gray-600'}`} />
                </button>
              )}
            </div>
          )}

          {/* Content - Scrollable */}
          <div className={`flex-1 ${showMoodCard ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            <AnimatePresence mode="wait">
              {!showMoodCard ? (
                <div className="px-6 pb-6">
                <motion.div
                  key="emoji-selection"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
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
                    những điều bạn tự tạo ra mỗi ngày. Cùng TIGER tham gia thử
                    thách Giữ Nhịp nhé.
                  </p>

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button
                      onClick={handleGenerateMoodCard}
                      disabled={selectedEmojis.length !== 3}
                      className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {selectedEmojis.length === 3
                        ? 'Khám phá ngay'
                        : `Chọn thêm ${3 - selectedEmojis.length} emoji`}
                    </Button>
                  </div>

                  {/* Instruction Text */}
                  <p className="font-noto-sans text-[12px] text-gray-600 pt-2">
                    *Bạn chọn ít nhất 3 trạng thái đúng nhất với mình hiện tại
                    nhé!
                  </p>
                </motion.div>
                </div>
              ) : (
                <motion.div
                  key="mood-card-preview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-full flex flex-col"
                  onMouseEnter={() => {
                    setIsCardFlipped(true);
                  }}
                  onMouseLeave={() => {
                    setIsCardFlipped(false);
                  }}
                >
                  {/* Flip Card Container - Full width and height */}
                  <div
                    className="w-full"
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
                        {/* Back of Card (tarot.jpg) - Default visible, full size */}
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

                        {/* Front of Card (Content) - Flipped 180deg initially, no white background */}
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

                  {/* Action Buttons - Only show when card is flipped (hover) */}
                  {showMoodCard && isCardFlipped && (
                    <>
                      <div className="p-4 grid grid-cols-2 gap-3">
                        <Button
                          onClick={handleSaveMoodCard}
                          variant="outline"
                          className="w-full py-3 rounded-lg border border-gray-300 text-black hover:bg-gray-50 transition-colors"
                        >
                          Lưu cảm xúc
                        </Button>

                        <Button
                          onClick={() => shareHandlerRef.current?.()}
                          disabled={isGenerating}
                          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Chia sẻ ngay
                        </Button>
                      </div>

                      {/* Try Again Link - Only show when card is flipped (hover) */}
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
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

