import { Heart } from 'lucide-react';
import { Wish } from '@/components/admin/types';

interface WishCardProps {
  wish: Wish;
}

export const WishCard = ({ wish }: WishCardProps) => {
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
              "
            </div>
            <div className="absolute bottom-0 right-0 text-lg text-gray-400 font-bold">
              "
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
