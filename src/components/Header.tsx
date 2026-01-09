'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNextAuth } from '@/hooks/useNextAuth';
import { Button } from '@/components/ui/button';
import { useGlobalNavigationLoading } from '@/hooks/useGlobalNavigationLoading';
import { ShareRegistrationModal } from '@/app/nhip-song/components/ShareRegistrationModal';
import apiClient from '@/lib/api';
import {
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Shield,
} from 'lucide-react';

interface HeaderProps {
  isDarkMode?: boolean;
}

export function Header({ isDarkMode = false }: HeaderProps = {}) {
  const { user, isAuthenticated, logout, isAdmin } = useNextAuth();
  const { navigateWithLoading } = useGlobalNavigationLoading();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Fetch user details including points
  const { data: userDetails } = useQuery({
    queryKey: ['userDetails', user?.id],
    queryFn: () => apiClient.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });

  // Handle scroll to show/hide header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsHeaderVisible(true);
      } 
      // Hide header when scrolling down (only if scrolled past a threshold)
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const navigationItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Nhịp sống', href: '/nhip-song' },
    { label: 'Thử thách giữ nhịp', href: '/thu-thach-giu-nhip' },
    { label: 'Nhịp bếp', href: '/nhip-bep' },
    { label: 'Đổi quà', href: '/doi-qua' },
  ];

  const handleOpenAuthModal = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleRegister = () => {
    setIsAuthModalOpen(false);
    // Modal handles registration, no need to navigate
  };

  const handleLogin = () => {
    setIsAuthModalOpen(false);
    // Modal handles login, no need to navigate
  };

  return (
    <>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -100, scale: 0.95 }}
        animate={{ 
          opacity: isHeaderVisible ? 1 : 0,
          y: isHeaderVisible ? 0 : -100,
          scale: isHeaderVisible ? 1 : 0.95
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-[60]"
        style={{
          backgroundColor: isDarkMode ? '#333435' : '#FBF9F380',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="max-w-8xl mx-auto px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 xl:h-20">
            {/* Logo - Left side */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 z-50"
            >
              <Link href="/" className="flex items-center group">
                <Image
                  src={isDarkMode ? "/icons/tiger_logo_darkmode.png" : "/icons/tiger_logo.svg"}
                  alt="Tiger Logo"
                  width={120}
                  height={40}
                  className="h-8 sm:h-10 w-auto object-contain"
                  style={{ height: "auto" }}
                  priority
                />
              </Link>
            </motion.div>

            {/* Desktop Navigation - Center */}
            <nav className="hidden md:flex items-center justify-center flex-1 px-4 lg:px-8">
              <div className="flex items-center space-x-4 lg:space-x-8">
                {navigationItems.map(item => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => {
                        navigateWithLoading(item.href, `Đang chuyển đến ${item.label}...`);
                      }}
                      className="inline-block px-2 lg:px-3 py-2 font-medium transition-colors duration-300 whitespace-nowrap rounded-lg hover:opacity-70"
                      style={{ 
                        color: isDarkMode && isActive ? '#0479D9' : (isDarkMode ? '#FFFFFF' : '#333435'), 
                        fontSize: '14px',
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Desktop Auth/User Section - Right side */}
            <div className="flex items-center flex-shrink-0 gap-2 z-50">
              {!isAuthenticated ? (
                <>
                  {/* Desktop Auth Buttons */}
                  <div className="hidden md:flex items-center gap-2">
                    <Button
                      onClick={() => handleOpenAuthModal('register')}
                      className={`font-medium ${isDarkMode ? '' : 'hover:opacity-90'}`}
                      style={{ 
                        width: isDarkMode ? '134px' : 'auto',
                        height: isDarkMode ? '28px' : 'auto',
                        minWidth: isDarkMode ? '134px' : '120px',
                        backgroundColor: isDarkMode ? '#FBF9F3' : '#00579F', 
                        color: isDarkMode ? '#333435' : '#ffffff',
                        border: isDarkMode ? '1px solid #FBF9F3' : 'none',
                        borderWidth: isDarkMode ? '1px' : '0',
                        borderRadius: '8px',
                        paddingTop: '4px',
                        paddingRight: '8px',
                        paddingBottom: '4px',
                        paddingLeft: '8px',
                        gap: '8px',
                        opacity: 1,
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => {
                        if (isDarkMode) {
                          e.currentTarget.style.opacity = '0.8';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isDarkMode) {
                          e.currentTarget.style.opacity = '1';
                        }
                      }}
                    >
                      Đăng ký
                    </Button>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => handleOpenAuthModal('login')}
                        className={`bg-transparent font-medium ${isDarkMode ? '' : 'hover:bg-gray-50'}`}
                        style={{ 
                          width: isDarkMode ? '136px' : 'auto',
                          height: isDarkMode ? '28px' : 'auto',
                          minWidth: isDarkMode ? '136px' : '120px',
                          color: isDarkMode ? '#FFFFFF' : '#333435', 
                          border: isDarkMode ? '1px solid #FFFFFF' : '1px solid #333435',
                          borderWidth: '1px',
                          borderRadius: '8px',
                          gap: '8px',
                          opacity: 1,
                          paddingTop: '4px',
                          paddingRight: '8px',
                          paddingBottom: '4px',
                          paddingLeft: '8px',
                          fontSize: '14px'
                        }}
                        onMouseEnter={(e) => {
                          if (isDarkMode) {
                            e.currentTarget.style.opacity = '0.8';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (isDarkMode) {
                            e.currentTarget.style.opacity = '1';
                          }
                        }}
                      >
                        Đăng nhập
                      </Button>
                    </motion.div>
                  </div>
                </>
              ) : (
                <div className="relative inline-block" ref={dropdownRef}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsUserDropdownOpen(!isUserDropdownOpen);
                        // Đóng mobile menu nếu đang mở
                        if (isMenuOpen) {
                          setIsMenuOpen(false);
                        }
                      }}
                      className="font-medium inline-flex items-center gap-2 w-auto hover:opacity-90 px-4 py-2"
                      style={{ 
                        backgroundColor: '#00579F',
                        color: '#FFFFFF',
                        borderRadius: '12px',
                      }}
                    >
                      <span className="font-bold whitespace-nowrap" style={{ fontSize: '14px' }}>
                        {userDetails?.points || 0}
                      </span>
                      <span className="hidden md:inline font-medium whitespace-nowrap" style={{ fontSize: '14px' }}>
                        Điểm năng lượng
                      </span>
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                        {user?.image ? (
                          <Image
                            src={user.image}
                            alt={user.name || 'User avatar'}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                            sizes="32px"
                          />
                        ) : (
                          <User className="w-5 h-5" style={{ color: '#00579F' }} />
                        )}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </Button>
                  </motion.div>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[70]"
                        style={{
                          backgroundColor: isDarkMode ? '#333435' : '#ffffff',
                          borderColor: isDarkMode ? '#555' : '#e5e7eb',
                        }}
                      >
                        <div className="px-4 py-2 border-b" style={{ borderColor: isDarkMode ? '#555' : '#e5e7eb' }}>
                          <p className="text-sm font-semibold" style={{ color: isDarkMode ? '#FFFFFF' : '#111827' }}>
                            {user?.name}
                          </p>
                          <p className="text-xs" style={{ color: isDarkMode ? '#999' : '#6b7280' }}>
                            {user?.email}
                          </p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsUserDropdownOpen(false);
                              navigateWithLoading(
                                '/profile',
                                'Đang chuyển đến hồ sơ cá nhân...'
                              );
                            }}
                            onTouchStart={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode ? '#444' : '#f3f4f6';
                            }}
                            onTouchEnd={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            className="flex items-center px-4 py-2 text-sm transition-colors duration-200 w-full text-left cursor-pointer touch-manipulation"
                            style={{ 
                              color: isDarkMode ? '#FFFFFF' : '#374151',
                              backgroundColor: 'transparent',
                              WebkitTapHighlightColor: 'transparent',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode ? '#444' : '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <User className="w-4 h-4 mr-3" />
                            Hồ sơ cá nhân
                          </button>
                          {/* <Link
                            href="/settings"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsUserDropdownOpen(false);
                            }}
                            onTouchStart={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode ? '#444' : '#f3f4f6';
                            }}
                            onTouchEnd={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            className="flex items-center px-4 py-2 text-sm transition-colors duration-200 cursor-pointer touch-manipulation"
                            style={{ 
                              color: isDarkMode ? '#FFFFFF' : '#374151',
                              backgroundColor: 'transparent',
                              WebkitTapHighlightColor: 'transparent',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode ? '#444' : '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            Cài đặt
                          </Link> */}
                          {isAdmin && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsUserDropdownOpen(false);
                                navigateWithLoading(
                                  '/admin',
                                  'Đang chuyển đến CMS...'
                                );
                              }}
                              onTouchStart={(e) => {
                                e.currentTarget.style.backgroundColor = isDarkMode ? '#444' : '#f3f4f6';
                              }}
                              onTouchEnd={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              className="flex items-center px-4 py-2 text-sm transition-colors duration-200 w-full text-left cursor-pointer touch-manipulation"
                              style={{ 
                                color: isDarkMode ? '#FFFFFF' : '#374151',
                                backgroundColor: 'transparent',
                                WebkitTapHighlightColor: 'transparent',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDarkMode ? '#444' : '#f3f4f6';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <Shield className="w-4 h-4 mr-3" />
                              Quản lý CMS
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              logout();
                              setIsUserDropdownOpen(false);
                            }}
                            onTouchStart={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef2f2';
                            }}
                            onTouchEnd={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 cursor-pointer touch-manipulation"
                            style={{ 
                              color: '#dc2626',
                              backgroundColor: 'transparent',
                              WebkitTapHighlightColor: 'transparent',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef2f2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Đăng xuất
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex-shrink-0 z-50 relative">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 transition-colors duration-300 rounded-lg"
                  style={{ 
                    color: isDarkMode ? '#FFFFFF' : '#333435',
                  }}
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                    // Đóng dropdown nếu đang mở
                    if (isUserDropdownOpen) {
                      setIsUserDropdownOpen(false);
                    }
                  }}
                >
                  {isMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </Button>
              </motion.div>

              {/* Mobile Menu Dropdown */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    ref={mobileMenuRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-lg shadow-lg border z-[70]"
                    style={{
                      backgroundColor: isDarkMode ? '#333435' : '#ffffff',
                      borderColor: isDarkMode ? '#555' : '#e5e7eb',
                      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
                    }}
                  >
              <div className="py-2">
                {/* Navigation Items */}
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(false);
                        navigateWithLoading(item.href, `Đang chuyển đến ${item.label}...`);
                      }}
                      onTouchStart={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = isDarkMode ? '#444' : '#f3f4f6';
                        }
                      }}
                      onTouchEnd={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                      className="block px-4 py-3 text-sm font-medium transition-colors duration-200 cursor-pointer touch-manipulation"
                      style={{
                        color: isActive 
                          ? (isDarkMode ? '#0479D9' : '#00579F')
                          : (isDarkMode ? '#FFFFFF' : '#333435'),
                        backgroundColor: isActive 
                          ? (isDarkMode ? 'rgba(4, 121, 217, 0.1)' : 'rgba(0, 87, 159, 0.1)')
                          : 'transparent',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = isDarkMode ? '#444' : '#f3f4f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                  })}
                
                {/* Mobile Auth Buttons */}
                {!isAuthenticated && (
                  <>
                    <div className="border-t my-2" style={{ borderColor: isDarkMode ? '#555' : '#e5e7eb' }} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(false);
                        handleOpenAuthModal('register');
                      }}
                      className="block w-full px-4 py-3 text-sm font-medium transition-colors duration-200 cursor-pointer touch-manipulation text-left"
                      style={{
                        color: isDarkMode ? '#FFFFFF' : '#333435',
                        backgroundColor: 'transparent',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDarkMode ? '#444' : '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Đăng ký
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(false);
                        handleOpenAuthModal('login');
                      }}
                      className="block w-full px-4 py-3 text-sm font-medium transition-colors duration-200 cursor-pointer touch-manipulation text-left"
                      style={{
                        color: isDarkMode ? '#FFFFFF' : '#333435',
                        backgroundColor: 'transparent',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDarkMode ? '#444' : '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Đăng nhập
                    </button>
                  </>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Auth Modal */}
      <ShareRegistrationModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        onRegister={handleRegister}
        onLogin={handleLogin}
        initialMode={authModalMode}
      />
    </>
  );
}
