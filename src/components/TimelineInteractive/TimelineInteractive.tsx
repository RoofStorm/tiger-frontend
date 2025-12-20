'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface TimelineProduct {
  id: string;
  dates: string;
  description: string;
  position: {
    left: string;
    top: string;
    width: string;
  };
}

const timelineProducts: TimelineProduct[] = [
  {
    id: '1',
    dates: '1923 - 1952',
    description: 'An Large Variety of Vacuum Bottles',
    position: {
      left: '76%',
      top: '3%',
      width: '11%',
    },
  },
  {
    id: '2',
    dates: '1953 - 1967',
    description: 'An Large Variety of Vacuum Bottles',
    position: {
      left: '60%',
      top: '18%',
      width: '11%',
    },
  },
  {
    id: '3',
    dates: '1968 - 1998',
    description: 'An Large Variety of Vacuum Bottles',
    position: {
      left: '45%',
      top: '3%',
      width: '11%',
    },
  },
  {
    id: '4',
    dates: '1999 - 2022',
    description: 'An Large Variety of Vacuum Bottles',
    position: {
      left: '26%',
      top: '16%',
      width: '11%',
    },
  },
  {
    id: '5',
    dates: '2023 - Now',
    description: 'An Large Variety of Vacuum Bottles',
    position: {
      left: '8%',
      top: '28%',
      width: '11%',
    },
  },
];

export function TimelineInteractive() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const hoverRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (hoveredProduct && hoverRefs.current[hoveredProduct]) {
      const updatePosition = () => {
        const rect = hoverRefs.current[hoveredProduct]!.getBoundingClientRect();
        setTooltipPosition({
          top: rect.top - 8,
          left: rect.left + rect.width / 2,
        });
      };
      
      updatePosition();
      
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [hoveredProduct]);

  const currentProduct = hoveredProduct
    ? timelineProducts.find((p) => p.id === hoveredProduct)
    : null;

  return (
    <div className="relative w-full">
      <Image
        src="/nhipbep/timeline.svg"
        alt="Timeline"
        width={1920}
        height={400}
        className="w-full h-auto object-cover"
      />

      {/* Timeline Product Hover Areas */}
      {timelineProducts.map((product) => (
        <div
          key={product.id}
          ref={(el) => {
            hoverRefs.current[product.id] = el;
          }}
          className="absolute rounded-full cursor-pointer transition-all duration-300"
          style={{
            left: product.position.left,
            top: product.position.top,
            width: product.position.width,
            paddingBottom: product.position.width,
            backgroundColor: 'transparent',
          }}
          onMouseEnter={() => setHoveredProduct(product.id)}
          onMouseLeave={() => setHoveredProduct(null)}
        />
      ))}

      {/* Tooltip */}
      {hoveredProduct && currentProduct && tooltipPosition.top > 0 && (
        <div
          className="fixed z-[9999] px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translateX(-50%) translateY(-100%)',
            minWidth: '200px',
          }}
        >
          <div className="font-semibold mb-1">{currentProduct.dates}</div>
          <div>{currentProduct.description}</div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
}

