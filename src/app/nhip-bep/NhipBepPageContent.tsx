'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import Image from 'next/image';
import { TimelineInteractive } from '@/components/TimelineInteractive/TimelineInteractive';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    image: '/nhipbep/history1_background.png'
  },
  // Add more slides as needed
  {
    dates: '1968 - 1980',
    subtitle: 'Expansion and Innovation',
    paragraphs: [
      "During this period, the company expanded its product line and continued to innovate in vacuum bottle technology.",
      "New manufacturing processes were developed, and the company began to establish itself as a leader in thermal insulation products."
    ],
    image: '/nhipbep/history1_background.png'
  },
  {
    dates: '1981 - 2000',
    subtitle: 'Global Reach',
    paragraphs: [
      "The company expanded globally, bringing its innovative vacuum bottle technology to markets around the world.",
      "This era marked significant growth in both product diversity and international presence."
    ],
    image: '/nhipbep/history1_background.png'
  }
];

interface Product {
  image: string;
  label: string;
}

const baseProducts: Product[] = [
  {
    image: '/nhipbep/noicom.png',
    label: 'Nồi cơm điện'
  },
  {
    image: '/nhipbep/binhgiunhiet.png',
    label: 'Bình giữ nhiệt'
  },
  {
    image: '/nhipbep/hopcom.png',
    label: 'Hộp cơm'
  },
  {
    image: '/nhipbep/mayxay.png',
    label: 'Máy xay'
  }
];

// Duplicate to have 9 products
const products: Product[] = [
  ...baseProducts,
  ...baseProducts,
  baseProducts[0] // Add one more to make 9 total
];

export function NhipBepPageContent() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentProductSlide, setCurrentProductSlide] = useState(0);
  const currentContent = slides[currentSlide];

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

  return (
    <div className="min-h-screen">
      <Header />
      <main className="min-h-[calc(100vh-80px)] bg-white">
        {/* Image Container - Relative for absolute text positioning */}
        <div className="relative w-full">
          <Image
            src={currentContent.image}
            alt="History Background"
            width={1920}
            height={1080}
            className="w-full h-auto object-cover"
            priority
          />

          {/* Text Content - Absolute, center bottom overlay */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4 pb-12">
            <div className="text-center">
              {/* Dates */}
              <h2 className="text-5xl md:text-6xl font-serif text-white mb-4">
                {currentContent.dates}
              </h2>

              {/* Subtitle */}
              <h3 className="text-xl md:text-2xl font-serif text-white mb-2">
                {currentContent.subtitle}
              </h3>

              {/* Body Text */}
              <div className="text-white space-y-1 font-nunito leading-relaxed" style={{ fontSize: '18px' }}>
                {currentContent.paragraphs.map((paragraph, index) => (
                  <p key={index}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center items-center gap-3 mt-8">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentSlide
                        ? 'w-3 h-3 bg-white'
                        : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Background Section */}
        <div className="relative w-full">
          <Image
            src="/nhipbep/nhipbep_background.png"
            alt="Nhip Bep Background"
            width={1920}
            height={1080}
            className="w-full h-auto object-cover"
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
          <div className="absolute bottom-0 left-0 w-full">
            <TimelineInteractive />
          </div>
        </div>

        {/* Products Carousel Section */}
        <div className="relative w-full py-16" style={{ backgroundColor: '#00579F' }}>
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
                <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentProductSlide * (100 / 4)}%)` }}>
                  {/* Duplicate products for seamless infinite scroll */}
                  {[...products, ...products.slice(0, 4)].map((product, index) => (
                    <div
                      key={index}
                      className="min-w-[25%] flex-shrink-0 px-4"
                    >
                      <div className="flex justify-center">
                        <div className="bg-[#FFFDF5] rounded-lg p-8 w-full transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:bg-white group">
                          <div className="flex flex-col items-center space-y-4">
                            {/* Product Image */}
                            <div className="relative w-full aspect-square max-w-xs transition-transform duration-300 group-hover:scale-110">
                              <Image
                                src={product.image}
                                alt={product.label}
                                fill
                                className="object-contain"
                              />
                            </div>

                            {/* Product Label */}
                            <h3 className="text-xl font-nunito font-medium text-gray-800 transition-colors duration-300 group-hover:text-[#00579F]">
                              {product.label}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
    </div>
  );
}

