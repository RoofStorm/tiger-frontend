'use client';

import { Heart, Share2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Wish } from '@/components/admin/types';
import apiClient from '@/lib/api';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useToast } from '@/hooks/use-toast';

interface WishCardProps {
  wish: Wish;
}

export const WishCard = ({ wish }: WishCardProps) => {
  const { isAuthenticated, user } = useNextAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: ({ wishId, platform }: { wishId: string; platform?: string }) =>
      apiClient.shareWish(wishId, platform),
    onSuccess: result => {
      // Invalidate user details to refresh points
      queryClient.invalidateQueries({ queryKey: ['userDetails', user?.id] });
      // Invalidate point logs to refresh point history
      queryClient.invalidateQueries({ queryKey: ['pointHistory', user?.id] });

      // Show success message with points info
      toast({
        title: 'Chia sẻ thành công!',
        description:
          result.pointsMessage || 'Lời chúc đã được chia sẻ thành công.',
        variant: result.pointsAwarded ? 'success' : 'default',
        duration: 4000,
      });
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể chia sẻ lời chúc. Vui lòng thử lại.',
        variant: 'destructive',
        duration: 4000,
      });
    },
  });

  const handleShare = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để chia sẻ lời chúc.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    // Tạo URL preview cho wish
    const baseUrl =
      process.env.NEXT_PUBLIC_PUBLIC_URL ||
      (typeof window !== 'undefined' ? window.location.origin : null) ||
      process.env.NEXTAUTH_URL ||
      'https://tiger-corporation-vietnam.vn';
    const wishUrl = `${baseUrl}/wishes`;
    const wishTitle = wish.content || 'Lời chúc từ Tiger Mood Corner';
    const wishDescription = wish.content
      ? `${wish.content.substring(0, 160)}...`
      : 'Khám phá thế giới cảm xúc qua những lời chúc đặc biệt.';

    // Tạo Facebook Share URL
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(wishUrl)}&quote=${encodeURIComponent(wishTitle)}`;

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
        description: 'Vui lòng cho phép popup để chia sẻ.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    // Focus vào popup
    if (popup) {
      popup.focus();
    }

    // Gọi API share với platform facebook để được cộng điểm
    shareMutation.mutate({ wishId: wish.id, platform: 'facebook' });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow">
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">
            {wish.user?.name?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="text-sm font-semibold text-gray-900">
              {wish.user?.name || 'Người dùng'}
            </h4>
            <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
              ⭐ Nổi bật
            </span>
          </div>

          <div className="relative">
            <div className="absolute top-0 left-0 text-lg text-gray-400 font-bold">
              &quot;
            </div>
            <div className="absolute bottom-0 right-0 text-lg text-gray-400 font-bold">
              &quot;
            </div>
            <p className="text-gray-700 text-sm leading-relaxed px-4 py-2">
              {wish.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-gray-500">
              {new Date(wish.createdAt).toLocaleDateString('vi-VN')}
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                <Heart className="w-3 h-3" />
                <span className="text-xs">Thích</span>
              </button>
              <button
                onClick={handleShare}
                disabled={shareMutation.isPending}
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors disabled:opacity-50"
                title="Chia sẻ lên Facebook"
              >
                <Share2 className="w-3 h-3" />
                <span className="text-xs">Chia sẻ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
