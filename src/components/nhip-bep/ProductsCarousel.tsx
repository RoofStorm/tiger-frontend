'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Product, getProductBackgroundImage } from '@/constants/nhipBepData';
import { useProductCardInteraction } from '@/hooks/useProductCardInteraction';
import { useNextAuth } from '@/hooks/useNextAuth';

interface ProductsCarouselProps {
  products: Product[];
  zoneRef?: React.RefObject<HTMLDivElement | null>;
  onProductSelect: (product: Product, index: number) => void;
  isModalOpen?: boolean;
}

export function ProductsCarousel({
  products,
  zoneRef,
  onProductSelect,
  isModalOpen = false,
}: ProductsCarouselProps) {
  const [currentProductSlide, setCurrentProductSlide] = useState(0);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { trackClick } = useAnalytics();
  const { handleProductCardInteraction, remainingClicks } = useProductCardInteraction();
  const { isAuthenticated } = useNextAuth();
  const hoveredProductsRef = useRef<Set<number>>(new Set());

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-loop for products - pause when hovering
  useEffect(() => {
    if (isHovering) return; // Pause auto-loop when hovering

    const interval = setInterval(() => {
      setCurrentProductSlide((prev) => (prev + 1) % products.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [products.length, isHovering]);

  // Reset hoveredProductsRef when slide changes to allow hover again
  // This is especially important for mobile where tap/click is the primary interaction
  // On mobile, users tap products, and if we don't reset, tapping again after slide change won't trigger
  useEffect(() => {
    hoveredProductsRef.current.clear();
  }, [currentProductSlide]);

  // Sync isHovering with modal state from parent
  // When modal opens (via click or hover), pause auto-loop
  // When modal closes, resume auto-loop
  useEffect(() => {
    setIsHovering(isModalOpen);
  }, [isModalOpen]);

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const handleProductHover = (product: Product, index: number) => {
    // Set hovering state to pause auto-loop
    setIsHovering(true);
    
    // Prevent spam: only process API call once per product per slide
    if (!hoveredProductsRef.current.has(index)) {
      hoveredProductsRef.current.add(index);
      
      // Preload product image immediately when hovering
      const img = new window.Image();
      img.src = product.image;
      
      // Call API to award points for product card hover (only once per product per slide)
      handleProductCardInteraction();
    }
    
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    // Set new timeout to open modal after 500ms
    const timeout = setTimeout(() => {
      onProductSelect(product, index);
    }, 500);
    setHoverTimeout(timeout);
  };

  const handleProductLeave = () => {
    // Resume auto-loop when leaving
    setIsHovering(false);
    
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleProductCardClick = (product: Product, actualIndex: number) => {
    // Pause auto-loop when modal opens (via click)
    // Note: isHovering will also be synced via isModalOpen prop from parent
    setIsHovering(true);
    
    // Only process if user is authenticated
    if (!isAuthenticated) {
      return;
    }

    // Check if remainingClicks is 0, if so, don't process
    if (remainingClicks !== null && remainingClicks === 0) {
      return;
    }

    // Call API immediately
    handleProductCardInteraction();
  };

  const nextProductSlide = () => {
    // Track next arrow click in Zone B
    trackClick('nhip-bep', {
      zone: 'zoneB',
      component: 'navigation_arrow',
      metadata: { direction: 'next' },
    });

    setCurrentProductSlide((prev) => (prev + 1) % products.length);
  };

  const prevProductSlide = () => {
    // Track prev arrow click in Zone B
    trackClick('nhip-bep', {
      zone: 'zoneB',
      component: 'navigation_arrow',
      metadata: { direction: 'prev' },
    });

    setCurrentProductSlide((prev) => (prev - 1 + products.length) % products.length);
  };

  const goToProductSlide = (index: number) => {
    // Track navigation dot click in Zone B
    trackClick('nhip-bep', {
      zone: 'zoneB',
      component: 'navigation_dot',
      metadata: { dotIndex: index, totalDots: products.length },
    });

    setCurrentProductSlide(index);
  };

  return (
    <div 
      ref={zoneRef}
      className="relative w-full py-16 bg-[#00579F]"
    >
      {/* Background Image using Next.js Image */}
      <Image
        src="/nhipbep/nhipbep_products_background.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center -z-10"
      />
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-6">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-prata text-white">
            Nhịp bếp
          </h2>

          {/* Description */}
          <div className="max-w-6xl mx-auto">
            <p className="mb-4 font-nunito font-normal text-base leading-6 text-center text-white">
              Gian bếp là nơi nhịp sống được nuôi dưỡng. Ở đó, một mẹo nhỏ, một thói quen đơn giản có thể giữ nhịp cả ngày cho bạn. TIGER đồng hành với bạn trong từng nhịp ấy – bởi TIGER bắt đầu bằng công nghệ giữ nhiệt, rồi phát triển để giữ trọn hương vị, độ ẩm và sự an toàn.
            </p>
          </div>
        </div>

        {/* Products Carousel */}
        <div className="relative">
          {/* Carousel Container */}
          <div className="relative overflow-hidden">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentProductSlide * (100 / (isMobile ? 1 : 4))}%)` }}>
              {/* Only render visible products for performance */}
              {/* Desktop: show 4 items (current + 3 next), Mobile: show 1 item */}
              {products.map((product, index) => {
                // Calculate if product is visible
                // Desktop: show current + 3 next items (4 total)
                // Mobile: show only current item (1 total)
                const maxVisibleRange = isMobile ? 0 : 3;
                const distance = Math.abs(index - currentProductSlide);
                // Also handle wrap-around cases
                const wrapDistance = Math.min(
                  distance,
                  Math.abs(index - currentProductSlide + products.length),
                  Math.abs(index - currentProductSlide - products.length)
                );
                // For desktop: show items from current to current+3 (4 items total)
                // For mobile: show only current item
                const isVisible = isMobile 
                  ? wrapDistance === 0 
                  : wrapDistance <= maxVisibleRange;
                
                // Skip rendering if not visible (render placeholder to maintain layout)
                if (!isVisible) {
                  return (
                    <div
                      key={index}
                      className="min-w-full md:min-w-[25%] flex-shrink-0"
                      aria-hidden="true"
                    />
                  );
                }
                // Calculate the actual product index (for background selection)
                const actualIndex = index % products.length;
                const backgroundImage = getProductBackgroundImage(actualIndex);
                
                return (
                  <div
                    key={index}
                    className="min-w-full md:min-w-[25%] flex-shrink-0 px-4 flex flex-col"
                  >
                    <div className="flex justify-center flex-1">
                      <div 
                        className="rounded-lg p-4 md:p-8 w-full h-full min-h-[280px] md:min-h-0 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl group relative overflow-hidden flex flex-col"
                        style={{
                          backgroundImage: `url(${backgroundImage})`,
                          backgroundSize: '100% 100%',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }}
                        onClick={() => {
                          // Track product card click in Zone B
                          trackClick('nhip-bep', {
                            zone: 'zoneB',
                            component: 'product_card',
                            metadata: { 
                              productLabel: product.label,
                              productIndex: actualIndex,
                            },
                          });

                          // Call API to award points for product card click
                          handleProductCardClick(product, actualIndex);

                          onProductSelect(product, actualIndex);
                        }}
                        onMouseEnter={() => handleProductHover(product, actualIndex)}
                        onMouseLeave={handleProductLeave}
                      >
                        <div className="flex flex-col items-center justify-center space-y-2 md:space-y-4 relative z-10 flex-1">
                          {/* Product Image */}
                          <div className="relative w-full aspect-square max-w-[180px] md:max-w-xs transition-transform duration-300 group-hover:scale-110 flex-shrink-0">
                            <Image
                              src={product.image}
                              alt={product.label}
                              fill
                              sizes="(max-width: 768px) 180px, 180px"
                              className="object-contain"
                              loading="lazy"
                            />
                          </div>

                          {/* Product Label */}
                          <h3 className="text-base md:text-xl font-nunito font-medium text-gray-800 transition-colors duration-300 group-hover:text-[#00579F] text-center flex-shrink-0">
                            {product.label}
                          </h3>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mua ngay Button - Outside card, below card */}
                    <div className="flex justify-center mt-3 md:mt-4 w-full flex-shrink-0">
                      <button
                        onClick={() => {
                          // Track "Mua ngay" button click in product card
                          trackClick('nhip-bep', {
                            zone: 'zoneB',
                            component: 'button',
                            metadata: { 
                              label: 'mua_ngay',
                              productLabel: product.label,
                              productIndex: actualIndex,
                            },
                          });

                          // Open shopee link in new tab
                          window.open(product.buyLink, '_blank');
                        }}
                        className="w-full px-4 md:px-6 py-1.5 md:py-2 rounded-lg font-nunito font-semibold text-white transition-all duration-300 hover:opacity-90 text-sm md:text-base bg-transparent border border-white"
                      >
                        Mua ngay
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dot Navigation with Arrows */}
        <div className="flex justify-center items-center gap-4 mt-8">
          {/* Left Arrow */}
          <button
            onClick={prevProductSlide}
            className="bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300"
            aria-label="Previous product"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          {/* Dot Navigation */}
          <div className="flex items-center gap-3">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => goToProductSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentProductSlide
                    ? 'w-3 h-3 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to product ${index + 1}`}
              />
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextProductSlide}
            className="bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300"
            aria-label="Next product"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
}

