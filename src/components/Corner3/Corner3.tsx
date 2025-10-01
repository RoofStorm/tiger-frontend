'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Lightbulb, Heart, Star } from 'lucide-react';
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
      content: 'Mỗi ngày là một cơ hội mới để phát triển và trở thành phiên bản tốt nhất của chính mình.',
      icon: <Lightbulb className="w-12 h-12" />,
      color: 'from-yellow-400 to-orange-500',
    },
    back: {
      title: 'Hành Động',
      content: 'Hãy đặt ra một mục tiêu nhỏ cho hôm nay và thực hiện nó. Mỗi bước nhỏ đều có ý nghĩa.',
      action: 'Tôi sẽ...',
      color: 'from-orange-500 to-red-500',
    },
  },
  {
    id: 'gratitude',
    front: {
      title: 'Lòng Biết Ơn',
      content: 'Hãy dành thời gian để cảm ơn những điều tốt đẹp trong cuộc sống của bạn.',
      icon: <Heart className="w-12 h-12" />,
      color: 'from-pink-400 to-rose-500',
    },
    back: {
      title: 'Thực Hành',
      content: 'Viết ra 3 điều bạn biết ơn hôm nay. Điều này sẽ giúp bạn cảm thấy tích cực hơn.',
      action: 'Tôi biết ơn vì...',
      color: 'from-rose-500 to-pink-600',
    },
  },
  {
    id: 'growth',
    front: {
      title: 'Phát Triển Bản Thân',
      content: 'Học hỏi không bao giờ là quá muộn. Mỗi ngày hãy học một điều mới.',
      icon: <Star className="w-12 h-12" />,
      color: 'from-purple-400 to-indigo-500',
    },
    back: {
      title: 'Kế Hoạch',
      content: 'Chọn một kỹ năng bạn muốn phát triển và dành 15 phút mỗi ngày để luyện tập.',
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Góc Phát Triển
          </h2>
          <p className="text-xl md:text-2xl text-gray-600">
            Khám phá những bài học và thử thách để phát triển bản thân
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CARD_DATA.map((card) => (
            <div key={card.id} className="relative">
              <motion.div
                className="relative w-full h-80 cursor-pointer"
                onClick={() => handleCardFlip(card.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Card Container */}
                <div className="relative w-full h-full">
                  {/* Front Card */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${card.front.color} rounded-2xl shadow-xl p-6 flex flex-col justify-center items-center text-white`}
                    animate={{
                      rotateY: flippedCard === card.id ? 180 : 0,
                    }}
                    transition={{ duration: 0.6 }}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        {card.front.icon}
                      </div>
                      <h3 className="text-2xl font-bold">
                        {card.front.title}
                      </h3>
                      <p className="text-lg opacity-90 leading-relaxed">
                        {card.front.content}
                      </p>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <RotateCcw className="w-6 h-6 opacity-70" />
                    </div>
                  </motion.div>

                  {/* Back Card */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${card.back.color} rounded-2xl shadow-xl p-6 flex flex-col justify-center items-center text-white`}
                    animate={{
                      rotateY: flippedCard === card.id ? 0 : -180,
                    }}
                    transition={{ duration: 0.6 }}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="text-center space-y-4">
                      <h3 className="text-2xl font-bold">
                        {card.back.title}
                      </h3>
                      <p className="text-lg opacity-90 leading-relaxed">
                        {card.back.content}
                      </p>
                      
                      {/* Action Input */}
                      <div className="space-y-3 w-full">
                        <p className="text-sm opacity-80">
                          {card.back.action}
                        </p>
                        <input
                          type="text"
                          placeholder="Nhập câu trả lời của bạn..."
                          className="w-full px-4 py-2 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                          value={userActions[card.id] || ''}
                          onChange={(e) => setUserActions(prev => ({
                            ...prev,
                            [card.id]: e.target.value,
                          }))}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (userActions[card.id]) {
                              handleActionSubmit(card.id, userActions[card.id]);
                            }
                          }}
                          disabled={!userActions[card.id]}
                          className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
                        >
                          Xác nhận
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Success Message */}
              {userActions[card.id] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-16 left-0 right-0 bg-green-500 text-white p-3 rounded-lg text-center"
                >
                  <p className="font-semibold">Tuyệt vời!</p>
                  <p className="text-sm opacity-90">
                    Bạn đã hoàn thành thử thách này.
                  </p>
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-16 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Cách sử dụng
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>• Nhấn vào thẻ để lật và xem thử thách</p>
              <p>• Đọc kỹ nội dung và hoàn thành hành động</p>
              <p>• Nhập câu trả lời và nhấn "Xác nhận"</p>
              <p>• Thẻ sẽ tự động lật lại sau khi hoàn thành</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

