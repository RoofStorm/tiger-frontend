'use client';

import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { THE_LE_SECTIONS, THE_LE_DISCLAIMER } from '@/constants/doiQuaContent';

interface TheLeTabProps {
  onNavigateToDoiQua: () => void;
  onNavigateToChallenge: () => void;
}

export function TheLeTab({ onNavigateToDoiQua, onNavigateToChallenge }: TheLeTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-16 max-w-4xl mx-auto gap-2"
    >
      {/* Title */}
      <div className="text-center mb-8">
        <h2 
          className="font-prata mb-4"
          style={{ 
            color: '#00579F',
            fontFamily: 'Prata',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: '36px',
            lineHeight: '40px',
            letterSpacing: '0.03em',
            textAlign: 'center',
          }}
        >
          Thể lệ
        </h2>
        
        {/* Subtitle with leaf icon */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Leaf className="w-5 h-5" style={{ color: '#22c55e' }} />
          <p 
            className="font-noto-sans"
            style={{
              fontFamily: 'var(--font-noto-sans)',
              fontSize: '18px',
              fontWeight: 400,
              color: '#333',
              textAlign: 'center',
            }}
          >
            Cơ chế &quot;Điểm năng lượng&quot;
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-8 text-left">
        {THE_LE_SECTIONS.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: (sectionIndex + 1) * 0.1 }}
            className="bg-transparent"
          >
            <h3 
              className="font-prata mb-4"
              style={{
                fontFamily: 'Prata',
                fontWeight: 400,
                fontSize: '24px',
                color: '#00579F',
                marginBottom: '16px',
              }}
            >
              {section.title}
            </h3>
            {section.description && (
              <p 
                className="font-noto-sans mb-4"
                style={{
                  fontFamily: 'var(--font-noto-sans)',
                  fontSize: '16px',
                  color: '#333',
                  marginBottom: '16px',
                }}
              >
                {section.description}
              </p>
            )}
            <ul className="space-y-3">
              {section.bullets.map((bullet, bulletIndex) => {
                // Extract points value if present (e.g., "+10 điểm", "+200 điểm", "600 điểm năng lượng")
                const pointsMatch = bullet.match(/(\+?\d+)\s*điểm/i);
                const bulletText = pointsMatch 
                  ? bullet.replace(/(\+?\d+)\s*điểm/i, (match) => `<strong>${match}</strong>`)
                  : bullet;

                return (
                  <li key={bulletIndex} className="flex items-start gap-3">
                    <span className="text-[#00579F] font-bold mt-1">•</span>
                    {/* SAFE: content is static and controlled in constants file (doiQuaContent.ts) */}
                    {/* ⚠️ WARNING: Do NOT use dangerouslySetInnerHTML with user-generated or dynamic content */}
                    <span 
                      className="font-noto-sans" 
                      style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}
                      dangerouslySetInnerHTML={{ __html: bulletText }}
                    />
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
      >
        <button
          onClick={onNavigateToDoiQua}
          className="px-8 py-3 rounded-lg font-nunito font-semibold transition-all duration-300 bg-transparent border-2 border-[#00579F] text-[#00579F] hover:bg-[#00579F] hover:text-white"
          style={{
            fontFamily: 'var(--font-nunito)',
            fontSize: '16px',
          }}
        >
          Đổi quà ngay
        </button>
        <button
          onClick={onNavigateToChallenge}
          className="px-8 py-3 rounded-lg font-nunito font-semibold transition-all duration-300 bg-[#00579F] text-white hover:bg-[#284A8F]"
          style={{
            fontFamily: 'var(--font-nunito)',
            fontSize: '16px',
          }}
        >
          Thử thách ngay để nhận quà
        </button>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p 
          className="font-noto-sans"
          style={{
            fontFamily: 'var(--font-noto-sans)',
            fontSize: '14px',
            color: '#60A5FA',
            fontStyle: 'italic',
          }}
        >
          {/* {THE_LE_DISCLAIMER} */}
        </p>
      </motion.div>
    </motion.div>
  );
}

