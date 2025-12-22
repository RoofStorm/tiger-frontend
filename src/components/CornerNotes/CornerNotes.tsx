'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const MAX_WORDS = 200;

export function CornerNotes() {
  const { isAuthenticated, user } = useNextAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  // Fetch highlighted wishes
  const { data: wishesData, isLoading } = useQuery({
    queryKey: ['highlighted-wishes-notes'],
    queryFn: () => apiClient.getHighlightedWishes(),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });

  // Backend trả về array trực tiếp hoặc có thể có wrapper
  const wishes = Array.isArray(wishesData)
    ? wishesData.slice(0, 6) // Giới hạn 6 wishes cho grid 3x2
    : Array.isArray(wishesData?.data)
      ? wishesData.data.slice(0, 6)
      : [];

  // Create wish mutation
  const createWishMutation = useMutation({
    mutationFn: (content: string) => apiClient.createWish(content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['highlighted-wishes-notes'],
      });
      queryClient.invalidateQueries({ queryKey: ['userDetails', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['pointHistory', user?.id] });

      setContent('');
      toast({
        title: 'Chia sẻ thành công!',
        description: 'Câu chuyện của bạn đã được chia sẻ.',
        variant: 'success',
        duration: 4000,
      });
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      toast({
        title: 'Chia sẻ thất bại',
        description: error?.response?.data?.message || 'Vui lòng thử lại sau.',
        variant: 'destructive',
        duration: 4000,
      });
    },
  });

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: 'Vui lòng nhập nội dung',
        description: 'Câu chuyện không được để trống.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    if (wordCount > MAX_WORDS) {
      toast({
        title: 'Nội dung quá dài',
        description: `Câu chuyện không được quá ${MAX_WORDS} từ.`,
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để chia sẻ.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    createWishMutation.mutate(content.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 lg:gap-12">
          {/* Left Column - Write Note Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 leading-tight mb-4">
              Viết note giữ nhịp!
            </h2>

            {/* Quote Text */}
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              &quot;Tôi từng nghĩ phải đợi đến khi hoàn hảo mới dám sống chậm
              lại. Nhưng hoá ra, chính tiếng cười trong bữa trưa vội, ánh nắng
              xuyên qua ô cửa, mới là điều tôi nhớ mãi. Giữ nhịp nghĩa là để
              trái tim kịp cảm nhận từng khoảnh khắc nhỏ.&quot;
            </p>

            {/* Call to Action */}
            <p className="text-lg sm:text-xl text-gray-700 font-medium">
              Câu chuyện của bạn thì sao? Chia sẻ cùng mình nhé!
            </p>

            {/* Text Input Area */}
            <div>
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
                placeholder="Viết câu chuyện của bạn ở đây..."
                rows={12}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl resize-none focus:outline-none focus:border-blue-500 text-gray-700 placeholder-gray-400 bg-white shadow-sm"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  *Câu chuyện của bạn không quá {MAX_WORDS} từ
                </p>
                <p
                  className={`text-sm font-medium ${
                    wordCount > MAX_WORDS ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  {wordCount}/{MAX_WORDS} từ
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={
                !content.trim() ||
                wordCount > MAX_WORDS ||
                createWishMutation.isPending ||
                !isAuthenticated
              }
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {createWishMutation.isPending
                ? 'Đang chia sẻ...'
                : 'Chia sẻ ngay!'}
            </Button>
          </motion.div>

          {/* Right Column - Highlighted Wishes Vertical List with Auto Scroll */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {isLoading ? (
              <div className="space-y-4 h-[600px] overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div
                    key={i}
                    className="h-24 bg-gray-200 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : wishes.length > 0 ? (
              <div className="h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
                <div className="space-y-4">
                  {wishes.map((wish: { id: string; content: string }) => (
                    <motion.div
                      key={wish.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow duration-300 mr-8"
                    >
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed italic line-clamp-1 truncate">
                        &quot;{wish.content}&quot;
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Chưa có wishes nào được highlight</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
