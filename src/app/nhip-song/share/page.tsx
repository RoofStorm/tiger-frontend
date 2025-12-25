import { Metadata } from 'next';
import Image from 'next/image';

interface SharePageProps {
  searchParams: Promise<{
    imageUrl: string;
    whisper?: string;
    reminder?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: SharePageProps): Promise<Metadata> {
  const params = await searchParams;
  const imageUrl = params.imageUrl;
  const whisper = params.whisper || '';
  const reminder = params.reminder || '';

  // Tạo title từ reminder hoặc whisper
  let title = '';
  if (reminder) {
    const shortReminder = reminder.length > 50 ? reminder.substring(0, 50) + '...' : reminder;
    title = `${shortReminder} - TIGER Nhịp Sống`;
  } else if (whisper) {
    const shortWhisper = whisper.length > 50 ? whisper.substring(0, 50) + '...' : whisper;
    title = `"${shortWhisper}" - TIGER Nhịp Sống`;
  } else {
    title = 'Mood Card - TIGER Nhịp Sống';
  }

  // Tạo description
  let description = '';
  if (whisper && reminder) {
    description = `"${whisper}"\n\n${reminder}\n\n#TIGERNhịpSống #MoodCard`;
  } else if (whisper) {
    description = `"${whisper}"\n\n#TIGERNhịpSống #MoodCard`;
  } else if (reminder) {
    description = `${reminder}\n\n#TIGERNhịpSống #MoodCard`;
  } else {
    description = 'Khám phá cảm xúc của bạn qua mood card. Cùng TIGER tham gia thử thách Giữ Nhịp nhé.';
  }

  // Ưu tiên HTTPS production URL cho Facebook preview
  const baseUrl =
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    process.env.NEXTAUTH_URL ||
    'https://tiger-corporation-vietnam.vn';
  const shareUrl = `${baseUrl}/nhip-song/share?imageUrl=${encodeURIComponent(imageUrl)}&whisper=${encodeURIComponent(whisper)}&reminder=${encodeURIComponent(reminder)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: shareUrl,
      siteName: 'TIGER Nhịp Sống',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    // Thêm meta tags riêng biệt để đảm bảo Facebook nhận diện
    other: {
      'og:url': shareUrl,
      'og:image': imageUrl,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': title,
    },
  };
}

export default async function SharePage({
  searchParams,
}: SharePageProps) {
  const params = await searchParams;
  const imageUrl = params.imageUrl;
  const whisper = params.whisper || '';
  const reminder = params.reminder || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            TIGER Nhịp Sống
          </h1>
          <p className="text-lg text-gray-600">
            Mood là khởi đầu - Giữ nhịp là điều bạn tự tạo nên mỗi ngày
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {imageUrl && (
            <div className="mb-6">
              <Image
                src={imageUrl}
                alt="Mood Card"
                width={800}
                height={600}
                className="w-full h-auto rounded-lg"
                sizes="(max-width: 768px) 800px, 1200px"
                priority
                quality={90}
              />
            </div>
          )}

          {whisper && (
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Whisper:</h2>
              <p className="text-gray-700 leading-relaxed">{whisper}</p>
            </div>
          )}

          {reminder && (
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Reminder:</h2>
              <p className="text-gray-700 leading-relaxed">{reminder}</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Cùng TIGER tham gia thử thách Giữ Nhịp nhé.
          </p>
          <a
            href="/nhip-song"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tạo mood card của bạn
          </a>
        </div>
      </div>
    </div>
  );
}

