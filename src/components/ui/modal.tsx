'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  showCloseButton?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
  headerContent?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  closeOnBackdropClick?: boolean;
  className?: string;
  headerClassName?: string;
  closeButtonClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  showCloseButton = true,
  showHeader = true,
  headerTitle,
  headerContent,
  maxWidth = '2xl',
  closeOnBackdropClick = true,
  className = '',
  headerClassName = '',
  closeButtonClassName = '',
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={`${maxWidthClasses[maxWidth]} w-full max-h-[90vh] rounded-3xl overflow-hidden flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 shadow-2xl border border-gray-200 ${className}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          {(showHeader || showCloseButton) && (
            <div
              className={`flex items-center ${
                showHeader && headerTitle ? 'justify-between' : 'justify-end'
              } px-6 py-4 ${headerClassName}`}
            >
              {showHeader && (
                <div className="flex-1">
                  {headerContent || (
                    headerTitle && (
                      <h3 className="text-xl font-semibold text-gray-900">
                        {headerTitle}
                      </h3>
                    )
                  )}
                </div>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={`p-2 rounded-full transition-colors hover:bg-gray-200 ${closeButtonClassName}`}
                  aria-label="Đóng"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

