'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Post {
  id: string;
  caption?: string;
  imageUrl?: string;
  likeCount?: number;
  isLiked?: boolean;
}

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onLike: (postId: string, e: React.MouseEvent) => void;
  likedPosts: Set<string>;
  likeCounts: Map<string, number>;
}

export function PostDetailModal({
  isOpen,
  onClose,
  posts,
  currentIndex,
  onNavigate,
  onLike,
  likedPosts,
  likeCounts,
}: PostDetailModalProps) {
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const currentPost = posts[currentIndex];

  // Reset caption expansion when post changes
  useEffect(() => {
    setIsCaptionExpanded(false);
  }, [currentIndex]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailRef.current && isOpen) {
      const activeItem = thumbnailRef.current.children[currentIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [currentIndex, isOpen]);

  if (!currentPost) return null;

  const isLiked = likedPosts.has(currentPost.id) || currentPost.isLiked;
  const likeCount = likeCounts.get(currentPost.id) ?? currentPost.likeCount ?? 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 z-[110] text-white/70 hover:text-white transition-colors bg-black/20 rounded-full p-2"
          >
            <X size={28} className="md:w-8 md:h-8" />
          </button>

          {/* Main Content */}
          <div className="relative z-[105] w-full h-full flex flex-col items-center justify-center p-4 gap-4 md:gap-8 overflow-hidden">
            {/* Post Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative aspect-[3/4] w-full max-w-[400px] md:max-w-[450px] rounded-2xl overflow-hidden shadow-2xl flex flex-col flex-shrink min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Section - Fills the whole card */}
              <Image
                src={currentPost.imageUrl || '/thuthachnhipsong/slide_example.png'}
                alt={currentPost.caption || 'Post detail'}
                fill
                className="object-cover"
                priority
              />
              
              {/* Tiger Logo - Top Center */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/thuthachnhipsong/tiger_logo.svg"
                  alt="TIGER Logo"
                  className="w-20 md:w-24 object-contain"
                />
              </div>

              {/* Bottom Info Overlay (Caption & Likes) */}
              <div className="absolute bottom-0 left-0 right-0 p-5 pt-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20">
                <div className="flex flex-col gap-2">
                  {/* Like Button & Count - Positioned above caption area on the right */}
                  <div className="flex flex-col items-center gap-0.5 self-end mb-2">
                    <button
                      onClick={(e) => onLike(currentPost.id, e)}
                      className="transition-transform active:scale-90"
                    >
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 30 30"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15.775 26.0125C15.35 26.1625 14.65 26.1625 14.225 26.0125C10.6 24.775 2.5 19.6125 2.5 10.8625C2.5 7 5.6125 3.875 9.45 3.875C11.725 3.875 13.7375 4.975 15 6.675C16.2625 4.975 18.2875 3.875 20.55 3.875C24.3875 3.875 27.5 7 27.5 10.8625C27.5 19.6125 19.4 24.775 15.775 26.0125Z"
                          fill={isLiked ? "#EF4444" : "none"}
                          stroke={isLiked ? "#EF4444" : "white"}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <span className="text-white font-bold text-sm drop-shadow-md">
                      {likeCount}
                    </span>
                  </div>

                  {/* Caption Section */}
                  <div className="flex flex-col gap-1">
                    <div className={`text-white text-sm md:text-base leading-relaxed ${!isCaptionExpanded ? 'line-clamp-2' : ''}`}>
                      {currentPost.caption || "Không có chú thích."}
                    </div>
                    {currentPost.caption && currentPost.caption.length > 80 && (
                      <button
                        onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
                        className="text-white text-sm font-bold self-start hover:underline underline-offset-2"
                      >
                        {isCaptionExpanded ? 'Thu gọn' : '... Xem thêm'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Thumbnail Navigation Strip */}
            <div className="w-full max-w-4xl relative px-10 md:px-12">
              <div
                ref={thumbnailRef}
                className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-2 snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {posts.map((post, index) => (
                  <motion.div
                    key={`thumb-${post.id}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate(index)}
                    className={`
                      relative flex-shrink-0 w-14 h-18 md:w-20 md:h-24 
                      rounded-lg overflow-hidden cursor-pointer snap-center
                      border-2 transition-all duration-300
                      ${index === currentIndex ? 'border-white scale-110 shadow-lg z-10' : 'border-transparent opacity-40'}
                    `}
                  >
                    <Image
                      src={post.imageUrl || '/thuthachnhipsong/slide_example.png'}
                      alt="Thumbnail"
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                ))}
              </div>
              
              {/* Navigation buttons for thumbnails */}
              <button 
                onClick={() => onNavigate(Math.max(0, currentIndex - 1))}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={36} />
              </button>
              <button 
                onClick={() => onNavigate(Math.min(posts.length - 1, currentIndex + 1))}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                disabled={currentIndex === posts.length - 1}
              >
                <ChevronRight size={36} />
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
