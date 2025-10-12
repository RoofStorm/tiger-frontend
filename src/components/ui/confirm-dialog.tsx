'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, X, CheckCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
          confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
          borderClass: 'border-red-200',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
          confirmButtonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          borderClass: 'border-yellow-200',
        };
      case 'info':
        return {
          icon: <CheckCircle className="w-8 h-8 text-blue-500" />,
          confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
          borderClass: 'border-blue-200',
        };
      default:
        return {
          icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
          confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
          borderClass: 'border-red-200',
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {styles.icon}
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-600 leading-relaxed">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="px-6"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-6 ${styles.confirmButtonClass}`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
