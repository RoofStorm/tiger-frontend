'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { SlideContent } from '@/constants/nhipBepData';

interface HistoryCarouselProps {
  slides: SlideContent[];
  zoneRef?: React.RefObject<HTMLDivElement | null>;
}

export function HistoryCarousel({ slides, zoneRef }: HistoryCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { trackClick } = useAnalytics();

  const currentContent = slides[currentSlide];

  // Preload only current slide and next slide for optimal performance
  useEffect(() => {
    const preloadSlide = (index: number) => {
      if (slides[index]?.image) {
        const img = new window.Image();
        img.src = slides[index].image;
      }
    };

    // Preload current slide
    preloadSlide(currentSlide);
    // Preload next slide
    preloadSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, slides]);

  // Auto-loop for history slides
  useEffect(() => {
    if (slides.length <= 1 || !isAutoPlaying) return;

    const interval = setInterval(() => {
      setSlideDirection('right');
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  // Functions to handle slide navigation with direction
  const goToSlide = (index: number) => {
    // Track navigation dot click in Zone A
    trackClick('nhip-bep', {
      zone: 'zoneA',
      component: 'navigation_dot',
      metadata: { dotIndex: index, totalDots: slides.length },
    });

    if (index > currentSlide) {
      setSlideDirection('right');
    } else if (index < currentSlide) {
      setSlideDirection('left');
    }
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    // Track next arrow click in Zone A
    trackClick('nhip-bep', {
      zone: 'zoneA',
      component: 'navigation_arrow',
      metadata: { direction: 'next' },
    });

    setSlideDirection('right');
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    // Track prev arrow click in Zone A
    trackClick('nhip-bep', {
      zone: 'zoneA',
      component: 'navigation_arrow',
      metadata: { direction: 'prev' },
    });

    setSlideDirection('left');
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div ref={zoneRef} className="relative w-full min-h-[500px] md:min-h-0 max-h-[600px] md:max-h-[700px] overflow-hidden">
      <AnimatePresence mode="wait" custom={slideDirection}>
        <motion.div
          key={currentSlide}
          custom={slideDirection}
          initial={{ 
            opacity: 0,
            x: slideDirection === 'right' ? '100%' : '-100%'
          }}
          animate={{ 
            opacity: 1,
            x: 0
          }}
          exit={{ 
            opacity: 0,
            x: slideDirection === 'right' ? '-100%' : '100%'
          }}
          transition={{ 
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier for smoother animation
            opacity: { duration: 0.6 }
          }}
          className="relative w-full h-full"
        >
          <Image
            src={currentContent.image}
            alt="History Background"
            width={1920}
            height={1080}
            className="w-full h-[500px] md:h-auto max-h-[600px] md:max-h-[750px] object-cover"
            priority={currentSlide === 0}
          />
          {/* Gradient Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(93, 93, 93, 0) 0%, rgba(37, 37, 37, 0.605237) 35.7%, #000000 100%)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Text Content - Absolute, center bottom overlay */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4 pb-8 md:pb-12 z-10">
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={currentSlide}
            custom={slideDirection}
            initial={{ 
              opacity: 0, 
              y: 20,
              x: slideDirection === 'right' ? 50 : -50
            }}
            animate={{ 
              opacity: 1, 
              y: 0,
              x: 0
            }}
            exit={{ 
              opacity: 0, 
              y: -20,
              x: slideDirection === 'right' ? -50 : 50
            }}
            transition={{ 
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier for smoother animation
              delay: 0.15,
              opacity: { duration: 0.6 }
            }}
            className="text-center"
          >
            {/* Dates */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-nunito text-white mb-3 md:mb-4">
              {currentContent.dates}
            </h2>

            {/* Subtitle */}
            <h3 className="text-lg md:text-xl lg:text-2xl font-nunito text-white mb-2">
              {currentContent.subtitle}
            </h3>

            {/* Body Text */}
            <div className="text-white space-y-1 px-2">
              {currentContent.paragraphs.map((paragraph, index) => (
                <p 
                  key={index}
                  className="font-nunito font-normal text-lg leading-6 text-center"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Learn More Link */}
            <div className="mt-2 text-center">
              <a
                href={currentContent.learnMoreLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-nunito font-normal text-lg text-white underline inline-block"
                onClick={() => {
                  trackClick('nhip-bep', {
                    zone: 'zoneA',
                    component: 'learn_more_link',
                    metadata: { 
                      slideIndex: currentSlide,
                      dates: currentContent.dates,
                    },
                  });
                }}
              >
                Tìm hiểu thêm
              </a>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots with Arrows */}
        <div className="flex justify-center items-center gap-4 mt-6 md:mt-8">
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="bg-white/80 hover:bg-white rounded-full p-1.5 shadow-lg transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
          </button>

          {/* Dot Navigation */}
          <div className="flex items-center gap-2 md:gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? 'w-2.5 h-2.5 md:w-3 md:h-3 bg-white'
                    : 'w-2 h-2 md:w-2 md:h-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="bg-white/80 hover:bg-white rounded-full p-1.5 shadow-lg transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
          </button>

          {/* Pause/Play Button */}
          <button
            onClick={() => {
              setIsAutoPlaying(!isAutoPlaying);
              // Track pause/play button click in Zone A
              trackClick('nhip-bep', {
                zone: 'zoneA',
                component: 'pause_play_button',
                metadata: { 
                  action: isAutoPlaying ? 'pause' : 'play',
                },
              });
            }}
            className="bg-white/80 hover:bg-white rounded-full p-1.5 shadow-lg transition-all duration-300"
            aria-label={isAutoPlaying ? 'Pause' : 'Play'}
          >
            {isAutoPlaying ? (
              <Pause className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            ) : (
              <Play className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

