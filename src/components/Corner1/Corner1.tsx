'use client';

import { useState } from 'react';
import { EmojiGrid } from '@/components/EmojiGrid';
import { MoodCardCanvas } from '@/components/MoodCardCanvas';
import { Button } from '@/components/ui/button';
import { EmojiSelection } from '@/types';
import { EMOJI_OPTIONS, WHISPER_TEXTS, REMINDER_TEXTS } from '@/constants/emojis';

export function Corner1() {
  const [selectedEmojis, setSelectedEmojis] = useState<EmojiSelection[]>([]);
  const [showMoodCard, setShowMoodCard] = useState(false);
  const [whisper, setWhisper] = useState('');
  const [reminder, setReminder] = useState('');

  const handleEmojiSelect = (emoji: EmojiSelection) => {
    if (selectedEmojis.length >= 3) return;
    
    setSelectedEmojis(prev => [...prev, emoji]);
  };

  const handleEmojiRemove = (emojiId: string) => {
    setSelectedEmojis(prev => prev.filter(emoji => emoji.id !== emojiId));
  };

  const handleGenerateMoodCard = () => {
    if (selectedEmojis.length !== 3) return;

    // Generate random whisper and reminder
    const randomWhisper = WHISPER_TEXTS[Math.floor(Math.random() * WHISPER_TEXTS.length)];
    const randomReminder = REMINDER_TEXTS[Math.floor(Math.random() * REMINDER_TEXTS.length)];
    
    setWhisper(randomWhisper);
    setReminder(randomReminder);
    setShowMoodCard(true);
  };

  const handleSaveMoodCard = async () => {
    try {
      // TODO: Implement save to backend
      console.log('Saving mood card:', { selectedEmojis, whisper, reminder });
      // Reset state
      setSelectedEmojis([]);
      setShowMoodCard(false);
    } catch (error) {
      console.error('Failed to save mood card:', error);
    }
  };

  const handleShareMoodCard = async () => {
    try {
      // TODO: Implement share functionality
      console.log('Sharing mood card:', { selectedEmojis, whisper, reminder });
    } catch (error) {
      console.error('Failed to share mood card:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Góc Cảm Xúc
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-4">
            Chọn 3 emoji thể hiện cảm xúc của bạn hôm nay
          </p>
          <div className="text-lg text-gray-500">
            {selectedEmojis.length}/3 đã chọn
          </div>
        </div>

        {!showMoodCard ? (
          <div className="space-y-8">
            {/* Emoji Grid */}
            <EmojiGrid
              emojis={EMOJI_OPTIONS}
              selectedEmojis={selectedEmojis}
              onEmojiSelect={handleEmojiSelect}
              onEmojiRemove={handleEmojiRemove}
            />

            {/* Generate Button */}
            {selectedEmojis.length === 3 && (
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={handleGenerateMoodCard}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg"
                >
                  Tạo Mood Card
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Mood Card Preview */}
            <MoodCardCanvas
              emojis={selectedEmojis}
              whisper={whisper}
              reminder={reminder}
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowMoodCard(false)}
                className="px-8 py-4 text-lg"
              >
                Chọn lại
              </Button>
              <Button
                size="lg"
                onClick={handleSaveMoodCard}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-4 text-lg"
              >
                Lưu Mood Card
              </Button>
              <Button
                size="lg"
                onClick={handleShareMoodCard}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg"
              >
                Chia sẻ
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

