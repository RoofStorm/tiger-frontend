'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useNextAuth } from '@/hooks/useNextAuth';
import { Button } from '@/components/ui/button';
import {
  User,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  LogOut,
  Settings,
  Shield,
} from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, logout, isAdmin } = useNextAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    { href: '#corner-0', label: 'Trang chủ' },
    // { href: '#corner-1', label: 'Mục lục' },
    // { href: '#corner-2', label: 'Ưu đãi' },
    // { href: '#corner-3', label: 'Cá nhân' },
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Collapsed Header Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed top-4 right-4 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleCollapse}
          className="w-12 h-12 bg-white/90 backdrop-blur-lg rounded-full shadow-lg border border-gray-200/50 flex items-center justify-center hover:bg-white transition-all duration-300"
        >
          {isCollapsed ? (
            <ChevronDown className="w-6 h-6 text-gray-700" />
          ) : (
            <ChevronUp className="w-6 h-6 text-gray-700" />
          )}
        </motion.button>
      </motion.div>

      {/* Full Header */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.header
            initial={{ opacity: 0, y: -100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-40"
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 px-6 py-4">
                <div className="flex items-center w-full">
                  {/* Logo - Left 1/3 */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-1/3 flex justify-start"
                  >
                    <Link
                      href="/"
                      className="flex items-center space-x-3 group"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <span className="text-white font-bold text-xl">
                            T
                          </span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                          Tiger
                        </span>
                        <span className="text-xs text-gray-500 -mt-1">
                          Mood Corner
                        </span>
                      </div>
                    </Link>
                  </motion.div>

                  {/* Navigation - Center 1/3 */}
                  <nav className="hidden sm:flex items-center justify-center w-1/3 space-x-2">
                    {navigationItems.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="inline-block px-4 py-2 text-blue-700 hover:text-blue-900 font-medium transition-colors duration-300 whitespace-nowrap rounded-lg hover:bg-blue-50 w-fit"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>

                  {/* Auth Buttons - Right 1/3 */}
                  <div className="flex items-center justify-end w-1/3 space-x-3">
                    {isAuthenticated ? (
                      <div className="relative" ref={dropdownRef}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="ghost"
                            onClick={() =>
                              setIsUserDropdownOpen(!isUserDropdownOpen)
                            }
                            className="text-blue-700 hover:text-blue-900 font-medium flex items-center space-x-2"
                          >
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {user?.name?.charAt(0).toUpperCase()}
                              </span>
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
                                <Link
                                  href="/profile"
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                  onClick={() => setIsUserDropdownOpen(false)}
                                >
                                  <User className="w-4 h-4 mr-3" />
                                  Hồ sơ cá nhân
                                </Link>
                                <Link
                                  href="/settings"
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                  onClick={() => setIsUserDropdownOpen(false)}
                                >
                                  <Settings className="w-4 h-4 mr-3" />
                                  Cài đặt
                                </Link>
                                {isAdmin && (
                                  <Link
                                    href="/admin"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                    onClick={() => setIsUserDropdownOpen(false)}
                                  >
                                    <Shield className="w-4 h-4 mr-3" />
                                    Quản lý CMS
                                  </Link>
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
                          variant="ghost"
                          asChild
                          className="text-blue-700 hover:text-blue-900 font-medium px-4 py-2"
                        >
                          <Link href="/auth/register">Đăng ký</Link>
                        </Button>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            asChild
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium px-4 py-2 rounded-lg"
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
                        className="sm:hidden p-2 hover:bg-gray-100 transition-colors duration-300 rounded-full"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                      >
                        {isMenuOpen ? (
                          <X className="w-5 h-5 text-gray-700" />
                        ) : (
                          <Menu className="w-5 h-5 text-gray-700" />
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
                  className="sm:hidden bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 mx-4 mt-2 overflow-hidden"
                >
                  <div className="px-6 py-4 space-y-3">
                    {navigationItems.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-blue-700 hover:text-blue-900 font-medium transition-colors duration-300 rounded-lg hover:bg-blue-50"
                        onClick={() => setIsMenuOpen(false)}
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
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          Hồ sơ cá nhân
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Cài đặt
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded-lg"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Shield className="w-4 h-4 mr-3" />
                            Quản lý CMS
                          </Link>
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
        )}
      </AnimatePresence>
    </>
  );
}
