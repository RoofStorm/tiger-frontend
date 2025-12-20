'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import Image from 'next/image';
import { TimelineInteractive } from '@/components/TimelineInteractive/TimelineInteractive';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface SlideContent {
  dates: string;
  subtitle: string;
  paragraphs: string[];
  image: string;
}

const slides: SlideContent[] = [
  {
    dates: '1953 - 1967',
    subtitle: 'An Large Variety of Vacuum Bottles',
    paragraphs: [
      "The 'Five-fold Power Vacuum Bottle' was launched in the early days of the company and went on to become a popular product further down the road, but at the time of its initial release it was still only useful for hiking or traveling, and domestic demand was low.",
      "However, the company continued to develop new products. These included a baby bottle with a teat over the opening (thermal baby bottle), and a vacuum bottle for sake that kept the sake inside warm. Many other amazing products went on to be developed, such as a container for ice cream, and a vacuum bottle for ayu fishing to refrigerate and transport freshly caught fish."
    ],
    image: '/nhipbep/history1_background.svg'
  },
  // Add more slides as needed
  {
    dates: '1968 - 1980',
    subtitle: 'Expansion and Innovation',
    paragraphs: [
      "During this period, the company expanded its product line and continued to innovate in vacuum bottle technology.",
      "New manufacturing processes were developed, and the company began to establish itself as a leader in thermal insulation products."
    ],
    image: '/nhipbep/history1_background.svg'
  },
  {
    dates: '1981 - 2000',
    subtitle: 'Global Reach',
    paragraphs: [
      "The company expanded globally, bringing its innovative vacuum bottle technology to markets around the world.",
      "This era marked significant growth in both product diversity and international presence."
    ],
    image: '/nhipbep/history1_background.svg'
  }
];

interface Product {
  image: string;
  label: string;
  fullName: string;
  benefits: string[];
}

const baseProducts: Product[] = [
  {
    image: '/nhipbep/noicom.svg',
    label: 'Nồi cơm điện',
    fullName: 'Nồi cơm điện Tiger',
    benefits: [
      '"Xới cơm ngay khi cơm vừa chín – hạt tơi, không khô cả ngày. Với nồi Tiger, hạt cơm được giữ ấm đều, thơm như mới nấu."',
      '"Cho vài giọt dầu ăn vào gạo – cơm bóng và tơi hơn. Nồi Tiger giữ trọn hương thơm và độ dẻo."',
      '"Nấu cháo nhanh bằng nước sôi – chỉ 30 phút đã nhừ. Công nghệ kiểm soát nhiệt Tiger giúp hạt gạo bung đều, không khê."'
    ]
  },
  {
    image: '/nhipbep/binhgiunhiet.svg',
    label: 'Bình giữ nhiệt',
    fullName: 'Bình giữ nhiệt Tiger',
    benefits: [
      '"Giữ nhiệt độ lâu dài – đồ uống nóng vẫn nóng, đồ lạnh vẫn lạnh suốt nhiều giờ. Công nghệ chân không của Tiger đảm bảo nhiệt độ được bảo toàn tối đa."',
      '"Thiết kế tiện lợi – dễ dàng mang theo mọi nơi, phù hợp cho công việc, du lịch hay hoạt động ngoài trời."',
      '"An toàn và bền bỉ – chất liệu cao cấp, không chứa chất độc hại, đảm bảo sức khỏe cho người sử dụng."'
    ]
  },
  {
    image: '/nhipbep/hopcom.svg',
    label: 'Hộp cơm',
    fullName: 'Hộp cơm Tiger',
    benefits: [
      '"Giữ thức ăn nóng lâu – công nghệ cách nhiệt hiện đại giúp thức ăn giữ được độ nóng và hương vị như mới nấu."',
      '"Thiết kế gọn nhẹ – dễ dàng mang theo, phù hợp cho bữa trưa tại văn phòng hay các chuyến đi chơi."',
      '"Dễ dàng vệ sinh – chất liệu chống dính, không bám mùi, dễ dàng làm sạch sau khi sử dụng."'
    ]
  },
  {
    image: '/nhipbep/mayxay.svg',
    label: 'Máy xay',
    fullName: 'Máy xay Tiger',
    benefits: [
      '"Xay nhuyễn mịn – công suất mạnh mẽ, xay được nhiều loại thực phẩm từ rau củ đến đá viên một cách dễ dàng."',
      '"An toàn và tiện lợi – thiết kế chống trượt, dễ sử dụng và vệ sinh, phù hợp cho mọi gia đình."',
      '"Bền bỉ và hiệu quả – động cơ mạnh mẽ, lưỡi dao sắc bén, đảm bảo hiệu suất làm việc lâu dài."'
    ]
  }
];

