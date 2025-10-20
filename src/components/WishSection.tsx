import { useQuery } from '@tanstack/react-query';
import { Heart, Star } from 'lucide-react';
import apiClient from '@/lib/api';
import { WishCard } from './WishCard';
import { Wish } from '@/components/admin/types';

export const WishSection = () => {
  const {
    data: wishesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['highlighted-wishes'],
    queryFn: () => apiClient.getHighlightedWishes(),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });

  const wishes = wishesData?.data || [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Heart className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-bold text-gray-900">Lời chúc nổi bật</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải lời chúc...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Heart className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-bold text-gray-900">Lời chúc nổi bật</h2>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-600 mb-2">Không thể tải lời chúc</p>
          <p className="text-gray-500">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  if (wishes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Heart className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-bold text-gray-900">Lời chúc nổi bật</h2>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">Chưa có lời chúc nổi bật</p>
          <p className="text-gray-500">Hãy là người đầu tiên gửi lời chúc!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pr-2">
      {wishes.map((wish: Wish) => (
        <WishCard key={wish.id} wish={wish} />
      ))}
    </div>
  );
};
