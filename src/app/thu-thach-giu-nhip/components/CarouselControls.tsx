import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';

interface CarouselControlsProps {
  onPrev: () => void;
  onNext: () => void;
  onToggleAutoplay: () => void;
  isTransitioning: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  isAutoPlaying: boolean;
  canAutoplay: boolean;
}

/**
 * Carousel control buttons component
 * Separates control UI from carousel logic
 */
export function CarouselControls({
  onPrev,
  onNext,
  onToggleAutoplay,
  isTransitioning,
  canGoPrev,
  canGoNext,
  isAutoPlaying,
  canAutoplay,
}: CarouselControlsProps) {
  return (
    <>
      {/* Left Arrow */}
      <button
        onClick={onPrev}
        disabled={isTransitioning || !canGoPrev}
        className="flex-shrink-0 z-40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mr-2 md:mr-4"
        aria-label="Previous slide"
      >
        <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={onNext}
        disabled={isTransitioning || !canGoNext}
        className="flex-shrink-0 z-40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ml-2 md:ml-4"
        aria-label="Next slide"
      >
        <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
      </button>

      {/* Pause/Play Button */}
      <button
        onClick={onToggleAutoplay}
        disabled={!canAutoplay}
        className="absolute top-2 right-2 md:top-4 md:right-4 z-40 bg-white/80 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-lg hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={isAutoPlaying ? 'Pause' : 'Play'}
      >
        {isAutoPlaying ? (
          <Pause className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        ) : (
          <Play className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        )}
      </button>
    </>
  );
}

