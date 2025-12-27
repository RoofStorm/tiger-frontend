'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Tự động redirect về trang chủ ngay lập tức
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-2">Trang không tồn tại</p>
        <p className="text-sm text-gray-500 mb-6">
          Đang chuyển về trang chủ...
        </p>
      </div>
    </div>
  );
}

