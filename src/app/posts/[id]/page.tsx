import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Post } from '@/types';
import { generatePostOGImage } from '@/lib/og-image';
import PostDetailClient from '@/components/PostDetailClient';

// Lấy post từ API thực
async function getPost(postId: string): Promise<Post | null> {
  try {
    // Use direct fetch instead of apiClient to avoid authentication issues on server-side
    const response = await fetch(`http://localhost:4000/api/posts/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(
        'Failed to fetch post:',
        response.status,
        response.statusText
      );
      return null;
    }

    const data = await response.json();

    // Chuyển đổi response từ API thành format Post
    if (data && data.data) {
      return {
        id: data.data.id,
        caption: data.data.caption,
        imageUrl: data.data.imageUrl || data.data.url,
        isHighlighted: data.data.isHighlighted,
        isLiked: false, // Default value, có thể cần logic khác
        likeCount: data.data.likeCount || 0,
        shareCount: data.data.shareCount || 0,
        commentCount: data.data.commentCount || 0,
        createdAt: data.data.createdAt,
        updatedAt: data.data.updatedAt,
        userId: data.data.userId,
        user: {
          id: data.data.user.id,
          name: data.data.user.name || 'Unknown User',
          email: data.data.user.email || '',
          points: 0, // Default value
          role: 'USER' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          avatar: data.data.user.avatarUrl || '',
        },
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return {
      title: 'Bài viết không tồn tại',
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000';
  const postUrl = `${baseUrl}/posts/${id}`;
  const ogImage = generatePostOGImage({
    imageUrl: `${baseUrl}/default-post-image.jpg`,
    title: post.caption || 'Bài viết nổi bật từ Tiger Mood Corner',
  });

  return {
    title: post.caption || 'Bài viết nổi bật từ Tiger Mood Corner',
    description: post.caption
      ? `${post.caption.substring(0, 160)}...`
      : 'Khám phá thế giới cảm xúc qua những emoji đặc biệt. Tạo mood card cá nhân và chia sẻ với cộng đồng.',
    openGraph: {
      title: post.caption || 'Bài viết nổi bật từ Tiger Mood Corner',
      description: post.caption
        ? `${post.caption.substring(0, 160)}...`
        : 'Khám phá thế giới cảm xúc qua những emoji đặc biệt. Tạo mood card cá nhân và chia sẻ với cộng đồng.',
      url: postUrl,
      siteName: 'Tiger Mood Corner',
      images: [ogImage],
      locale: 'vi_VN',
      type: 'article',
      publishedTime: post.createdAt,
      authors: [post.user.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.caption || 'Bài viết nổi bật từ Tiger Mood Corner',
      description: post.caption
        ? `${post.caption.substring(0, 160)}...`
        : 'Khám phá thế giới cảm xúc qua những emoji đặc biệt. Tạo mood card cá nhân và chia sẻ với cộng đồng.',
      images: [ogImage.url],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return <PostDetailClient post={post} />;
}
