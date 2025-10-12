'use client';

import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  onConfirm?: () => void;
  isLoading?: boolean;
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    type: 'danger',
    isLoading: false,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setConfirmState({
        ...options,
        isOpen: true,
        onConfirm: () => resolve(true),
        isLoading: false,
      });
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setConfirmState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  return {
    confirm,
    closeConfirm,
    setLoading,
    confirmState,
  };
}
