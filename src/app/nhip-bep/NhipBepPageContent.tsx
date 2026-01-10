'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { TimelineInteractive } from '@/components/TimelineInteractive/TimelineInteractive';
import { useZoneView } from '@/hooks/useZoneView';
import { slides, products, Product } from '@/constants/nhipBepData';
import { HistoryCarousel } from '@/components/nhip-bep/HistoryCarousel';
import { ProductsCarousel } from '@/components/nhip-bep/ProductsCarousel';
import { ProductDetailModal } from '@/components/nhip-bep/ProductDetailModal';

export function NhipBepPageContent() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const zoneARef = useRef<HTMLDivElement>(null);
  const zoneBRef = useRef<HTMLDivElement>(null);

  // Track time on Nhip Bep page (Overview)
  useZoneView(pageRef, {
    page: 'nhip-bep',
    zone: 'overview',
  });

  const handleProductSelect = (product: Product, index: number) => {
    setSelectedProduct(product);
    setSelectedProductIndex(index);
  };

  const handleModalClose = () => {
    setSelectedProduct(null);
    setSelectedProductIndex(null);
  };

  return (
    <div ref={pageRef} className="min-h-screen">
      <main className="min-h-[calc(100vh-80px)] bg-white mt-[64px] xl:mt-[80px]">
        {/* History Carousel */}
        <HistoryCarousel slides={slides} zoneRef={zoneARef} />

        {/* Background Section */}
        <div className="relative w-full min-h-[600px] md:min-h-[800px]">
          <Image
            src="/nhipbep/nhipbep_background.png"
            alt="Nhip Bep Background"
            width={1920}
            height={1080}
            className="w-full h-auto object-cover min-h-[300px] md:min-h-[800px]"
          />

          {/* Text Content - Absolute, centered overlay */}
          <div className="absolute top-[15%] md:top-[38%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl px-4 z-10">
            <div className="text-center space-y-6">
              {/* Title */}
              <h2 className="text-4xl md:text-5xl font-prata" style={{ color: '#00579F' }}>
                Cột mốc thời gian
              </h2>
              {/* Body Text */}
              <div className="text-center max-w-3xl mx-auto">
                <p className="text-base md:text-lg text-gray-800 font-sans leading-relaxed">
                  &quot;Từ chiếc bình giữ nhiệt đầu tiên năm 1923, TIGER đã không ngừng sáng tạo
                </p>
                <p>để giữ ấm, giữ trọn, giữ nhịp sống qua từng sản phẩm.&quot;</p>
              </div>
            </div>
          </div>

          {/* Timeline Image - Relative on mobile, absolute on desktop */}
          <div className="relative md:absolute md:bottom-[70px] left-0 w-full z-10">
            {/* Mobile: Static timeline image */}
            <div className="md:hidden">
              <Image
                src="/nhipbep/timeline_mobile.png"
                alt="Timeline"
                width={1920}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Desktop: Interactive timeline */}
            <div className="hidden md:block">
              <TimelineInteractive />
            </div>
          </div>
        </div>

        {/* Products Carousel */}
        <ProductsCarousel
          products={products}
          zoneRef={zoneBRef}
          onProductSelect={handleProductSelect}
          isModalOpen={!!selectedProduct}
        />
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && selectedProductIndex !== null && (
        <ProductDetailModal
          product={selectedProduct}
          productIndex={selectedProductIndex}
          isOpen={!!selectedProduct}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

