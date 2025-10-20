import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Send, Heart } from 'lucide-react';
import apiClient from '@/lib/api';

export const WishForm = () => {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createWishMutation = useMutation({
    mutationFn: (content: string) => apiClient.createWish(content),
    onSuccess: result => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['highlighted-wishes'] });
      // Invalidate user details to refresh points
      queryClient.invalidateQueries({ queryKey: ['userDetails'] });
      // Invalidate point logs to refresh point history
      queryClient.invalidateQueries({ queryKey: ['pointHistory'] });

      // Show success message with points info
      toast({
        title: 'Gửi lời chúc thành công!',
        description: result.pointsMessage || 'Lời chúc của bạn đã được gửi!',
        variant: 'success',
        duration: 4000,
      });
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi lời chúc. Vui lòng thử lại.',
        variant: 'destructive',
        duration: 4000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createWishMutation.mutate(content.trim());
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Heart className="w-6 h-6 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900">Gửi lời chúc</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lời chúc của bạn
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Hãy chia sẻ lời chúc của bạn..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={1000}
            required
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {content.length}/1000 ký tự
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!content.trim() || createWishMutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {createWishMutation.isPending ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang gửi...
              </span>
            ) : (
              <span className="flex items-center">
                <Send className="w-4 h-4 mr-2" />
                Gửi lời chúc
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
