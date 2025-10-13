import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  userName?: string;
  onLogout: () => void;
}

export const AdminHeader = ({ userName, onLogout }: AdminHeaderProps) => {
  const router = useRouter();

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Quản lý CMS
          </h1>
          <p className="text-gray-600">
            Chào mừng {userName}, quản lý hệ thống Tiger
          </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-sm"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Về trang chủ</span>
            <span className="sm:hidden">Trang chủ</span>
          </Button>
          <Button
            variant="outline"
            onClick={onLogout}
            className="flex items-center space-x-2 text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200 hover:border-red-300 text-sm"
            size="sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
            <span className="sm:hidden">Thoát</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
