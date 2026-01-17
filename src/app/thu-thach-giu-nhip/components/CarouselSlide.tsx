import { motion } from 'framer-motion';
import Image from 'next/image';
import { CAROUSEL_CONFIG } from './carousel.constants';
import { CarouselImage } from './CarouselImage';
import type { Post } from './carousel.types';

interface CarouselSlideProps {
  post: Post;
  index: number;
  currentIndex: number;
  isMobile: boolean;
  isTransitioning: boolean;
  isLiked: boolean;
  likeCount: number;
  onLike: (postId: string, e: React.MouseEvent) => void;
  onSlideClick: (postId: string, index: number) => void;
  onSlideSelect: (index: number) => void;
}

/**
 * Individual carousel slide component
 * Handles positioning, scaling, and animations
 */
export function CarouselSlide({
  post,
  index,
  currentIndex,
  isMobile,
  isTransitioning,
  isLiked,
  likeCount,
  onLike,
  onSlideClick,
  onSlideSelect,
}: CarouselSlideProps) {
  const config = isMobile ? CAROUSEL_CONFIG.mobile : CAROUSEL_CONFIG.desktop;
  const { springStiffness, springDamping, hoverScale, hoverScaleSide } = CAROUSEL_CONFIG.animation;

  // Virtualization: only render slides within range
  const maxVisibleRange = config.maxVisibleRange;
  const diff = index - currentIndex;

  if (Math.abs(diff) > maxVisibleRange) {
    return null;
  }

  const pos = diff;
  const isCenter = pos === 0;

  // Calculate position and scale
  const translateBaseAdjacent = config.translateAdjacent;
  const translateBaseOuter = config.translateOuter;

  const xMove =
    pos === 0
      ? 0
      : Math.abs(pos) === 1
        ? pos * translateBaseAdjacent
        : pos * translateBaseOuter;

  const scale = isMobile
    ? pos === 0 ? config.centerScale : config.sideScale
    : pos === 0 ? config.centerScale : Math.abs(pos) === 1 ? config.sideScale : config.outerScale;

  const zIndex = 30 - Math.abs(pos) * 10;

  // Responsive dimensions (3:4 aspect ratio)
  const widthValue =
    isMobile
      ? pos === 0 ? config.centerWidth : config.sideWidth
      : pos === 0 ? config.centerWidth : Math.abs(pos) === 1 ? config.sideWidth : config.outerWidth;

  const height = Math.round(widthValue * 4 / 3);

  const widthClass =
    isMobile
      ? pos === 0 ? 'w-[16rem]' : 'w-[14rem]'
      : pos === 0 ? 'w-[20rem]' : Math.abs(pos) === 1 ? 'w-[18rem]' : 'w-[14rem]';

  const handleSlideClick = () => {
    if (isCenter) {
      onSlideClick(post.id, index);
    } else if (!isTransitioning) {
      onSlideSelect(index);
    }
  };

  return (
    <motion.div
      key={post.id}
      className={`absolute ${widthClass} cursor-pointer`}
      style={{
        height: `${height}px`,
        left: '50%',
      }}
      animate={{
        x: `calc(-50% + ${xMove}px)`,
        scale,
        opacity: 1,
        zIndex,
      }}
      transition={{
        type: 'spring',
        stiffness: springStiffness,
        damping: springDamping,
      }}
      onClick={handleSlideClick}
      whileHover={{
        scale: isCenter ? hoverScale : hoverScaleSide,
        transition: {
          duration: 0.2,
        },
      }}
    >
      <div
        className={`h-full rounded-lg border-2 ${
          isCenter ? 'border-white shadow-2xl' : 'border-white shadow-xl'
        } bg-white flex flex-col`}
      >
        {/* Image Section - Top */}
        <div className="relative flex-1 p-2 overflow-hidden">
          <CarouselImage
            post={post}
            isLiked={isLiked}
            likeCount={likeCount}
            onLike={onLike}
          />
        </div>

        {/* Bottom Section - tramnamnhipsong image */}
        <div className="flex justify-center items-center pb-2 px-2 flex-shrink-0">
          <Image
            src="/thuthachnhipsong/tramnamgiunhipsong.png"
            alt="Trăm năm giữ nhịp sống"
            width={200}
            height={60}
            className="max-w-[100px] md:max-w-[140px]"
            sizes="(max-width: 768px) 100px, 140px"
            quality={90}
          />
        </div>
      </div>
    </motion.div>
  );
}

