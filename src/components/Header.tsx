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
    { label: 'Dừng lại và cảm nhận', corner: 0 },
    { label: 'Nhịp sống', corner: 1 },
    { label: 'Thử thách', corner: 2 },
    { label: 'Nhịp bếp', corner: 4 },
    { label: 'Quà tặng', corner: 5 },
  ];

  const scrollToCorner = (cornerIndex: number) => {
    const el = document.querySelector(`[data-corner="${cornerIndex}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-40 bg-blue-800/95 backdrop-blur-sm shadow-md"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="px-0 py-0">
            <div className="flex items-center w-full text-white">
              {/* Logo - Left 1/3 */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex-none flex justify-start"
              >
                <Link href="/" className="flex items-center space-x-3 group">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <span className="text-white font-bold text-xl">T</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/30 rounded-full"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-white">Tiger</span>
                    <span className="text-xs text-blue-100 -mt-1">
                      Mood Corner
                    </span>
                  </div>
                </Link>
              </motion.div>

              {/* Navigation - Center 1/3 */}
              <nav className="hidden sm:flex items-center justify-center flex-1 space-x-4">
                {navigationItems.map(item => (
                  <Link
                    key={item.label}
                    href={`#corner-${item.corner}`}
                    onClick={e => {
                      e.preventDefault();
                      scrollToCorner(item.corner);
                    }}
                    className="inline-block px-3 py-2 text-white hover:text-blue-100 font-medium transition-colors duration-300 whitespace-nowrap rounded-lg"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Auth Buttons - Right 1/3 */}
              <div className="flex items-center justify-end flex-none space-x-3">
                {isAuthenticated ? (
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
                        className="text-white hover:text-blue-100 font-medium inline-flex items-center space-x-2 w-auto"
                      >
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
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
                            <span className="text-white font-bold text-sm">
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
                ) : (
                  <>
                    <Button
                      asChild
                      className="bg-white text-blue-800 hover:bg-white/90 font-medium px-4 py-2 rounded-full border border-white"
                    >
                      <Link href="/auth/register">Đăng ký</Link>
                    </Button>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        asChild
                        className="bg-transparent border border-white text-white hover:bg-white/10 font-medium px-4 py-2 rounded-full"
                      >
                        <Link href="/auth/login">Đăng nhập</Link>
                      </Button>
                    </motion.div>
                  </>
                )}

                {/* Mobile Menu Button */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="sm:hidden p-2 hover:bg-white/10 transition-colors duration-300 rounded-full text-white"
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
                    href={`#corner-${item.corner}`}
                    onClick={e => {
                      e.preventDefault();
                      scrollToCorner(item.corner);
                      setIsMenuOpen(false);
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
                      variant="ghost"
                      asChild
                      className="w-full text-blue-700 hover:text-blue-900 font-medium"
                    >
                      <Link href="/auth/register">Đăng ký</Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium"
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
