'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Product } from '@/constants/nhipBepData';
import { getProductModalBackground } from '@/constants/nhipBepData';

interface ProductDetailModalProps {
  product: Product;
  productIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({
  product,
  productIndex,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  const { trackClick } = useAnalytics();
  const modalBackground = getProductModalBackground(productIndex);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#00579F]/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal Content Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none"
            style={{ perspective: '1000px' }}
          >
            {/* Modal Card with Flip Animation */}
            <motion.div
              initial={{ rotateY: -180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 180, opacity: 0 }}
              transition={{ 
                duration: 1.2,
                ease: [0.4, 0, 0.2, 1],
                opacity: { delay: 0.6, duration: 0.6 }
              }}
              className="pointer-events-auto [transform-style:preserve-3d] [backface-visibility:hidden]"
            >
              <div 
                className="rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] min-h-[550px] relative flex flex-col"
                style={{
                  backgroundImage: `url(${modalBackground})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'top',
                  backgroundRepeat: 'no-repeat',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                  onClick={onClose}
                  className="absolute top-3 right-3 p-2 rounded-full transition-colors hover:bg-gray-100 z-10"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5 text-[#00579F]" />
                </motion.button>

                {/* Scrollable Content */}
                <motion.div 
                  className="flex-1 overflow-y-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6, ease: 'easeOut' }}
                >
                  {/* Product Image Section */}
                  <div className="relative px-6 pt-6 pb-1 flex justify-center items-center">
                    <motion.div 
                      className="relative w-full max-w-[180px] aspect-square"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.3, duration: 0.5, ease: 'easeOut' }}
                    >
                      <Image
                        src={product.image}
                        alt={product.label}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 180px, 180px"
                      />
                    </motion.div>
                  </div>

                  {/* Product Title */}
                  <div className="px-6 pb-2">
                    <motion.h2 
                      className="text-center font-prata text-2xl md:text-3xl text-[#00579F]"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4, duration: 0.5, ease: 'easeOut' }}
                    >
                      {product.fullName}
                    </motion.h2>

                    {/* Product Branding */}
                    {product.branding && (
                      <motion.p
                        className="mt-1 text-justify font-nunito text-sm font-medium leading-relaxed text-[#00579F]"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.5, ease: 'easeOut' }}
                      >
                        {product.branding}
                      </motion.p>
                    )}
                  </div>
                </motion.div>

                {/* Bottom Section - Tips and Button */}
                <motion.div 
                  className="flex-shrink-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6, duration: 0.6, ease: 'easeOut' }}
                >
                  {/* Product Tips */}
                  <div className="px-6 pt-2 pb-4 space-y-3">
                    {product.tips.map((tip, index) => (
                      <motion.div 
                        key={index} 
                        className="flex gap-3 text-justify"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: 1.7 + index * 0.1, 
                          duration: 0.5, 
                          ease: 'easeOut' 
                        }}
                      >
                        {/* Check Circle Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          <Image
                            src="/icons/check_circle.svg"
                            alt="Check"
                            width={18}
                            height={18}
                            className="object-contain"
                          />
                        </div>
                            {/* Tip Text */}
                            <p className="font-nunito text-sm leading-relaxed text-[#00579F]">
                              {tip}
                            </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Mua ngay Button */}
                  <div className="px-6 pb-6 pt-2">
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.9, duration: 0.5, ease: 'easeOut' }}
                      className="w-full py-2.5 rounded-lg font-nunito font-semibold text-white transition-all duration-300 hover:opacity-90 bg-[#00579F] text-[15px]"
                      onClick={() => {
                        // Track "Mua ngay" button click in product modal
                        trackClick('nhip-bep', {
                          zone: 'zoneB',
                          component: 'button',
                          metadata: { 
                            label: 'mua_ngay',
                            productLabel: product.label,
                          },
                        });

                        // Open shopee link in new tab
                        window.open(product.buyLink, '_blank');
                      }}
                    >
                      Mua ngay
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

