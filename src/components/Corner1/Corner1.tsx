'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmojiGrid } from '@/components/EmojiGrid';
import { MoodCardCanvas } from '@/components/MoodCardCanvas';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { EmojiSelection } from '@/types';
import { findCombinationByEmojis } from '@/constants/emojiCombinations';
import { EMOJI_OPTIONS } from '@/constants/emojis';
import { Download, Share2 } from 'lucide-react';

export function Corner1() {
  const [selectedEmojis, setSelectedEmojis] = useState<EmojiSelection[]>([]);
  const [showMoodCard, setShowMoodCard] = useState(false);
  const [whisper, setWhisper] = useState('');
  const [reminder, setReminder] = useState('');
  const [combinationCategory, setCombinationCategory] = useState<
    'mindful' | 'tiger-linked' | 'trendy' | null
  >(null);
  const [moodCardImage, setMoodCardImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const downloadHandlerRef = useRef<(() => Promise<void>) | null>(null);
  const shareHandlerRef = useRef<(() => Promise<void>) | null>(null);
  const { toast } = useToast();

  const handleEmojiSelect = (emoji: EmojiSelection) => {
    // Check if emoji is already selected
    const isAlreadySelected = selectedEmojis.some(
      selected => selected.id === emoji.id
    );

    if (isAlreadySelected) {
      // If already selected, remove it (toggle off)
      setSelectedEmojis(prev =>
        prev.filter(selected => selected.id !== emoji.id)
      );
    } else {
      // If not selected and we have space, add it
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

    // Get emoji strings
    const emojiStrings = selectedEmojis.map(emoji => emoji.emoji);

    // Find matching combination
    const combination = findCombinationByEmojis(emojiStrings);

    if (combination) {
      setWhisper(combination.whisper);
      setReminder(combination.reminder);
      setCombinationCategory(combination.category);
    } else {
      // Fallback for non-matching combinations
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
      // Reset state
      setSelectedEmojis([]);
      setShowMoodCard(false);
      setCombinationCategory(null);
      setMoodCardImage('');
    } catch (error) {
      console.error('Failed to save mood card:', error);
    }
  };

  const handleMoodCardGenerated = (imageData: string) => {
    setMoodCardImage(imageData);
  };

  // Auto-generate image when mood card is shown
  const handleMoodCardReady = () => {
    // Set a flag that mood card is ready for sharing
    setMoodCardImage('ready');
  };

  const handleShareMoodCard = (imageData?: string) => {
    if (!moodCardImage && !showMoodCard && !imageData) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng tạo mood card trước khi chia sẻ.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    // Nếu có imageData từ MoodCardCanvas, mở Facebook dialog ngay lập tức
    if (imageData) {
      openFacebookShareDialog();
      return;
    }

    // Fallback: mở dialog nếu không có imageData
    openFacebookShareDialog();
  };

  const openFacebookShareDialog = () => {
    // Tạo URL preview cho mood card - Ưu tiên HTTPS và public URL
    // Facebook cần HTTPS và public URL để crawl meta tags
    const baseUrl =
      process.env.NEXT_PUBLIC_PUBLIC_URL ||
      (typeof window !== 'undefined' ? window.location.origin : null) ||
      process.env.NEXTAUTH_URL ||
      'https://tiger-frontend-eta.vercel.app'; // Fallback to production URL
    const shareUrl = `${baseUrl}/mood-card?emojis=${selectedEmojis.map(e => e.id).join(',')}&whisper=${encodeURIComponent(whisper)}&reminder=${encodeURIComponent(reminder)}`;

    // Tạo title và description cho mood card
    const emojiLabels = selectedEmojis.map(e => e.label).join(', ');
    const emojiString = selectedEmojis.map(e => e.emoji).join(' ');

    // Tạo title từ reminder thay vì emojis
    let moodCardTitle = '';
    if (reminder) {
      // Cắt reminder nếu quá dài (tối đa 50 ký tự)
      const shortReminder =
        reminder.length > 50 ? reminder.substring(0, 50) + '...' : reminder;
      moodCardTitle = `${shortReminder} - Tiger Mood Corner`;
    } else if (whisper) {
      // Fallback về whisper nếu không có reminder
      const shortWhisper =
        whisper.length > 50 ? whisper.substring(0, 50) + '...' : whisper;
      moodCardTitle = `"${shortWhisper}" - Tiger Mood Corner`;
    } else {
      // Fallback về emoji labels nếu không có cả reminder và whisper
      moodCardTitle = `Mood Card: ${emojiLabels} - Tiger Mood Corner`;
    }

    // Tạo caption ngắn gọn cho Facebook preview (giống Open Graph)
    let moodCardDescription = '';
    if (whisper && reminder) {
      moodCardDescription = `"${whisper}"\n\n${reminder}\n\n#TigerMoodCorner #MoodCard ${emojiString}`;
    } else if (whisper) {
      moodCardDescription = `"${whisper}"\n\n#TigerMoodCorner #MoodCard ${emojiString}`;
    } else if (reminder) {
      moodCardDescription = `${reminder}\n\n#TigerMoodCorner #MoodCard ${emojiString}`;
    } else {
      moodCardDescription = `Khám phá cảm xúc của bạn qua emoji: ${emojiString}\n\n#TigerMoodCorner #MoodCard`;
    }

    // Console log để debug imageUrl
    console.log('🖼️ [MOOD CARD SHARE DEBUG] Image URL:', {
      moodCardImage: moodCardImage,
      shareUrl: shareUrl,
      baseUrl: baseUrl,
      moodCardTitle: moodCardTitle,
      moodCardDescription: moodCardDescription,
      emojis: selectedEmojis.map(e => e.emoji),
      whisper: whisper,
      reminder: reminder,
      fullMoodCard: {
        selectedEmojis,
        whisper,
        reminder,
        combinationCategory,
      },
    });

    // Console log để kiểm tra
    console.log('🎨 Mood Card Share Preview:', {
      shareUrl,
      moodCardTitle,
      moodCardDescription,
      emojis: selectedEmojis.map(e => e.emoji),
      whisper,
      reminder,
    });

    // Tạo Facebook Share URL
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    console.log('📱 Facebook Share URL for Mood Card:', facebookShareUrl);

    // Mở popup Facebook Share Dialog
    const popup = window.open(
      facebookShareUrl,
      'facebook-share-dialog',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    );

    // Kiểm tra nếu popup bị block
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      toast({
        title: 'Popup bị chặn',
        description: 'Vui lòng cho phép popup để chia sẻ mood card.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    // Focus vào popup
    popup.focus();

    toast({
      title: 'Chia sẻ mood card',
      description: 'Đang mở Facebook để chia sẻ mood card của bạn.',
      duration: 3000,
    });
  };

  const handleReset = () => {
    setSelectedEmojis([]);
    setShowMoodCard(false);
    setWhisper('');
    setReminder('');
    setCombinationCategory(null);
    setMoodCardImage('');
  };

  return (
    <div
      data-corner="1"
      id="corner-1"
      className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-base sm:text-lg text-gray-700 mb-4">
            Giữa muôn vàn hối hả, hãy giữ cho mình một nhịp riêng mà bạn muốn
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
            Chọn nhịp sống của bạn hôm nay
          </h1>
        </motion.div>

        <div className="w-full">
          <AnimatePresence mode="wait">
            {/* Emoji Selection - chỉ hiển thị khi chưa tạo mood card */}
            {!showMoodCard && (
              <motion.div
                key="emoji-selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  {/* Emoji Grid */}
                  <EmojiGrid
                    emojis={EMOJI_OPTIONS.map(emojiOption => ({
                      id: emojiOption.id,
                      emoji: emojiOption.emoji,
                      label: emojiOption.label,
                    }))}
                    selectedEmojis={selectedEmojis}
                    onEmojiSelect={handleEmojiSelect}
                    onEmojiRemove={handleEmojiRemove}
                  />

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button
                      onClick={handleGenerateMoodCard}
                      disabled={selectedEmojis.length !== 3}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {selectedEmojis.length === 3
                        ? 'Tạo Mood Card'
                        : `Chọn thêm ${3 - selectedEmojis.length} emoji`}
                    </Button>

                    {selectedEmojis.length > 0 && (
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Mood Card Preview - chỉ hiển thị khi đã tạo mood card */}
            {showMoodCard && (
              <motion.div
                key="mood-card-preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6 flex flex-col"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 flex flex-col">
                  <MoodCardCanvas
                    selectedEmojis={selectedEmojis}
                    whisper={whisper}
                    reminder={reminder}
                    category={combinationCategory}
                    onSave={handleMoodCardGenerated}
                    onShare={handleShareMoodCard}
                    onReady={handleMoodCardReady}
                    onDownloadReady={handler => {
                      downloadHandlerRef.current = handler;
                    }}
                    onShareReady={handler => {
                      shareHandlerRef.current = handler;
                    }}
                    onGeneratingChange={setIsGenerating}
                  />

                  <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
                    <Button
                      onClick={handleSaveMoodCard}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Lưu Mood Card
                    </Button>

                    <Button
                      onClick={() => downloadHandlerRef.current?.()}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isGenerating ? 'Đang tạo...' : 'Tải xuống'}
                    </Button>

                    <Button
                      onClick={() => shareHandlerRef.current?.()}
                      disabled={isGenerating}
                      variant="outline"
                      className="w-full py-3 rounded-xl border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Chia sẻ
                    </Button>

                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="w-full py-3 rounded-xl border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Tạo Mới
                    </Button>
                  </div>
                </div>

                {/* Category Info */}
                {combinationCategory && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          combinationCategory === 'mindful'
                            ? 'bg-green-500'
                            : combinationCategory === 'tiger-linked'
                              ? 'bg-orange-500'
                              : 'bg-blue-500'
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-600">
                        {combinationCategory === 'mindful'
                          ? 'Mindful & Touching'
                          : combinationCategory === 'tiger-linked'
                            ? 'Tiger-linked'
                            : 'Trendy & Playful'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
