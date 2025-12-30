'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useToast } from '@/hooks/use-toast';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự').regex(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

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
  const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login'); // false = registration, true = login
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, register: registerUser, loading } = useNextAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  // Reset to initial mode when modal closes or opens
  useEffect(() => {
    if (!isOpen) {
      setIsLoginMode(initialMode === 'login');
      setAgeConfirmed(false);
      setTermsAccepted(false);
      setShowPassword(false);
      loginForm.reset();
      registerForm.reset();
    } else {
      // Set mode when modal opens
      setIsLoginMode(initialMode === 'login');
    }
  }, [isOpen, initialMode, loginForm, registerForm]);

  const handleFacebookLogin = async () => {
    try {
      // Redirect to Facebook OAuth - let NextAuth handle the flow
      await signIn('facebook', {
        callbackUrl: '/',
        redirect: true, // Allow redirect to OAuth provider
      });
    } catch (error) {
      // Only show error if there's an actual error, not OAuth flow
      console.error('Facebook login error:', error);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi đăng nhập với Facebook',
        variant: 'destructive',
        duration: 4000,
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Redirect to Google OAuth - let NextAuth handle the flow
      await signIn('google', {
        callbackUrl: '/',
        redirect: true, // Allow redirect to OAuth provider
      });
    } catch (error) {
      // Only show error if there's an actual error, not OAuth flow
      console.error('Google login error:', error);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi đăng nhập với Google',
        variant: 'destructive',
        duration: 4000,
      });
    }
  };

  const handleFormLogin = async (data: LoginForm) => {
    try {
      await login(data.username, data.password);
      // Don't call router.push here - login() already handles redirect
      toast({
        title: 'Đăng nhập thành công!',
        description: 'Chào mừng bạn trở lại với TIGER.',
        duration: 3000,
      });
      onLogin();
      onClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Có lỗi xảy ra. Vui lòng thử lại.';
      toast({
        title: 'Đăng nhập thất bại',
        description: errorMessage,
        variant: 'destructive',
        duration: 4000,
      });
    }
  };

  const handleFormRegister = async (data: RegisterForm) => {
    if (!ageConfirmed || !termsAccepted) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng xác nhận tuổi và đồng ý với điều khoản',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    try {
      // Generate email from username if name is not provided
      const email = `${data.username.toLowerCase()}@tiger.local`;
      await registerUser(
        email,
        data.password,
        data.username,
        undefined, // referralCode
        data.username
      );
      // Success toast and navigation are handled in useNextAuth
      onRegister();
      onClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Có lỗi xảy ra. Vui lòng thử lại.';
      toast({
        title: 'Đăng ký thất bại',
        description: errorMessage,
        variant: 'destructive',
        duration: 4000,
      });
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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[81] flex items-center justify-center p-4 pointer-events-none"
        >
          <div 
            className="rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto pointer-events-auto" 
            style={{ backgroundColor: '#FBF9F3' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-8">
              {/* Header Text */}
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
              <div className="flex gap-3 mb-4">
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
                    src="/icons/white_facebook_logo.svg"
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
                    src="/icons/google_logo.svg"
                    alt="Google"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                  <span>Tiếp tục bằng Google</span>
                </button>
              </div>

              {/* Separator */}
              <div className="relative mb-4">
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
                <>
                {/* Registration Form */}
                <form onSubmit={registerForm.handleSubmit(handleFormRegister)} className="space-y-4">
                  {/* Username Field */}
                  <div>
                    <label 
                      htmlFor="register-username"
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
                      {...registerForm.register('username')}
                      type="text"
                      id="register-username"
                      placeholder="Nhập tên đăng nhập"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ 
                        backgroundColor: '#FFFFFF',
                        borderColor: registerForm.formState.errors.username ? '#EF4444' : '#E0E0E0',
                        fontSize: '14px',
                      }}
                    />
                    {registerForm.formState.errors.username && (
                      <p className="mt-1 text-sm" style={{ color: '#EF4444' }}>
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label 
                      htmlFor="register-password"
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
                    <div className="relative">
                      <input
                        {...registerForm.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        id="register-password"
                        placeholder="Nhập mật khẩu"
                        className="w-full px-4 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ 
                          backgroundColor: '#FFFFFF',
                          borderColor: registerForm.formState.errors.password ? '#EF4444' : '#E0E0E0',
                          fontSize: '14px',
                        }}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" style={{ color: '#999999' }} />
                        ) : (
                          <Eye className="h-5 w-5" style={{ color: '#999999' }} />
                        )}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="mt-1 text-sm" style={{ color: '#EF4444' }}>
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
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
                        Tôi đã đọc, hiểu và đồng ý với Điều Khoản Sử Dụng, Thông Báo Về Quyền Riêng Tư, Thông Báo Về Cookies của TIGER, Thể lệ chương trình cùng TIGER giữ nhịp sống như được đăng tải tại website
                      </span>
                    </label>
                  </div>
                  {/* Register Button */}
                  <button
                    type="submit"
                    disabled={loading || !ageConfirmed || !termsAccepted}
                    className="w-full py-3 px-4 rounded-lg text-white font-nunito font-semibold transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: '#00579F',
                      fontSize: '16px',
                    }}
                  >
                    {loading ? 'Đang đăng ký...' : 'Đăng ký ngay'}
                  </button>
                </form>

                {/* Disclaimer */}
                <p 
                  className="font-nunito text-center mt-4"
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
                </>
              ) : (
                <>
                {/* Login Form */}
                <form onSubmit={loginForm.handleSubmit(handleFormLogin)} className="space-y-4">
                  {/* Username Field */}
                  <div>
                    <label 
                      htmlFor="login-username"
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
                    <div className="relative">
                      <input
                        {...loginForm.register('username')}
                        type="text"
                        id="login-username"
                        placeholder="Nhập tên đăng nhập của bạn"
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ 
                          backgroundColor: '#FFFFFF',
                          borderColor: loginForm.formState.errors.username ? '#EF4444' : '#E0E0E0',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    {loginForm.formState.errors.username && (
                      <p className="mt-1 text-sm" style={{ color: '#EF4444' }}>
                        {loginForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label 
                      htmlFor="login-password"
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
                    <div className="relative">
                      <input
                        {...loginForm.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        id="login-password"
                        placeholder="Nhập mật khẩu"
                        className="w-full px-4 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ 
                          backgroundColor: '#FFFFFF',
                          borderColor: loginForm.formState.errors.password ? '#EF4444' : '#E0E0E0',
                          fontSize: '14px',
                        }}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" style={{ color: '#999999' }} />
                        ) : (
                          <Eye className="h-5 w-5" style={{ color: '#999999' }} />
                        )}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="mt-1 text-sm" style={{ color: '#EF4444' }}>
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-lg text-white font-nunito font-semibold transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: '#00579F',
                      fontSize: '16px',
                    }}
                  >
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập ngay'}
                  </button>
                </form>

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
                </>
              )}
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
