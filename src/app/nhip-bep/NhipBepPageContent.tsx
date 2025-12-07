'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import Image from 'next/image';
import { TimelineInteractive } from '@/components/TimelineInteractive/TimelineInteractive';

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

export function NhipBepPageContent() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const currentContent = slides[currentSlide];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-20">
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
      </main>
    </div>
  );
}

