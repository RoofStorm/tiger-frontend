'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EmojiGrid } from '@/components/EmojiGrid';
import { MoodCardCanvas } from '@/components/MoodCardCanvas';
import { Button } from '@/components/ui/button';
import { EmojiSelection } from '@/types';
import {
  findCombinationByEmojis,
  getAllEmojis,
} from '@/constants/emojiCombinations';

export function Corner1() {
  const [selectedEmojis, setSelectedEmojis] = useState<EmojiSelection[]>([]);
  const [showMoodCard, setShowMoodCard] = useState(false);
  const [whisper, setWhisper] = useState('');
  const [reminder, setReminder] = useState('');
  const [combinationCategory, setCombinationCategory] = useState<
    'mindful' | 'tiger-linked' | 'trendy' | null
  >(null);

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
      console.log('Saving mood card:', {
        selectedEmojis,
        whisper,
        reminder,
        combinationCategory,
      });
      // Reset state
      setSelectedEmojis([]);
      setShowMoodCard(false);
      setCombinationCategory(null);
    } catch (error) {
      console.error('Failed to save mood card:', error);
    }
  };

  const handleReset = () => {
    setSelectedEmojis([]);
    setShowMoodCard(false);
    setWhisper('');
    setReminder('');
    setCombinationCategory(null);
  };

  return (
    <div
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
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
            Emoji Mood Corner
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Chọn 3 emoji để tạo ra mood card cá nhân của bạn. Mỗi tổ hợp sẽ mang
            đến một thông điệp đặc biệt.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Emoji Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Chọn Emoji
              </h2>

              {/* Emoji Grid */}
              <EmojiGrid
                emojis={getAllEmojis().map((emoji, index) => ({
                  id: `emoji-${index}`,
                  emoji,
                  label: `Emoji ${index + 1}`,
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

          {/* Mood Card Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Mood Card
              </h2>

              {showMoodCard ? (
                <MoodCardCanvas
                  selectedEmojis={selectedEmojis}
                  whisper={whisper}
                  reminder={reminder}
                  category={combinationCategory}
                />
              ) : (
                <div className="h-96 flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">🎨</div>
                    <p className="text-lg">Chọn 3 emoji để tạo mood card</p>
                  </div>
                </div>
              )}

              {showMoodCard && (
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSaveMoodCard}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Lưu Mood Card
                  </Button>

                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Tạo Mới
                  </Button>
                </div>
              )}
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
        </div>
      </div>
    </div>
  );
}
