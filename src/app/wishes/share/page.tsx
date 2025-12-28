import { Metadata } from 'next';
import Image from 'next/image';

interface SharePageProps {
  searchParams: Promise<{
    wishId?: string;
    content?: string;
    imageUrl?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: SharePageProps): Promise<Metadata> {
  const params = await searchParams;
  const content = params.content || '';
  const wishId = params.wishId || '';
  
  // Parse imageUrl từ query params - chỉ dùng nếu có
  const imageUrl = params.imageUrl;
  

  // Tạo title từ content
  let title = 'Lời chúc từ Tiger Mood Corner';
  if (content) {
    const shortContent = content.length > 50 ? content.substring(0, 50) + '...' : content;
    title = `${shortContent} - Tiger Mood Corner`;
  }

  // Tạo description
  const description = content
    ? `${content.substring(0, 160)}${content.length > 160 ? '...' : ''}`
    : 'Khám phá thế giới cảm xúc qua những lời chúc đặc biệt. Cùng TIGER chia sẻ lời chúc của bạn.';

  // Ưu tiên HTTPS production URL cho Facebook preview
  const baseUrl =
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    process.env.NEXTAUTH_URL ||
    'https://tiger-corporation-vietnam.vn';
  
  // Đảm bảo imageUrl được encode đúng cách
  const shareUrlParams = new URLSearchParams({
    ...(wishId && { wishId }),
    ...(content && { content }),
    ...(imageUrl && { imageUrl }),
  });
  const shareUrl = `${baseUrl}/wishes/share?${shareUrlParams.toString()}`;

  // Chỉ thêm images vào metadata nếu có imageUrl
  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      url: shareUrl,
      siteName: 'Tiger Mood Corner',
      type: 'website',
      locale: 'vi_VN',
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
    // Thêm meta tags riêng biệt để đảm bảo Facebook nhận diện
    other: {
      'og:url': shareUrl,
      ...(imageUrl && {
        'og:image': imageUrl,
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:alt': title,
      }),
    },
  };

  return metadata;
}

export default async function WishSharePage({
  searchParams,
}: SharePageProps) {
  const params = await searchParams;
  const content = params.content || '';
  
  // Parse imageUrl từ query params - chỉ dùng nếu có
  const imageUrl = params.imageUrl;
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Lời chúc từ Tiger Mood Corner
          </h1>
          <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💝</span>
          </div>
        </div>

        {content && (
          <div className="relative bg-gray-50 rounded-xl p-8 mb-8">
            <div className="absolute top-4 left-4 text-4xl text-gray-300 font-bold">
              &ldquo;
            </div>
            <div className="absolute bottom-4 right-4 text-4xl text-gray-300 font-bold">
              &rdquo;
            </div>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed px-8 py-4 italic">
              {content}
            </p>
          </div>
        )}

        {imageUrl && (
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Khám phá thế giới cảm xúc qua những lời chúc đặc biệt
            </p>
            <div className="flex justify-center">
              <Image
                src={imageUrl}
                alt="Tiger Mood Corner"
                width={400}
                height={300}
                className="rounded-lg"
                sizes="(max-width: 768px) 400px, 800px"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

