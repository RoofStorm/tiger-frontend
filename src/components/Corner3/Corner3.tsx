'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Lightbulb, Heart, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CardData {
  id: string;
  front: {
    title: string;
    content: string;
    icon: React.ReactNode;
    color: string;
  };
  back: {
    title: string;
    content: string;
    action: string;
    color: string;
  };
}

const CARD_DATA: CardData[] = [
  {
    id: 'motivation',
    front: {
      title: 'Động Lực Hàng Ngày',
      content:
        'Mỗi ngày là một cơ hội mới để phát triển và trở thành phiên bản tốt nhất của chính mình.',
      icon: <Lightbulb className="w-12 h-12" />,
      color: 'from-yellow-400 to-orange-500',
    },
    back: {
      title: 'Hành Động',
      content:
        'Hãy đặt ra một mục tiêu nhỏ cho hôm nay và thực hiện nó. Mỗi bước nhỏ đều có ý nghĩa.',
      action: 'Tôi sẽ...',
      color: 'from-orange-500 to-red-500',
    },
  },
  {
    id: 'gratitude',
    front: {
      title: 'Lòng Biết Ơn',
      content:
        'Hãy dành thời gian để cảm ơn những điều tốt đẹp trong cuộc sống của bạn.',
      icon: <Heart className="w-12 h-12" />,
      color: 'from-pink-400 to-rose-500',
    },
    back: {
      title: 'Thực Hành',
      content:
        'Viết ra 3 điều bạn biết ơn hôm nay. Điều này sẽ giúp bạn cảm thấy tích cực hơn.',
      action: 'Tôi biết ơn vì...',
      color: 'from-rose-500 to-pink-600',
    },
  },
  {
    id: 'growth',
    front: {
      title: 'Phát Triển Bản Thân',
      content:
        'Học hỏi không bao giờ là quá muộn. Mỗi ngày hãy học một điều mới.',
      icon: <Star className="w-12 h-12" />,
      color: 'from-purple-400 to-indigo-500',
    },
    back: {
      title: 'Kế Hoạch',
      content:
        'Chọn một kỹ năng bạn muốn phát triển và dành 15 phút mỗi ngày để luyện tập.',
      action: 'Tôi muốn học...',
      color: 'from-indigo-500 to-purple-600',
    },
  },
];

export function Corner3() {
  const [flippedCard, setFlippedCard] = useState<string | null>(null);
  const [userActions, setUserActions] = useState<Record<string, string>>({});

  const handleCardFlip = (cardId: string) => {
    setFlippedCard(flippedCard === cardId ? null : cardId);
  };

  const handleActionSubmit = (cardId: string, action: string) => {
    setUserActions(prev => ({
      ...prev,
      [cardId]: action,
    }));

    // Reset flip after action
    setTimeout(() => {
      setFlippedCard(null);
    }, 2000);
  };

  return (
    <div
      data-corner="3"
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 lg:py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Góc Phát Triển
            </h2>
            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Khám phá những bài học và thử thách để phát triển bản thân
            </p>
          </motion.div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {CARD_DATA.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group"
            >
              <motion.div
                className="relative w-full h-96 cursor-pointer"
                onClick={() => handleCardFlip(card.id)}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                {/* Card Container */}
                <div className="relative w-full h-full perspective-1000">
                  {/* Front Card */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${card.front.color} rounded-3xl shadow-2xl p-8 flex flex-col justify-center items-center text-white transform-gpu`}
                    animate={{
                      rotateY: flippedCard === card.id ? 180 : 0,
                    }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    style={{
                      backfaceVisibility: 'hidden',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div className="text-center space-y-6">
                      <motion.div
                        className="flex justify-center"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        {card.front.icon}
                      </motion.div>
                      <h3 className="text-2xl lg:text-3xl font-bold leading-tight">
                        {card.front.title}
                      </h3>
                      <p className="text-lg opacity-90 leading-relaxed">
                        {card.front.content}
                      </p>
                    </div>
                    <div className="absolute bottom-6 right-6 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                      <RotateCcw className="w-6 h-6" />
                    </div>
                  </motion.div>

                  {/* Back Card */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${card.back.color} rounded-3xl shadow-2xl p-8 flex flex-col justify-center items-center text-white transform-gpu`}
                    animate={{
                      rotateY: flippedCard === card.id ? 0 : -180,
                    }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    style={{
                      backfaceVisibility: 'hidden',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div className="text-center space-y-6 w-full">
                      <h3 className="text-2xl lg:text-3xl font-bold leading-tight">
                        {card.back.title}
                      </h3>
                      <p className="text-lg opacity-90 leading-relaxed">
                        {card.back.content}
                      </p>

                      {/* Action Input */}
                      <div className="space-y-4 w-full">
                        <p className="text-sm opacity-80 font-medium">
                          {card.back.action}
                        </p>
                        <input
                          type="text"
                          placeholder="Nhập câu trả lời của bạn..."
                          className="w-full px-4 py-3 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/90 backdrop-blur-sm"
                          value={userActions[card.id] || ''}
                          onChange={e =>
                            setUserActions(prev => ({
                              ...prev,
                              [card.id]: e.target.value,
                            }))
                          }
                          onClick={e => e.stopPropagation()}
                        />
                        <Button
                          onClick={e => {
                            e.stopPropagation();
                            if (userActions[card.id]) {
                              handleActionSubmit(card.id, userActions[card.id]);
                            }
                          }}
                          disabled={!userActions[card.id]}
                          className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl py-3 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ✨ Xác nhận
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Success Message */}
              {userActions[card.id] && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  className="absolute -bottom-20 left-0 right-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-2xl text-center shadow-2xl"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold">Tuyệt vời!</p>
                      <p className="text-sm opacity-90">
                        Bạn đã hoàn thành thử thách này.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Instructions Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 max-w-4xl mx-auto shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Cách sử dụng
              </h3>
              <p className="text-gray-600 text-lg">
                Hướng dẫn để bạn có trải nghiệm tốt nhất
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <p className="text-gray-700 text-lg">
                    Nhấn vào thẻ để lật và xem thử thách
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <p className="text-gray-700 text-lg">
                    Đọc kỹ nội dung và hoàn thành hành động
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <p className="text-gray-700 text-lg">
                    Nhập câu trả lời và nhấn &quot;Xác nhận&quot;
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    4
                  </div>
                  <p className="text-gray-700 text-lg">
                    Thẻ sẽ tự động lật lại sau khi hoàn thành
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
