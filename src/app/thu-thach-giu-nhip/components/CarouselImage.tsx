import Image from 'next/image';
import { HeartIcon } from './HeartIcon';
import type { Post } from './carousel.types';

interface CarouselImageProps {
  post: Post;
  isLiked: boolean;
  likeCount: number;
  onLike: (postId: string, e: React.MouseEvent) => void;
}

/**
 * Reusable component for carousel post image
 * Eliminates duplicate JSX for imageUrl vs fallback cases
 */
export function CarouselImage({ post, isLiked, likeCount, onLike }: CarouselImageProps) {
  const imageSrc = post.imageUrl && typeof post.imageUrl === 'string' && post.imageUrl.trim() !== ''
    ? post.imageUrl
    : '/thuthachnhipsong/slide_example.png';

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <Image
        src={imageSrc}
        alt={post.caption || 'Post image'}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 256px, 320px"
      />
      {/* Tiger Logo - Centered Top */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/thuthachnhipsong/tiger_logo.svg"
          alt="TIGER Logo"
          width={80}
          height={80}
          className="object-contain"
        />
      </div>
      {/* White Heart Logo - Bottom Right */}
      <div className="absolute bottom-2 right-2 z-10 flex flex-col items-center gap-0.5">
        <div
          className="cursor-pointer transition-all duration-200 hover:scale-110"
          onClick={(e) => onLike(post.id, e)}
        >
          <HeartIcon isLiked={isLiked} />
        </div>
        <span className="text-white text-xs font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          {likeCount}
        </span>
      </div>
    </div>
  );
}

