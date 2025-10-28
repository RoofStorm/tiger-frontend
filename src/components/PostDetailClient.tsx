'use client';

import { useGlobalNavigationLoading } from '@/hooks/useGlobalNavigationLoading';
import Image from 'next/image';
import { Post } from '@/types';

interface PostDetailClientProps {
  post: Post;
}

export default function PostDetailClient({ post }: PostDetailClientProps) {
  const { navigateWithLoading } = useGlobalNavigationLoading();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Post Image */}
          <div className="aspect-video relative overflow-hidden">
            <Image
              src={post.imageUrl}
              alt={post.caption || 'Post image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Highlight Badge */}
            {post.isHighlighted && (
              <div className="absolute top-4 left-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="font-semibold">Nổi bật</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-8">
            {/* User Info */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {post.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {post.user.name}
                </h3>
                <p className="text-gray-500 text-sm">
                  {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {post.caption || 'Bài viết nổi bật từ Tiger Mood Corner'}
              </h1>

              <p className="text-gray-700 text-lg leading-relaxed">
                {post.caption ||
                  'Khám phá thế giới cảm xúc qua những emoji đặc biệt. Tạo mood card cá nhân và chia sẻ với cộng đồng. Mỗi tổ hợp emoji sẽ mang đến một thông điệp ý nghĩa.'}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between py-6 border-t border-gray-200">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="font-medium">{post.likeCount || 0}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="font-medium">{post.commentCount || 0}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                  <span className="font-medium">{post.shareCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={() =>
                  navigateWithLoading('/', 'Đang chuyển về trang chủ...')
                }
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Quay lại trang chủ</span>
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
