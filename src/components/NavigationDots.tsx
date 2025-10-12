'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NavigationDotsProps {
  currentSection: number;
  onSectionChange: (section: number) => void;
}

export function NavigationDots({
  currentSection,
  onSectionChange,
}: NavigationDotsProps) {
  const [isVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-corner]');
      let current = 0;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (
          rect.top <= window.innerHeight / 2 &&
          rect.bottom >= window.innerHeight / 2
        ) {
          current = index;
        }
      });

      onSectionChange(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [onSectionChange]);

  const scrollToSection = (sectionIndex: number) => {
    const section = document.querySelector(`[data-corner="${sectionIndex}"]`);
    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const cornerLabels = [
    'Video',
    'Mood',
    'Products',
    'Gallery',
    'Cards',
    'Rewards',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 50 }}
      transition={{ duration: 0.3 }}
      className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50"
    >
      <div className="flex flex-col items-center space-y-4">
        {[0, 1, 2, 3, 4, 5].map(index => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="relative group cursor-pointer"
            onClick={() => scrollToSection(index)}
          >
            {/* Dot - Màu xanh dương đậm */}
            <div
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                currentSection === index
                  ? 'bg-blue-800 shadow-lg scale-125 ring-2 ring-blue-300'
                  : 'bg-blue-600 hover:bg-blue-700 hover:scale-110'
              }`}
            />

            {/* Label Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none"
            >
              <div className="bg-blue-800 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
                {cornerLabels[index]}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
