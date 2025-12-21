'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ShareRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => void;
  onLogin: () => void;
  initialMode?: 'login' | 'register'; // 'register' = registration, 'login' = login
}

export function ShareRegistrationModal({
  isOpen,
  onClose,
  onRegister,
  onLogin,
  initialMode = 'register',
}: ShareRegistrationModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login'); // false = registration, true = login
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Reset to initial mode when modal closes or opens
  useEffect(() => {
    if (!isOpen) {
      setIsLoginMode(false);
      setUsername('');
      setPassword('');
      setAgeConfirmed(false);
      setTermsAccepted(false);
    } else {
      // Set mode when modal opens
      setIsLoginMode(initialMode === 'login');
    }
  }, [isOpen, initialMode]);

  const handleFacebookLogin = () => {
    // Handle Facebook login
    console.log('Facebook login');
  };

  const handleGoogleLogin = () => {
    // Handle Google login
    console.log('Google login');
  };

  const handleFormLogin = () => {
    // Handle form login
    onLogin();
  };

  const handleFormRegister = () => {
    // Handle form registration
    if (ageConfirmed && termsAccepted) {
      onRegister();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none"
        >
          <div 
            className="rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto pointer-events-auto" 
            style={{ backgroundColor: '#FBF9F3' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-8">
              {/* Header Text */}
              <p 
                className="font-noto-sans text-center mb-2"
                style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#999999',
                }}
              >
                Giữa muôn vàn hối hả, hãy giữ cho mình một nhìn riêng
              </p>

              {/* Title */}
              <h2 
                className="font-prata text-center mb-2"
                style={{
                  fontFamily: 'Prata',
                  fontWeight: 400,
                  fontSize: '36px',
                  lineHeight: '44px',
                  letterSpacing: '0.03em',
                  textAlign: 'center',
                  color: '#00579F',
                }}
              >
                Khám phá và tận hưởng
              </h2>

              {/* Subtitle */}
              <p 
                className="font-noto-sans text-center mb-8"
                style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#333435',
                }}
              >
                Để nhận ngay 200 điểm và đổi quà độc quyền
              </p>

              {/* Social Login Buttons */}
              <div className="flex gap-3 mb-6">
                {/* Facebook Button */}
                <button
                  onClick={handleFacebookLogin}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-nunito font-medium transition-all duration-300 hover:opacity-90"
                  style={{
                    backgroundColor: '#1877F2',
                    fontSize: '14px',
                  }}
                >
                  <Image
                    src="/icons/white_facebook_logo.png"
                    alt="Facebook"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                  <span>Tiếp tục bằng Facebook</span>
                </button>

                {/* Google Button */}
                <button
                  onClick={handleGoogleLogin}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-nunito font-medium transition-all duration-300 hover:bg-gray-50 border"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E0E0E0',
                    color: '#333435',
                    fontSize: '14px',
                  }}
                >
                  <Image
                    src="/icons/google_logo.png"
                    alt="Google"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                  <span>Tiếp tục bằng Google</span>
                </button>
              </div>

              {/* Separator */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: '#E0E0E0' }} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#FBF9F3]" style={{ color: '#666666' }}>
                    Hoặc
                  </span>
                </div>
              </div>

              {!isLoginMode ? (
                /* Registration Form */
                <div className="space-y-4">
                  {/* Username Field */}
                  <div>
                    <label 
                      className="block font-nunito mb-2"
                      style={{
                        fontFamily: 'Nunito',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#333435',
                      }}
                    >
                      Tên đăng nhập
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nhập tên đăng nhập"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ 
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E0E0E0',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label 
                      className="block font-nunito mb-2"
                      style={{
                        fontFamily: 'Nunito',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#333435',
                      }}
                    >
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ 
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E0E0E0',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    {/* Age Confirmation Checkbox */}
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ageConfirmed}
                        onChange={(e) => setAgeConfirmed(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-[#00579F] focus:ring-[#00579F]"
                      />
                      <span 
                        className="font-nunito flex-1"
                        style={{
                          fontFamily: 'Nunito',
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '20px',
                          color: '#333435',
                        }}
                      >
                        Tôi xác nhận đủ 18 tuổi trở lên
                      </span>
                    </label>

                    {/* Terms and Conditions Checkbox */}
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-[#00579F] focus:ring-[#00579F]"
                      />
                      <span 
                        className="font-nunito flex-1"
                        style={{
                          fontFamily: 'Nunito',
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '20px',
                          color: '#333435',
                        }}
                      >
                        Tôi đã đọc, hiểu và đồng ý với Điều Khoản Sử Dụng, Thông Báo Về Quyền Riêng Tư, Thông Báo Về Cookies của Tiger, Thể lệ chương trình Yên một chút cùng Tiger như được đăng tải tại website
                      </span>
                    </label>
                  </div>
                  {/* Register Button */}
                  <button
                    onClick={handleFormRegister}
                    disabled={!ageConfirmed || !termsAccepted}
                    className="w-full py-3 px-4 rounded-lg text-white font-nunito font-semibold transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: '#00579F',
                      fontSize: '16px',
                    }}
                  >
                    Đăng ký ngay
                  </button>

                  {/* Disclaimer */}
                  <p 
                    className="font-nunito text-center"
                    style={{
                      fontFamily: 'Nunito',
                      fontWeight: 400,
                      fontSize: '12px',
                      lineHeight: '18px',
                      color: '#666666',
                    }}
                  >
                    *Đăng kí để chia sẻ cảm xúc ngày hôm nay và nhận được quà từ chương trình nhé!
                  </p>

                  {/* Login Link */}
                  <div className="text-center pt-2">
                    <span 
                      className="font-nunito"
                      style={{
                        fontFamily: 'Nunito',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#333435',
                      }}
                    >
                      Bạn đã có tài khoản?{' '}
                    </span>
                    <button 
                      className="font-nunito underline"
                      onClick={() => setIsLoginMode(true)}
                      style={{
                        fontFamily: 'Nunito',
                        fontWeight: 600,
                        fontSize: '14px',
                        lineHeight: '20px',
                        textDecoration: 'underline',
                        color: '#00579F',
                      }}
                    >
                      Đăng nhập ngay
                    </button>
                  </div>
                </div>
              ) : (
                /* Login Form */
                <div className="space-y-4">
                  {/* Username Field */}
                  <div>
                    <label 
                      className="block font-nunito mb-2"
                      style={{
                        fontFamily: 'Nunito',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#333435',
                      }}
                    >
                      Tên đăng nhập
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nhập tên đăng nhập"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ 
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E0E0E0',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label 
                      className="block font-nunito mb-2"
                      style={{
                        fontFamily: 'Nunito',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#333435',
                      }}
                    >
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ 
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E0E0E0',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  {/* Login Button */}
                  <button
                    onClick={handleFormLogin}
                    className="w-full py-3 px-4 rounded-lg text-white font-nunito font-semibold transition-all duration-300 hover:opacity-90"
                    style={{
                      backgroundColor: '#00579F',
                      fontSize: '16px',
                    }}
                  >
                    Đăng nhập ngay
                  </button>

                  {/* Registration Link */}
                  <div className="text-center pt-2">
                    <span 
                      className="font-nunito"
                      style={{
                        fontFamily: 'Nunito',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#333435',
                      }}
                    >
                      Bạn đã chưa có tài khoản?{' '}
                    </span>
                    <button 
                      className="font-nunito underline"
                      onClick={() => setIsLoginMode(false)}
                      style={{
                        fontFamily: 'Nunito',
                        fontWeight: 600,
                        fontSize: '14px',
                        lineHeight: '20px',
                        textDecoration: 'underline',
                        color: '#00579F',
                      }}
                    >
                      Đăng ký ngay
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