// Duplicate to have 9 products
const products: Product[] = [
  ...baseProducts,
  ...baseProducts,
  baseProducts[0] // Add one more to make 9 total
];

// Helper function to get background image for product card based on index
const getProductBackgroundImage = (index: number): string => {
  const backgroundIndex = (index % 4) + 1; // Cycle through 1, 2, 3, 4
  return `/nhipbep/card_product_background${backgroundIndex}.svg`;
};

export function NhipBepPageContent() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentProductSlide, setCurrentProductSlide] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const currentContent = slides[currentSlide];

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleProductHover = (product: Product) => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    // Set new timeout to open modal after 500ms
    const timeout = setTimeout(() => {
      setSelectedProduct(product);
    }, 500);
    setHoverTimeout(timeout);
  };

  const handleProductLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const nextProductSlide = () => {
    setCurrentProductSlide((prev) => (prev + 1) % products.length);
  };

  const prevProductSlide = () => {
    setCurrentProductSlide((prev) => (prev - 1 + products.length) % products.length);
  };

  const goToProductSlide = (index: number) => {
    setCurrentProductSlide(index);
  };

  // Auto-loop for products
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProductSlide((prev) => (prev + 1) % products.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="min-h-[calc(100vh-80px)] bg-white">
        {/* Image Container - Relative for absolute text positioning */}
        <div className="relative w-full min-h-[500px] md:min-h-0">
          <Image
            src={currentContent.image}
            alt="History Background"
            width={1920}
            height={1080}
            className="w-full h-[500px] md:h-auto object-cover md:object-cover"
            priority
          />

          {/* Text Content - Absolute, center bottom overlay */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4 pb-8 md:pb-12">
            <div className="text-center">
              {/* Dates */}
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white mb-3 md:mb-4">
                {currentContent.dates}
              </h2>

              {/* Subtitle */}
              <h3 className="text-lg md:text-xl lg:text-2xl font-serif text-white mb-2">
                {currentContent.subtitle}
              </h3>

              {/* Body Text */}
              <div className="text-white space-y-1 font-nunito leading-relaxed text-sm md:text-base lg:text-lg px-2">
                {currentContent.paragraphs.map((paragraph, index) => (
                  <p key={index}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center items-center gap-2 md:gap-3 mt-6 md:mt-8">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentSlide
                        ? 'w-2.5 h-2.5 md:w-3 md:h-3 bg-white'
                        : 'w-2 h-2 md:w-2 md:h-2 bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Background Section */}
        <div className="relative w-full min-h-[600px] md:min-h-[800px]">
          <Image
            src="/nhipbep/nhipbep_background.svg"
            alt="Nhip Bep Background"
            width={1920}
            height={1080}
            className="w-full h-auto object-cover min-h-[600px] md:min-h-[800px]"
          />

          {/* Text Content - Absolute, centered overlay */}
          <div className="absolute top-[38%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl px-4">
            <div className="text-center space-y-6">
              {/* Title */}
              <h2 className="text-4xl md:text-5xl font-prata" style={{ color: '#00579F' }}>
                Cột mốc thời gian
              </h2>

              {/* Body Text */}
              <div className="text-center max-w-3xl mx-auto">
                <p className="text-base md:text-lg text-gray-800 font-sans leading-relaxed">
                  &quot;“Từ chiếc bình giữ nhiệt đầu tiên năm 1923, Tiger đã không ngừng sáng tạo – để giữ ấm, giữ trọn, giữ nhịp sống qua từng sản phẩm.“Từ chiếc bình giữ nhiệt đầu tiên năm 1923, Tiger đã không ngừng sáng tạo – để giữ ấm, giữ trọn, giữ nhịp sống qua từng sản phẩm.&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Timeline Image - Absolute, bottom */}
          <div className="absolute bottom-0 left-0 w-full z-10">
            <TimelineInteractive />
          </div>
        </div>

        {/* Products Carousel Section */}
        <div 
          className="relative w-full py-16"
          style={{
            backgroundColor: '#00579F',
            backgroundImage: 'url(/nhipbep/nhipbep_products_background.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="max-w-7xl mx-auto px-4">
            {/* Header Section */}
            <div className="text-center mb-12 space-y-6">
              {/* Title */}
              <h2 className="text-4xl md:text-5xl font-prata text-white">
                Nhịp bếp
              </h2>

              {/* Description */}
              <div className="max-w-4xl mx-auto">
                <p className="text-white text-base md:text-lg font-nunito leading-relaxed mb-4">
                  Gian bếp là nơi nhịp sống được nuôi dưỡng. Ở đó, một mẹo nhỏ, một thói quen đơn giản có thể giữ nhịp cả ngày cho bạn. Tiger đồng hành với bạn trong từng nhịp ấy – bởi Tiger bắt đầu bằng công nghệ giữ nhiệt, rồi phát triển để giữ trọn hương vị, độ ẩm và sự an toàn.
                </p>

                {/* Quote */}
                <p className="text-white text-base md:text-lg font-nunito leading-relaxed italic">
                  &quot;Những nhịp nhỏ này giữ ta cân bằng mỗi ngày. Và đằng sau từng nhịp nhỏ ấy... luôn có một người bạn lặng lẽ đồng hành.&quot;
                </p>
              </div>
            </div>

            {/* Products Carousel */}
            <div className="relative">
              {/* Carousel Container */}
              <div className="relative overflow-hidden">
                <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentProductSlide * (100 / (isMobile ? 1 : 4))}%)` }}>
                  {/* Duplicate products for seamless infinite scroll */}
                  {[...products, ...products.slice(0, 4)].map((product, index) => {
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
                            onClick={() => setSelectedProduct(product)}
                            onMouseEnter={() => handleProductHover(product)}
                            onMouseLeave={handleProductLeave}
                          >
                            <div className="flex flex-col items-center justify-center space-y-2 md:space-y-4 relative z-10 flex-1">
                              {/* Product Image */}
                              <div className="relative w-full aspect-square max-w-[180px] md:max-w-xs transition-transform duration-300 group-hover:scale-110 flex-shrink-0">
                                <Image
                                  src={product.image}
                                  alt={product.label}
                                  fill
                                  className="object-contain"
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
                            className="w-full px-4 md:px-6 py-1.5 md:py-2 rounded-lg font-nunito font-semibold text-white transition-all duration-300 hover:opacity-90 text-sm md:text-base"
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid white',
                            }}
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
      </main>

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-[#00579F]/80 backdrop-blur-sm z-50"
              onClick={() => setSelectedProduct(null)}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none"
            >
              <div 
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto relative pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-3 right-3 p-2 rounded-full transition-colors hover:bg-gray-100 z-10"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5 text-[#00579F]" />
                </button>

                {/* Product Image Section */}
                <div className="relative px-6 pt-8 pb-4 flex justify-center items-center">
                  <div className="relative w-full max-w-[180px] aspect-square">
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.label}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Product Title */}
                <div className="px-6 pb-4">
                  <h2 
                    className="text-center font-prata text-2xl md:text-3xl"
                    style={{ color: '#00579F' }}
                  >
                    {selectedProduct.fullName}
                  </h2>
                </div>

                {/* Product Benefits */}
                <div className="px-6 pb-6 space-y-3">
                  {selectedProduct.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-4">
                      {/* Check Circle Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        <Image
                          src="/icons/check_circle.png"
                          alt="Check"
                          width={20}
                          height={20}
                          className="object-contain"
                        />
                      </div>
                      {/* Benefit Text */}
                      <p 
                        className="flex-1 font-nunito text-sm leading-relaxed"
                        style={{ color: '#00579F' }}
                      >
                        {benefit}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Mua ngay Button */}
                <div className="px-6 pb-6">
                  <button
                    className="w-full py-2.5 rounded-lg font-nunito font-semibold text-white transition-all duration-300 hover:opacity-90"
                    style={{
                      backgroundColor: '#00579F',
                      fontSize: '15px',
                    }}
                    onClick={() => {
                      // Handle buy now action
                      console.log('Mua ngay:', selectedProduct.label);
                    }}
                  >
                    Mua ngay
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

