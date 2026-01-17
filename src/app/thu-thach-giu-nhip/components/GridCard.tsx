import { motion } from 'framer-motion';
import Image from 'next/image';
import { HeartIcon } from './HeartIcon';
import type { Post } from './carousel.types';

interface GridCardProps {
  post: Post;
  isLiked: boolean;
  likeCount: number;
  onLike: (postId: string, e: React.MouseEvent) => void;
}

/**
 * Grid card component for displaying posts in grid layout
 * Reuses HeartIcon and similar styling from carousel
 */
export function GridCard({ post, isLiked, likeCount, onLike }: GridCardProps) {
  const imageSrc =
    post.imageUrl && typeof post.imageUrl === 'string' && post.imageUrl.trim() !== ''
      ? post.imageUrl
      : '/thuthachnhipsong/slide_example.png';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="relative aspect-[3/4] w-full rounded-lg overflow-hidden group"
    >
      {/* Image */}
      <Image
        src={imageSrc}
        alt={post.caption || 'Post image'}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, 33vw"
      />

      {/* Overlay gradient - always visible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Tiger Logo - Top Center (always visible) */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/thuthachnhipsong/tiger_logo.svg"
          alt="TIGER Logo"
          width={60}
          height={60}
          className="object-contain"
        />
      </div>

      {/* Like Button & Count - Bottom Right (always visible) */}
      <div className="absolute bottom-2 right-2 z-10 flex flex-col items-center gap-0.5">
        <div
          className="cursor-pointer transition-all duration-200 hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            onLike(post.id, e);
          }}
        >
          <HeartIcon isLiked={isLiked} />
        </div>
        <span className="text-white text-xs font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          {likeCount}
        </span>
      </div>

      {/* Caption preview (always visible) */}
      {post.caption && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-sm md:text-base leading-relaxed line-clamp-2">{post.caption}</p>
        </div>
      )}
    </motion.div>
  );
}

