'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';

interface RewardImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imagePath: string;
  alt: string;
  showCloseButton?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
  closeOnContentClick?: boolean;
  contentClickTriggerButtonClick?: boolean;
  buttonClassName?: string;
}

export function RewardImageModal({
  isOpen,
  onClose,
  imagePath,
  alt,
  showCloseButton = true,
  buttonText,
  onButtonClick,
  closeOnContentClick = false,
  contentClickTriggerButtonClick = false,
  buttonClassName = '',
}: RewardImageModalProps) {
  if (!isOpen) return null;

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    }
    onClose();
  };

  const handleContentClick = () => {
    if (closeOnContentClick) {
      if (contentClickTriggerButtonClick && onButtonClick) {
        handleButtonClick();
      } else {
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          whileHover={contentClickTriggerButtonClick ? { scale: 1.02, filter: 'brightness(1.05)' } : {}}
          transition={{ duration: 0.25 }}
          className={`relative max-w-xl w-full bg-transparent flex flex-col items-center ${closeOnContentClick ? 'cursor-pointer' : ''}`}
          onClick={closeOnContentClick ? handleContentClick : (e => e.stopPropagation())}
        >
          {/* Background Image */}
          <div className="relative w-full">
            <Image
              src={imagePath}
              alt={alt}
              width={800}
              height={900}
              className="w-full h-auto object-contain"
              priority
            />
            
            {/* Close Button */}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:bg-white/20 bg-white/10 z-10"
                aria-label="Đóng"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            )}
          </div>

          {/* Button below image */}
          {buttonText && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              onClick={handleButtonClick}
              className={`mt-3 px-8 py-3 bg-transparent border border-white rounded-lg text-white font-medium text-base hover:bg-gray-600 transition-colors ${buttonClassName}`}
            >
              {buttonText}
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

