'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ShareRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => void;
  onLogin: () => void;
}

export function ShareRegistrationModal({
  isOpen,
  onClose,
  onRegister,
  onLogin,
}: ShareRegistrationModalProps) {
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#FBF9F3' }}>
            <div className="px-12 py-8">
              <h2 
                className="font-prata text-center mb-2"
                style={{
                  fontFamily: 'Prata',
                  fontWeight: 400,
                  fontSize: '44px',
                  lineHeight: '52px',
                  letterSpacing: '0.03em',
                  textAlign: 'center',
                  verticalAlign: 'bottom',
                  color: '#00579F',
                }}
              >
                Khám phá và tận hưởng
              </h2>
              <p 
                className="font-noto-sans text-center mb-6"
                style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '16px',
                  letterSpacing: '-0.02em',
                  textAlign: 'center',
                  color: '#333435',
                }}
              >
                Để nhận ngay 200 điểm và đổi quà độc quyền
              </p>

              {/* Form fields */}
              <div className="space-y-4">
                <div>
                  <label 
                    className="block font-nunito mb-2"
                    style={{
                      fontFamily: 'Nunito',
                      fontWeight: 500,
                      fontSize: '18px',
                      lineHeight: '24px',
                      letterSpacing: '-0.02em',
                      color: '#333435',
                    }}
                  >
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập họ tên bạn"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ backgroundColor: '#FBF9F3' }}
                  />
                </div>

                <div>
                  <label 
                    className="block font-nunito mb-2"
                    style={{
                      fontFamily: 'Nunito',
                      fontWeight: 500,
                      fontSize: '18px',
                      lineHeight: '24px',
                      letterSpacing: '-0.02em',
                      color: '#333435',
                    }}
                  >
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ backgroundColor: '#FBF9F3' }}
                  />
                </div>

                <div>
                  <button 
                    className="font-nunito underline text-center"
                    style={{
                      fontFamily: 'Nunito',
                      fontWeight: 600,
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: '0%',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      textDecoration: 'underline',
                      textDecorationStyle: 'solid',
                      color: '#333435',
                    }}
                  >
                    Nhận mã OTP từ Zalo
                  </button>
                </div>

                <div>
                  <label 
                    className="block font-nunito mb-2"
                    style={{
                      fontFamily: 'Nunito',
                      fontWeight: 500,
                      fontSize: '18px',
                      lineHeight: '24px',
                      letterSpacing: '-0.02em',
                      color: '#333435',
                    }}
                  >
                    Mã OTP<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Mã OTP***"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ backgroundColor: '#FBF9F3' }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">
                      Tôi xác nhận đủ 18 tuổi trở lên
                    </span>
                  </label>
                  <label className="flex items-start">
                    <input type="checkbox" className="mr-2 mt-1" />
                    <span className="text-sm text-gray-700">
                      Tôi đã đọc, hiểu và đồng ý với Điều Khoản Sử Dụng, Thông Báo Về Quyền Riêng Tư, Thông Báo Về Cookies của La Vie, Thể lệ chương trình Yên một chút cùng La Vie như được đăng tải tại website
                    </span>
                  </label>
                </div>

                <div className="flex justify-center gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={onLogin}
                    style={{
                      width: '266px',
                      height: '48px',
                      borderRadius: '8px',
                      gap: '8px',
                      opacity: 1,
                      paddingTop: '12px',
                      paddingRight: '28px',
                      paddingBottom: '12px',
                      paddingLeft: '28px',
                      borderWidth: '1px',
                      border: '1px solid #333435',
                    }}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    className="text-white"
                    style={{
                      width: '266px',
                      height: '48px',
                      borderRadius: '8px',
                      gap: '8px',
                      opacity: 1,
                      paddingTop: '12px',
                      paddingRight: '28px',
                      paddingBottom: '12px',
                      paddingLeft: '28px',
                      background: '#00579F',
                    }}
                    onClick={onRegister}
                  >
                    Đăng ký ngay
                  </Button>
                </div>

                <p className="text-xs text-gray-600 text-center pt-2">
                  *Đăng kí để chia sẻ cảm xúc ngày hôm nay và nhận được quà từ chương trình nhé!
                </p>

                <div className="text-center pt-2">
                  <span 
                    className="font-nunito"
                    style={{
                      fontFamily: 'Nunito',
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '24px',
                      letterSpacing: '0%',
                      color: '#333435',
                    }}
                  >
                    Bạn đã có tài khoản?{' '}
                  </span>
                  <button 
                    className="font-nunito underline"
                    onClick={onLogin}
                    style={{
                      fontFamily: 'Nunito',
                      fontWeight: 600,
                      fontSize: '16px',
                      lineHeight: '24px',
                      letterSpacing: '0%',
                      textDecoration: 'underline',
                      textDecorationStyle: 'solid',
                      color: '#333435',
                    }}
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
