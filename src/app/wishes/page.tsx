'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useNextAuth } from '@/hooks/useNextAuth';
import { Button } from '@/components/ui/button';
import { Send, Heart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import apiClient from '@/lib/api';
import { WishSection } from '@/components/WishSection';
import { useGlobalNavigationLoading } from '@/hooks/useGlobalNavigationLoading';

const suggestedWishes = [
  {
    id: 1,
    content:
      '"Đi giữa vòng tay nhân dân" hiếm có quốc gia nào mà tình cảm giữa lực lượng vũ trang và nhân dân lại chân thành đến vậy. Chúng ta tự hào về truyền thống yêu nước, đoàn kết của dân tộc Việt Nam.',
  },
  {
    id: 2,
    content:
      'Khối Nghỉ hè chúng con kính chúc Khối Cựu chiến binh luôn mạnh khoẻ để ngắm nhìn đất nước hoà bình các bác dùng cả thanh xuân để đổi lấy.',
  },
  {
    id: 3,
    content:
      'Chào mừng 80 năm mốc son chói lọi trong trang sử vàng của dân tộc, biểu tượng vĩ đại cho khát vọng độc lập, tự do và hạnh phúc của nhân dân Việt Nam.',
  },
  {
    id: 4,
    content:
      'Nhân ngày Quốc khánh 2/9, con xin gửi lời tri ân sâu sắc đến các thế hệ cha anh đã hy sinh để đổi lấy hòa bình hôm nay. Chúng ta mãi mãi tự hào về truyền thống yêu nước của dân tộc Việt Nam.',
  },
  {
    id: 5,
    content:
      'Chúc cho đất nước mình ngày càng giàu đẹp, thanh bình để mọi người dân đều có cuộc sống ấm no, hạnh phúc. Việt Nam muôn năm!',
  },
  {
    id: 6,
    content:
      'Kính chúc nước Việt Nam ngày càng giàu, mạnh, thăng tiến nhưng luôn giữ vững màu cờ, sắc áo. Luôn luôn tự hào hô vang 2 tiếng "Việt Nam"',
  },
  {
    id: 7,
    content:
      'Ngày Quốc khánh 2/9, Phương Nam gửi lời chúc bình an – hạnh phúc - sung túc đến toàn thể Quý khách hàng và đồng bào cả nước.',
  },
  {
    id: 8,
    content:
      'Tinh thần yêu nước là một truyền thống quý báu của dân tộc Việt Nam. Từ xưa đến nay, mỗi khi Tổ quốc bị xâm lăng là tinh thần ấy lại kết thành một làn sóng mạnh mẽ.',
  },
  {
    id: 9,
    content:
      'Nhân dịp Quốc khánh, xin gửi lời chúc tốt đẹp nhất đến toàn thể đồng bào. Mong rằng đất nước ta sẽ ngày càng phát triển và thịnh vượng.',
  },
  {
    id: 10,
    content:
      'Tự hào là người Việt Nam! Chúc mừng ngày Quốc khánh 2/9. Mong rằng đất nước ta sẽ mãi mãi độc lập, tự do và hạnh phúc.',
  },
  {
    id: 11,
    content:
      'Dân tộc Việt Nam có truyền thống yêu nước nồng nàn, tinh thần đoàn kết cao. Chúng ta luôn tự hào về lịch sử hào hùng của dân tộc.',
  },
  {
    id: 12,
    content:
      'Mừng ngày Quốc khánh, chúc toàn thể đồng bào có một ngày lễ vui vẻ, hạnh phúc. Đất nước ta ngày càng phát triển và vững mạnh.',
  },
  {
    id: 13,
    content:
      'Nhớ ơn các anh hùng liệt sĩ đã hy sinh vì Tổ quốc. Chúng ta sẽ mãi mãi ghi nhớ công ơn và tiếp tục xây dựng đất nước ngày càng giàu mạnh.',
  },
];

export default function WishesPage() {
  const [content, setContent] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(
    null
  );
  const { user, isAuthenticated } = useNextAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { navigateWithLoading } = useGlobalNavigationLoading();

  const createWishMutation = useMutation({
    mutationFn: (content: string) => apiClient.createWish(content),
    onSuccess: result => {
      setContent('');
      setSelectedSuggestion(null);
      queryClient.invalidateQueries({ queryKey: ['highlighted-wishes'] });
      // Invalidate user details to refresh points
      queryClient.invalidateQueries({ queryKey: ['userDetails'] });
      // Invalidate point logs to refresh point history
      queryClient.invalidateQueries({ queryKey: ['pointHistory'] });

      // Show success message with points info
      toast({
        title: 'Gửi lời chúc thành công!',
        description: result.pointsMessage || 'Lời chúc của bạn đã được gửi!',
        variant: 'success',
        duration: 4000,
      });
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi lời chúc. Vui lòng thử lại.',
        variant: 'destructive',
        duration: 4000,
      });
    },
  });

  const handleSuggestionClick = (suggestion: (typeof suggestedWishes)[0]) => {
    setContent(suggestion.content);
    setSelectedSuggestion(suggestion.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createWishMutation.mutate(content.trim());
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Cần đăng nhập
          </h1>
          <p className="text-gray-600 mb-6">
            Vui lòng đăng nhập để gửi lời chúc.
          </p>
          <Link href="/auth/login">
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <Button
          onClick={() =>
            navigateWithLoading('/', 'Đang chuyển về trang chủ...')
          }
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-800 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Về trang chủ
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Wish Composition */}
          <div className="space-y-6">
            {/* Combined Card - Suggested Wishes + Wish Input */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Suggested Wishes Section */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  Câu chúc gợi ý
                </h2>
                <div className="overflow-y-auto max-h-[300px] space-y-3 pr-2">
                  {suggestedWishes.map(suggestion => (
                    <div
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedSuggestion === suggestion.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                      }`}
                    >
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {suggestion.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-6"></div>

              {/* Wish Input Section */}
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || 'User avatar'}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover"
                      unoptimized={user.image.includes(
                        'platform-lookaside.fbsbx.com'
                      )}
                    />
                  ) : (
                    <span className="text-white font-bold text-xl">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>

                {/* User Info and Input */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg font-semibold text-gray-900">
                      {user?.name || 'Người dùng'}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                      FANDOM YÊU NƯỚC
                    </span>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <div className="absolute top-2 left-2 text-2xl text-gray-400 font-bold">
                        &ldquo;
                      </div>
                      <div className="absolute bottom-2 right-2 text-2xl text-gray-400 font-bold">
                        &rdquo;
                      </div>
                      <textarea
                        value={content}
                        onChange={e => {
                          // Không trim - giữ nguyên giá trị người dùng nhập
                          setContent(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          // Ngăn event bubbling lên parent để tránh bị ảnh hưởng
                          e.stopPropagation();
                        }}
                        onKeyPress={(e) => {
                          // Ngăn event bubbling lên parent
                          e.stopPropagation();
                        }}
                        onKeyUp={(e) => {
                          // Ngăn event bubbling lên parent
                          e.stopPropagation();
                        }}
                        onDragOver={(e) => {
                          // Ngăn drag events từ parent ảnh hưởng đến textarea
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          // Ngăn drop events từ parent ảnh hưởng đến textarea
                          e.stopPropagation();
                        }}
                        placeholder="Nhập lời chúc của bạn..."
                        className="w-full px-8 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-gray-700"
                        rows={6}
                        maxLength={1000}
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {content.length}/1000 ký tự
                      </div>
                      <Button
                        type="submit"
                        disabled={
                          !content.trim() || createWishMutation.isPending
                        }
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2"
                      >
                        {createWishMutation.isPending ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin h-4 w-4 mr-2"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Đang gửi...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Send className="w-4 h-4 mr-2" />
                            GỬI LỜI CHÚC
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Highlighted Wishes */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col h-fit">
              <div className="text-center mb-6 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  GỬI LỜI CHÚC HAY NHẬN QUÀ LIỀN TAY
                </h2>
                <div className="flex items-center justify-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-600">
                    Những lời chúc nổi bật từ cộng đồng
                  </span>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[500px]">
                <WishSection />
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Heart className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs text-gray-600">
                    1,165+ người đã gửi lời chúc
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
