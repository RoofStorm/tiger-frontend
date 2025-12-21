'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const footerLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-nunito), Nunito, sans-serif',
  fontWeight: 400,
  fontSize: '16px',
  lineHeight: '24px',
  letterSpacing: '0%',
  color: '#DCDCDC',
};

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <Link 
      href={href} 
      className="hover:text-white transition-colors"
      style={footerLinkStyle}
    >
      {children}
    </Link>
  );
}

interface FooterSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

function FooterSection({ title, children, isOpen, onToggle, isLast = false }: FooterSectionProps) {
  return (
    <div className={`text-center md:text-left pb-4 md:pb-0 ${isLast ? 'pb-0' : ''}`}>
      {/* Mobile: Button with dropdown */}
      <button
        onClick={onToggle}
        className="md:hidden w-full flex items-center justify-center font-bold text-white py-3 relative"
      >
        <span>{title}</span>
        <ChevronDown
          className={`absolute right-0 w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      {/* Desktop: Static heading */}
      <h3 className="hidden md:block font-bold text-white mb-4">{title}</h3>
      
      {/* Mobile: Collapsible content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Desktop: Always visible content */}
      <div className="hidden md:block">{children}</div>
    </div>
  );
}

export function Footer() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'thong-tin-san-pham': false,
    'kham-pha-tan-huong': false,
    've-chung-toi': false,
    'tin-tuc': false,
    'ho-tro-khach-hang': false,
    'kinh-doanh': false,
    'noi-de-mua': false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <footer className="text-white" style={{ backgroundColor: '#48494A' }}>
      <div className="container mx-auto px-4 py-12">
        {/* Upper Section - Text Links */}
        <div className="flex flex-col md:flex-row md:justify-between md:gap-8 mb-8">
          {/* Column 1: Thông tin sản phẩm & Khám phá & Tận hưởng */}
          <div className="md:space-y-6">
            <FooterSection
              title="Thông tin sản phẩm"
              isOpen={openSections['thong-tin-san-pham']}
              onToggle={() => toggleSection('thong-tin-san-pham')}
            >
              <ul className="space-y-4 text-center md:text-left">
                <li><FooterLink href="#">Câu chuyện sản phẩm</FooterLink></li>
                <li><FooterLink href="#">Danh sách sản phẩm / Tìm kiếm</FooterLink></li>
                <li><FooterLink href="#">Sản phẩm ngưng sản xuất</FooterLink></li>
                <li><FooterLink href="#">Danh mục</FooterLink></li>
              </ul>
            </FooterSection>
            <FooterSection
              title="Khám phá & Tận hưởng"
              isOpen={openSections['kham-pha-tan-huong']}
              onToggle={() => toggleSection('kham-pha-tan-huong')}
            >
              <ul className="space-y-4 text-center md:text-left">
                <li><FooterLink href="#">Nội dung đặc biệt</FooterLink></li>
                <li><FooterLink href="#">Video</FooterLink></li>
                <li><FooterLink href="#">Công thức nấu ăn</FooterLink></li>
              </ul>
            </FooterSection>
          </div>

          {/* Column 2: Về chúng tôi */}
          <div>
            <FooterSection
              title="Về chúng tôi"
              isOpen={openSections['ve-chung-toi']}
              onToggle={() => toggleSection('ve-chung-toi')}
            >
              <ul className="space-y-4 text-center md:text-left">
                <li><FooterLink href="#">Công nghệ</FooterLink></li>
                <li><FooterLink href="#">Lịch sử</FooterLink></li>
                <li><FooterLink href="#">Lịch sử 100 năm</FooterLink></li>
                <li><FooterLink href="#">Tính bền vững</FooterLink></li>
                <li><FooterLink href="#">Giải thưởng</FooterLink></li>
                <li><FooterLink href="#">Thông tin công ty</FooterLink></li>
                <li><FooterLink href="#">Mạng lưới toàn cầu</FooterLink></li>
              </ul>
            </FooterSection>
          </div>

          {/* Column 3: Tin tức & Hỗ trợ Khách hàng */}
          <div className="md:space-y-6">
            <FooterSection
              title="Tin tức"
              isOpen={openSections['tin-tuc']}
              onToggle={() => toggleSection('tin-tuc')}
            >
              <ul className="space-y-4 text-center md:text-left">
                <li><FooterLink href="#">Sản phẩm mới nhất</FooterLink></li>
              </ul>
            </FooterSection>
            <FooterSection
              title="Hỗ trợ Khách hàng"
              isOpen={openSections['ho-tro-khach-hang']}
              onToggle={() => toggleSection('ho-tro-khach-hang')}
            >
              <ul className="space-y-4 text-center md:text-left">
                <li><FooterLink href="#">FAQ</FooterLink></li>
                <li><FooterLink href="#">Cẩm nang hướng dẫn</FooterLink></li>
                <li><FooterLink href="#">Liên hệ với chúng tôi</FooterLink></li>
              </ul>
            </FooterSection>
          </div>

          {/* Column 4: Kinh doanh */}
          <div>
            <FooterSection
              title="Kinh doanh"
              isOpen={openSections['kinh-doanh']}
              onToggle={() => toggleSection('kinh-doanh')}
            >
              <div></div>
            </FooterSection>
            <FooterSection
              title="Nơi để mua"
              isOpen={openSections['noi-de-mua']}
              onToggle={() => toggleSection('noi-de-mua')}
              isLast={true}
            >
              <div></div>
            </FooterSection>
          </div>
        </div>

        {/* Separator Line */}
        <div className="w-full h-px bg-gray-600 mb-8" />

        {/* Lower Section - Social Media Icons */}
        <div className="flex justify-center items-center gap-6">
          <Link
            href="#"
            className="hover:opacity-80 transition-opacity"
            aria-label="Facebook"
          >
            <Image
              src="/icons/facebook_logo.svg"
              alt="Facebook"
              width={48}
              height={48}
              className="w-12 h-12"
            />
          </Link>
          <Link
            href="#"
            className="hover:opacity-80 transition-opacity"
            aria-label="Instagram"
          >
            <Image
              src="/icons/insta_logo.svg"
              alt="Instagram"
              width={48}
              height={48}
              className="w-12 h-12"
            />
          </Link>
          <Link
            href="#"
            className="hover:opacity-80 transition-opacity"
            aria-label="YouTube"
          >
            <Image
              src="/icons/youtube_logo.svg"
              alt="YouTube"
              width={48}
              height={48}
              className="w-12 h-12"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}

