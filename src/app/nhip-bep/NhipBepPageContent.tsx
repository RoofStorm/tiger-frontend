'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    dates: '1923 – 1959',
    subtitle: 'Khởi đầu và Chứng nhận',
    paragraphs: [
      'Tiger bắt đầu sản xuất và kinh doanh bình chân không tại Nhật Bản.',
      'Trở thành nhà máy đầu tiên trong ngành được MITI (nay là METI) chứng nhận đạt chuẩn JIS.'
    ],
    image: '/nhipbep/history_1923_1959_background.jpg'
  },
  {
    dates: '1960 – 1970',
    subtitle: 'Mở rộng và Phát triển',
    paragraphs: [
      'Kỷ niệm 45 năm thành lập, ông Takenori Kikuchi được bổ nhiệm làm Chủ tịch HĐQT, ông Yoshito Kikuchi giữ vai trò Chủ tịch Điều hành.',
      'Thành lập Tiger Bussan Co., Ltd. tại Hiroshima.',
      'Hoàn thành mở rộng Trụ sở chính (Tòa nhà thứ ba).'
    ],
    image: '/nhipbep/history_1960_1970_background.jpg'
  },
  {
    dates: '1980 – 1999',
    subtitle: 'Đổi mới và Tái cấu trúc',
    paragraphs: [
      'Ra mắt ấm đun nước điện "Wakitate" đầu tiên.',
      'Kỷ niệm 60 năm thành lập và chính thức đổi tên thành Tiger Corporation.',
      'Hoàn thành Trung tâm Bình chân không Kadoma và xây dựng nhà xưởng đúc.'
    ],
    image: '/nhipbep/history_1980_1999_background.jpg'
  },
  {
    dates: '2000 – 2019',
    subtitle: 'Chứng nhận Quốc tế và Mở rộng',
    paragraphs: [
      'Trụ sở chính đạt chứng nhận ISO 9001.',
      'Thành lập Công ty TNHH TIGER Việt Nam.',
      'Tiger Corporation nhận Giải thưởng Bộ trưởng Bộ Giáo dục, Văn hóa, Thể thao, Khoa học & Công nghệ Nhật Bản tại Giải thưởng Công nghệ Công nghiệp Nhật Bản lần thứ 48.'
    ],
    image: '/nhipbep/history_2000_2019_background.jpg'
  },
  {
    dates: '2020 – Nay',
    subtitle: '100 Năm Thành tựu',
    paragraphs: [
      'Thành lập Công ty TNHH TIGER MARKETING Việt Nam.',
      'Tập đoàn Tiger kỷ niệm 100 năm hoạt động, khẳng định vị thế thương hiệu gia dụng hàng đầu Nhật Bản.'
    ],
    image: '/nhipbep/history_2020_nay_background.jpg'
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
    image: '/nhipbep/noicom.png',
    label: 'Nồi cơm điện',
    fullName: 'Nồi cơm điện Tiger',
    benefits: [
      '"Xới cơm ngay khi cơm vừa chín – hạt tơi, không khô cả ngày. Với nồi Tiger, hạt cơm được giữ ấm đều, thơm như mới nấu."',
      '"Cho vài giọt dầu ăn vào gạo – cơm bóng và tơi hơn. Nồi Tiger giữ trọn hương thơm và độ dẻo."',
      '"Nấu cháo nhanh bằng nước sôi – chỉ 30 phút đã nhừ. Công nghệ kiểm soát nhiệt Tiger giúp hạt gạo bung đều, không khê."'
    ]
  },
  {
    image: '/nhipbep/binhgiunhiet.png',
    label: 'Bình giữ nhiệt',
    fullName: 'Bình giữ nhiệt Tiger',
    benefits: [
      '"Giữ nhiệt độ lâu dài – đồ uống nóng vẫn nóng, đồ lạnh vẫn lạnh suốt nhiều giờ. Công nghệ chân không của Tiger đảm bảo nhiệt độ được bảo toàn tối đa."',
      '"Thiết kế tiện lợi – dễ dàng mang theo mọi nơi, phù hợp cho công việc, du lịch hay hoạt động ngoài trời."',
      '"An toàn và bền bỉ – chất liệu cao cấp, không chứa chất độc hại, đảm bảo sức khỏe cho người sử dụng."'
    ]
  },
  {
    image: '/nhipbep/hopcom.png',
    label: 'Hộp cơm',
    fullName: 'Hộp cơm Tiger',
    benefits: [
      '"Giữ thức ăn nóng lâu – công nghệ cách nhiệt hiện đại giúp thức ăn giữ được độ nóng và hương vị như mới nấu."',
      '"Thiết kế gọn nhẹ – dễ dàng mang theo, phù hợp cho bữa trưa tại văn phòng hay các chuyến đi chơi."',
      '"Dễ dàng vệ sinh – chất liệu chống dính, không bám mùi, dễ dàng làm sạch sau khi sử dụng."'
    ]
  },
  {
    image: '/nhipbep/mayxay.png',
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
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [currentProductSlide, setCurrentProductSlide] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
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

  useEffect(() => {
  // Preload all product images on mount for faster modal loading
    const uniqueProductImages = Array.from(new Set(baseProducts.map(p => p.image)));
    uniqueProductImages.forEach(imageSrc => {
      const img = new window.Image();
      img.src = imageSrc;
    });

     // Preload all slide images on mount for faster slide transitions
     slides.forEach(slide => {
      const img = new window.Image();
      img.src = slide.image;
    });
  }, []);

  const handleProductHover = (product: Product, index: number) => {
    // Preload product image immediately when hovering
    const img = new window.Image();
    img.src = product.image;
    
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    // Set new timeout to open modal after 500ms
    const timeout = setTimeout(() => {
      setSelectedProduct(product);
      setSelectedProductIndex(index);
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

  // Auto-loop for history slides
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setSlideDirection('right');
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, []);

  // Functions to handle slide navigation with direction
  const goToSlide = (index: number) => {
    if (index > currentSlide) {
      setSlideDirection('right');
    } else if (index < currentSlide) {
      setSlideDirection('left');
    }
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setSlideDirection('right');
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setSlideDirection('left');
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

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
      <main className="min-h-[calc(100vh-80px)] bg-white mt-[64px] md:mt-[80px]">
        {/* Image Container - Relative for absolute text positioning */}
        <div className="relative w-full min-h-[500px] md:min-h-0 max-h-[600px] md:max-h-[700px] overflow-hidden">
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
                priority
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
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white mb-3 md:mb-4">
                  {currentContent.dates}
                </h2>

                {/* Subtitle */}
                <h3 className="text-lg md:text-xl lg:text-2xl font-serif text-white mb-2">
                  {currentContent.subtitle}
                </h3>

                {/* Body Text */}
                <div className="text-white space-y-1 font-nunito px-2">
                  {currentContent.paragraphs.map((paragraph, index) => (
                    <p 
                      key={index}
                      className="text-center"
                      style={{
                        fontFamily: 'Nunito',
                        fontWeight: 400,
                        fontStyle: 'normal',
                        fontSize: '18px',
                        lineHeight: '24px',
                        letterSpacing: '0%',
                        textAlign: 'center'
                      }}
                    >
                      {paragraph}
                    </p>
                  ))}
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
            className="w-full h-auto object-cover min-h-[300px] md:min-h-[800px]"
           
          />

          {/* Text Content - Absolute, centered overlay */}
          <div className="absolute top-[15%] md:top-[38%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl px-4">
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

          {/* Timeline Image - Relative on mobile, absolute on desktop */}
          <div className="relative md:absolute md:bottom-[20px] left-0 w-full z-10">
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
              <div className="max-w-6xl mx-auto">
                <p 
                  className="mb-4"
                  style={{
                    fontFamily: 'Nunito',
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '16px',
                    lineHeight: '24px',
                    letterSpacing: '0',
                    textAlign: 'center',
                    color: '#FFFFFF'
                  }}
                >
                  Gian bếp là nơi nhịp sống được nuôi dưỡng. Ở đó, một mẹo nhỏ, một thói quen đơn giản có thể giữ nhịp cả ngày cho bạn. Tiger đồng hành với bạn trong từng nhịp ấy – bởi Tiger bắt đầu bằng công nghệ giữ nhiệt, rồi phát triển để giữ trọn hương vị, độ ẩm và sự an toàn.
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
                            onClick={() => {
                              setSelectedProduct(product);
                              setSelectedProductIndex(actualIndex);
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
        {selectedProduct && selectedProductIndex !== null && (() => {
          // Use the saved index to determine background
          const backgroundIndex = (selectedProductIndex % 4) + 1; // Cycle through 1, 2, 3, 4
          const modalBackground = `/nhipbep/card_flipped_${backgroundIndex}.svg`;
          
          return (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-[#00579F]/80 backdrop-blur-sm z-50"
                onClick={() => {
                  setSelectedProduct(null);
                  setSelectedProductIndex(null);
                }}
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
                  style={{ 
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden'
                  }}
                  className="pointer-events-auto"
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
                      onClick={() => {
                        setSelectedProduct(null);
                        setSelectedProductIndex(null);
                      }}
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
                      <div className="relative px-6 pt-8 pb-4 flex justify-center items-center">
                        <motion.div 
                          className="relative w-full max-w-[180px] aspect-square"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 1.3, duration: 0.5, ease: 'easeOut' }}
                        >
                          <Image
                            src={selectedProduct.image}
                            alt={selectedProduct.label}
                            fill
                            className="object-contain"
                            priority
                            sizes="(max-width: 768px) 180px, 180px"
                          />
                        </motion.div>
                      </div>

                      {/* Product Title */}
                      <div className="px-6 pb-2">
                        <motion.h2 
                          className="text-center font-prata text-2xl md:text-3xl"
                          style={{ color: '#00579F' }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.4, duration: 0.5, ease: 'easeOut' }}
                        >
                          {selectedProduct.fullName}
                        </motion.h2>
                      </div>
                    </motion.div>

                    {/* Bottom Section - Benefits and Button */}
                    <motion.div 
                      className="flex-shrink-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5, duration: 0.6, ease: 'easeOut' }}
                    >
                      {/* Product Benefits */}
                      <div className="px-6 pt-2 pb-4 space-y-3">
                        {selectedProduct.benefits.map((benefit, index) => (
                          <motion.div 
                            key={index} 
                            className="flex items-start gap-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ 
                              delay: 1.6 + index * 0.1, 
                              duration: 0.5, 
                              ease: 'easeOut' 
                            }}
                          >
                            {/* Check Circle Icon */}
                            <div className="flex-shrink-0 mt-0.5">
                              <Image
                                src="/icons/check_circle.svg"
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
                          </motion.div>
                        ))}
                      </div>

                      {/* Mua ngay Button */}
                      <div className="px-6 pb-6 pt-2">
                        <motion.button
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.9, duration: 0.5, ease: 'easeOut' }}
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
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

