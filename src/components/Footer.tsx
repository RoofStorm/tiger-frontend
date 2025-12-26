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
  const isExternal = href.startsWith('http://') || href.startsWith('https://');
  
  if (isExternal) {
    return (
      <a 
        href={href} 
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-white transition-colors"
        style={footerLinkStyle}
      >
        {children}
      </a>
    );
  }
  
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
  titleLink?: string;
}

function FooterSection({ title, children, isOpen, onToggle, isLast = false, titleLink }: FooterSectionProps) {
  const handleTitleClick = (e: React.MouseEvent) => {
    if (titleLink) {
      e.preventDefault();
      window.open(titleLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleMobileClick = () => {
    // On mobile, only toggle section, don't open link
    onToggle();
  };

  const titleElement = titleLink ? (
    <a
      href={titleLink}
      onClick={handleTitleClick}
      className="font-bold text-white mb-4 hover:underline cursor-pointer block"
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none' }}
    >
      {title}
    </a>
  ) : (
    <h3 className="font-bold text-white mb-4">{title}</h3>
  );

  return (
    <div className={`text-center md:text-left pb-4 md:pb-0 ${isLast ? 'pb-0' : ''}`}>
      {/* Mobile: Button with dropdown */}
      <button
        onClick={handleMobileClick}
        className="md:hidden w-full flex items-center justify-center font-bold text-white py-3 relative"
      >
        <span>{title}</span>
        <ChevronDown
          className={`absolute right-0 w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      {/* Desktop: Static heading */}
      <div className="hidden md:block">{titleElement}</div>
      
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
              titleLink="https://www.tiger-corporation.com/vi/vnm/product/story/"
              isOpen={openSections['thong-tin-san-pham']}
              onToggle={() => toggleSection('thong-tin-san-pham')}
            >
              <ul className="space-y-4 text-center md:text-left">
                <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/product/story/">Câu chuyện sản phẩm</FooterLink></li>
                <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/product/list/">Danh sách sản phẩm / Tìm kiếm</FooterLink></li>
                <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/product/list/discontinued/">Sản phẩm ngưng sản xuất</FooterLink></li>
                <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/product/catalog/">Danh mục</FooterLink></li>
              </ul>
            </FooterSection>
            <FooterSection
              title="Khám phá & Tận hưởng"
              titleLink="https://www.tiger-corporation.com/vi/vnm/feature/"
              isOpen={openSections['kham-pha-tan-huong']}
              onToggle={() => toggleSection('kham-pha-tan-huong')}
            >
              <ul className="space-y-4 text-center md:text-left">
                <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/feature/special-content/">Nội dung đặc biệt</FooterLink></li>
                <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/feature/movie/">Video</FooterLink></li>
                <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/feature/recipe/">Công thức nấu ăn</FooterLink></li>
              </ul>
            </FooterSection>
          </div>

          {/* Column 2: Về chúng tôi */}
          <div>
            <FooterSection
              title="Về chúng tôi"
              titleLink="https://www.tiger-corporation.com/vi/vnm/about-us/"
              isOpen={openSections['ve-chung-toi']}
              onToggle={() => toggleSection('ve-chung-toi')}
            >
              <ul className="space-y-4 text-center md:text-left">
                <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/about-us/technology/">Công nghệ</FooterLink></li>
                <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/about-us/history/">Lịch sử</FooterLink></li>
                <li><FooterLink href="https://www.tiger-corporation.com/en/vnm/feature/100th-history/">Lịch sử 100 năm</FooterLink></li>
                <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/about-us/sustainability/">Tính bền vững</FooterLink></li>
                <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/about-us/awards/">Giải thưởng</FooterLink></li>
                <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/about-us/company/">Thông tin công ty</FooterLink></li>
                <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/about-us/company/global-network/">Mạng lưới toàn cầu</FooterLink></li>
              </ul>
            </FooterSection>
          </div>

          {/* Column 3: Tin tức & Hỗ trợ Khách hàng */}
          <div className="md:space-y-6">
            <FooterSection
              title="Tin tức"
              titleLink="https://www.tiger-corporation.com/vi/vnm/newsroom/"
              isOpen={openSections['tin-tuc']}
              onToggle={() => toggleSection('tin-tuc')}
            >
              <ul className="space-y-4 text-center md:text-left">
                <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/magazine/">Tạp chí trực tuyến</FooterLink></li>
                <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/newsroom/newest-arrivals/">Sản phẩm mới nhất</FooterLink></li>
              </ul>
            </FooterSection>
            <FooterSection
              title="Hỗ trợ Khách hàng"
              titleLink="https://www.tiger-corporation.com/vi/vnm/support/"
              isOpen={openSections['ho-tro-khach-hang']}
              onToggle={() => toggleSection('ho-tro-khach-hang')}
            >
              <ul className="space-y-4 text-center md:text-left">
                <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/support/">FAQ</FooterLink></li>
                <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/support/manual/">Cẩm nang hướng dẫn</FooterLink></li>
                <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/support/inquiry/contact-us/">Liên hệ với chúng tôi</FooterLink></li>
              </ul>
            </FooterSection>
          </div>

          {/* Column 4: Kinh doanh */}
          <div>
            <FooterSection
              title="Kinh doanh"
              titleLink="https://www.tiger-corporation.com/vi/vnm/support/inquiry/business/"
              isOpen={openSections['kinh-doanh']}
              onToggle={() => toggleSection('kinh-doanh')}
            >
              <ul className="space-y-4 text-center md:text-left">
                {/* <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/support/inquiry/business/">Kinh doanh</FooterLink></li> */}
              </ul>
            </FooterSection>
            <FooterSection
              title="Nơi để mua"
              titleLink="https://www.tiger-corporation.com/vi/vnm/where-to-buy/"
              isOpen={openSections['noi-de-mua']}
              onToggle={() => toggleSection('noi-de-mua')}
              isLast={true}
            >
              <ul className="space-y-4 text-center md:text-left">
                {/* <li><FooterLink href="https://www.tiger-corporation.com/vi/vnm/where-to-buy/">Nơi để mua</FooterLink></li> */}
              </ul>
            </FooterSection>
          </div>
        </div>

        {/* Separator Line */}
        <div className="w-full h-px bg-gray-600 mb-8" />

        {/* Lower Section - Social Media Icons */}
        <div className="flex justify-center items-center gap-6">
          <Link
            href="https://www.facebook.com/tiger.vietnam"
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
            href="https://www.instagram.com/tiger.vietnam/"
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
            href="https://www.youtube.com/playlist?list=PLWZD9SRMWifAhasnLWwID_8f-JYDcD5tZ"
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

