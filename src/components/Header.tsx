'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useNextAuth } from '@/hooks/useNextAuth';
import { Button } from '@/components/ui/button';
import { useGlobalNavigationLoading } from '@/hooks/useGlobalNavigationLoading';
import {
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  Shield,
} from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, logout, isAdmin } = useNextAuth();
  const { navigateWithLoading } = useGlobalNavigationLoading();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigationItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Nhịp sống', href: '/nhip-song' },
    { label: 'Thử thách giữ nhịp', href: '/thu-thach-giu-nhip' },
    { label: 'Nhịp bếp', href: '/nhip-bep' },
    { label: 'Ưu đãi', href: '/uu-dai' },
  ];

  return (
    <>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative top-0 left-0 right-0 z-40"
      >
        {/* Logo - Absolute left */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute left-12 top-1/2 -translate-y-1/2 z-50"
        >
          <Link href="/" className="flex items-center group">
            <Image
              src="/icons/tiger_logo.png"
              alt="Tiger Logo"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
        </motion.div>

        {/* Auth Buttons - Absolute right */}
        {!isAuthenticated && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2 z-50 flex items-center" style={{ gap: '8px' }}>
            <Button
              asChild
              className="font-medium hover:opacity-90 min-w-[150px]"
              style={{ 
                backgroundColor: '#00579F', 
                color: '#ffffff',
                borderRadius: '8px',
                paddingTop: '4px',
                paddingRight: '8px',
                paddingBottom: '4px',
                paddingLeft: '8px',
                gap: '8px',
                opacity: 1,
                fontSize: '16px'
              }}
            >
              <Link href="/auth/register">Đăng ký</Link>
            </Button>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                asChild
                className="bg-transparent font-medium hover:bg-gray-50 min-w-[150px]"
                style={{ 
                  color: '#333435', 
                  border: '1px solid #333435',
                  borderRadius: '8px',
                  paddingTop: '4px',
                  paddingRight: '8px',
                  paddingBottom: '4px',
                  paddingLeft: '8px',
                  gap: '8px',
                  opacity: 1,
                  fontSize: '16px'
                }}
              >
                <Link href="/auth/login">Đăng nhập</Link>
              </Button>
            </motion.div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="px-0 py-0">
            <div className="flex items-center w-full" style={{ color: '#333435' }}>
              {/* Navigation - Center 1/3 */}
              <nav className="hidden sm:flex items-center justify-center flex-1 space-x-4">
                {navigationItems.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => {
                      navigateWithLoading(item.href, `Đang chuyển đến ${item.label}...`);
                    }}
                    className="inline-block px-3 py-2 font-medium transition-colors duration-300 whitespace-nowrap rounded-lg hover:opacity-70"
                    style={{ color: '#333435', fontSize: '16px' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* User Button - Right 1/3 */}
              {isAuthenticated && (
                <div className="flex items-center justify-end flex-none">
                  <div className="relative inline-block" ref={dropdownRef}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setIsUserDropdownOpen(!isUserDropdownOpen)
                        }
                        className="font-medium inline-flex items-center space-x-2 w-auto hover:opacity-70"
                        style={{ color: '#333435' }}
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          {user?.image ? (
                            <Image
                              src={user.image}
                              alt={user.name || 'User avatar'}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                              unoptimized={user.image.includes(
                                'platform-lookaside.fbsbx.com'
                              )}
                            />
                          ) : (
                            <span className="font-bold text-sm" style={{ color: '#333435' }}>
                              {user?.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span>{user?.name || 'User'}</span>
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
                          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                        >
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900">
                              {user?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user?.email}
                            </p>
                          </div>
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setIsUserDropdownOpen(false);
                                navigateWithLoading(
                                  '/profile',
                                  'Đang chuyển đến hồ sơ cá nhân...'
                                );
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 w-full text-left"
                            >
                              <User className="w-4 h-4 mr-3" />
                              Hồ sơ cá nhân
                            </button>
                            <Link
                              href="/settings"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                              onClick={() => setIsUserDropdownOpen(false)}
                            >
                              <Settings className="w-4 h-4 mr-3" />
                              Cài đặt
                            </Link>
                            {isAdmin && (
                              <button
                                onClick={() => {
                                  setIsUserDropdownOpen(false);
                                  navigateWithLoading(
                                    '/admin',
                                    'Đang chuyển đến CMS...'
                                  );
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 w-full text-left"
                              >
                                <Shield className="w-4 h-4 mr-3" />
                                Quản lý CMS
                              </button>
                            )}
                            <button
                              onClick={() => {
                                logout();
                                setIsUserDropdownOpen(false);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                            >
                              <LogOut className="w-4 h-4 mr-3" />
                              Đăng xuất
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="sm:hidden p-2 hover:bg-gray-100 transition-colors duration-300 rounded-full"
                  style={{ color: '#333435' }}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="sm:hidden bg-white rounded-2xl shadow-lg border border-gray-200 mx-4 mt-2 overflow-hidden"
            >
              <div className="px-6 py-4 space-y-3">
                {navigationItems.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigateWithLoading(item.href, `Đang chuyển đến ${item.label}...`);
                    }}
                    className="block px-4 py-2 text-blue-700 hover:text-blue-900 font-medium transition-colors duration-300 rounded-lg hover:bg-blue-50"
                  >
                    {item.label}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <div className="px-4 py-2 text-sm text-gray-600">
                      Xin chào,{' '}
                      <span className="font-semibold text-gray-900">
                        {user?.name || 'User'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigateWithLoading(
                          '/profile',
                          'Đang chuyển đến hồ sơ cá nhân...'
                        );
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-lg w-full text-left"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Hồ sơ cá nhân
                    </button>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Cài đặt
                    </Link>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigateWithLoading(
                            '/admin',
                            'Đang chuyển đến CMS...'
                          );
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-lg w-full text-left"
                      >
                        <Shield className="w-4 h-4 mr-3" />
                        Quản lý CMS
                      </button>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-lg"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <Button
                      asChild
                      className="w-full font-medium hover:opacity-90"
                      style={{ backgroundColor: '#00579F', color: '#ffffff' }}
                    >
                      <Link href="/auth/register">Đăng ký</Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full bg-transparent font-medium hover:bg-gray-50"
                      style={{ color: '#333435', border: '1px solid #333435' }}
                    >
                      <Link href="/auth/login">Đăng nhập</Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
