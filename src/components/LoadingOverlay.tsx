'use client';

import React from 'react';
import { useLoading } from '@/contexts/LoadingContext';

export function LoadingOverlay() {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>

          {/* Loading Message */}
          <div className="text-center">
            <p className="text-gray-900 font-medium">{loadingMessage}</p>
            <p className="text-gray-500 text-sm mt-1">
              Vui lòng chờ trong giây lát...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
