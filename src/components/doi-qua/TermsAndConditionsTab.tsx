'use client';

import { motion } from 'framer-motion';
import { TERMS_AND_CONDITIONS_SECTIONS, TERMS_AND_CONDITIONS_INTRO } from '@/constants/doiQuaContent';

export function TermsAndConditionsTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-16 max-w-4xl mx-auto"
    >
      {/* Title */}
      <div className="text-center mb-8">
        <h2 
          className="font-prata mb-8"
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
          Điều khoản sử dụng
        </h2>
      </div>

      {/* Intro */}
      <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-10 rounded-r-lg text-left">
        <p className="text-gray-800 leading-relaxed font-medium font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px' }}>
          {TERMS_AND_CONDITIONS_INTRO.welcome}
        </p>
        <p className="text-gray-700 leading-relaxed mt-4 font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px' }}>
          {TERMS_AND_CONDITIONS_INTRO.commitment}
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-10 text-left">
        {TERMS_AND_CONDITIONS_SECTIONS.map((section) => (
          <section key={section.title}>
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
            <div className="pl-6 space-y-4">
              {section.content.map((item, itemIndex) => {
                if (item.type === 'paragraph') {
                  return (
                    <p key={itemIndex} className="font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                      {item.text}
                    </p>
                  );
                }

                if (item.type === 'subtitle') {
                  return (
                    <h4 key={itemIndex} className="font-bold text-[#00579F] mb-3 font-noto-sans" style={{ fontSize: '18px' }}>
                      {item.text}
                    </h4>
                  );
                }

                if (item.type === 'list') {
                  return (
                    <ul key={itemIndex} className="space-y-3">
                      {item.items.map((listItem, listIndex) => {
                        const hasLink = 'link' in listItem && 'linkText' in listItem && listItem.link && listItem.linkText;
                        return (
                          <li key={listIndex} className="flex items-start gap-3 font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                            <span className="text-[#00579F] font-bold mt-1">{listItem.label}</span>
                            <span>
                              {hasLink ? (
                                <>
                                  {listItem.text}
                                  <a 
                                    href={listItem.link} 
                                    className="text-[#00579F] font-semibold hover:underline"
                                  >
                                    {listItem.linkText}
                                  </a>
                                </>
                              ) : (
                                listItem.text
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  );
                }

                if (item.type === 'note') {
                  return (
                    <p key={itemIndex} className="italic text-gray-600 bg-gray-100/50 p-4 border-l-2 border-gray-300 font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '15px' }}>
                      {item.text}
                    </p>
                  );
                }

                if (item.type === 'contactBox') {
                  return (
                    <div key={itemIndex} className="bg-white/50 p-6 rounded-xl border border-gray-200 ml-6">
                      <p className="font-bold text-gray-900 mb-1 font-noto-sans">{item.department}</p>
                      <p className="font-bold text-gray-900 mb-3 font-noto-sans">{item.company}</p>
                      <p className="mb-2 font-noto-sans text-gray-700">{item.address}</p>
                      <p className="font-noto-sans text-gray-700">Điện thoại: {item.phone}</p>
                      <p className="font-noto-sans text-gray-700">
                        Email: <a href={`mailto:${item.email}`} className="text-[#00579F] font-semibold hover:underline">{item.email}</a>
                      </p>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </section>
        ))}
      </div>
    </motion.div>
  );
}

