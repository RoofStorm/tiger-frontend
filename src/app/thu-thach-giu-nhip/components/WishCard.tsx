import Image from 'next/image';
import { Wish } from '@/types';

interface WishCardProps {
  wish: Wish;
  index: number;
}

export const WishCard = ({ wish, index }: WishCardProps) => {
  return (
    <div className="pb-8 pr-4">
      <div
        className={`backdrop-blur-sm rounded-lg p-6 border border-white/30 relative w-[85%] lg:w-[80%] ${
          index % 2 === 0 ? 'ml-[20%]' : ''
        }`}
        style={{ backgroundColor: '#FFFFFF1A' }}
      >
        {/* Quote Mark - Top Left */}
        <div className="absolute top-[-10px] md:top-[-20px] left-3">
          <Image
            src="/icons/quotemark_white.svg"
            alt="Quote mark"
            width={40}
            height={40}
            className="object-contain w-6 h-6 md:w-10 md:h-10"
          />
        </div>
        <div className="flex items-center gap-3 mb-3 pt-4">
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-300">
            {wish.user?.avatarUrl ? (
              <Image
                src={wish.user.avatarUrl}
                alt={wish.user?.name || 'User avatar'}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <Image
                src="/thuthachnhipsong/slide_example.png"
                alt="Default avatar"
                fill
                className="object-cover"
                sizes="40px"
              />
            )}
          </div>
          <span
            className="font-medium text-sm"
            style={{
              color: wish.isFromCache
                ? '#FFD700' // Màu vàng cho note mới tạo từ cache
                : '#FFFFFF', // Màu trắng cho note từ server
            }}
          >
            {wish.user?.name || 'Người dùng ẩn danh'}
          </span>
        </div>
        <div className="text-sm leading-relaxed" style={{ color: '#FFFFFF' }}>
          {wish.content}
        </div>
      </div>
    </div>
  );
};

