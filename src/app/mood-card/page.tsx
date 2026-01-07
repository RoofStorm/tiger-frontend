import { Metadata } from 'next';
import { Suspense } from 'react';
import MoodCardDisplay from '@/app/mood-card/MoodCardDisplay';
import { EMOJI_OPTIONS } from '@/constants/emojis';

interface MoodCardPageProps {
  searchParams: Promise<{
    emojis?: string;
    whisper?: string;
    reminder?: string;
    imageUrl: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: MoodCardPageProps): Promise<Metadata> {
  const params = await searchParams;

  const emojiIds = params.emojis?.split(',') || [];
  const whisper = params.whisper || '';
  const reminder = params.reminder || '';

  // Map emoji IDs to emoji objects
  const emojis = emojiIds
    .map(id => EMOJI_OPTIONS.find(emoji => emoji.id === id))
    .filter(Boolean);
  // const emojiLabels = emojis.map(e => e?.label).join(', ');
  const emojiString = emojis.map(e => e?.emoji).join(' ');

  // Tạo title từ reminder thay vì emojis
  let title = '';
  if (reminder) {
    // Cắt reminder nếu quá dài (tối đa 50 ký tự)
    const shortReminder =
      reminder.length > 50 ? reminder.substring(0, 50) + '...' : reminder;
    title = `${shortReminder} - TIGER Nhịp Sống`;
  } else if (whisper) {
    // Fallback về whisper nếu không có reminder
    // const shortWhisper =
    //   whisper.length > 50 ? whisper.substring(0, 50) + '...' : whisper;
    title = `Hôm nay nhịp sống của bạn như thế nào? - Cùng TIGER giữ trọn nhịp sống`;
  } else {
    // Fallback về emoji labels nếu không có cả reminder và whisper
    title = `Cùng TIGER giữ trọn nhịp sống`;
  }

  // Tạo caption ngắn gọn cho Facebook preview
  let description = '';
  if (whisper && reminder) {
    description = `"${whisper}"\n\n${reminder}\n\n#TigerMoodCorner #MoodCard ${emojiString}`;
  } else if (whisper) {
    description = `"${whisper}"\n\n#TigerMoodCorner #MoodCard ${emojiString}`;
  } else if (reminder) {
    description = `${reminder}\n\n#TigerMoodCorner #MoodCard ${emojiString}`;
  } else {
    description = `Khám phá cảm xúc của bạn qua emoji: ${emojiString}\n\n#TigerMoodCorner #MoodCard`;
  }

  // Ưu tiên HTTPS production URL cho Facebook preview
  const baseUrl =
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    process.env.NEXTAUTH_URL ||
    'https://tiger-corporation-vietnam.vn'; // Fallback to production HTTPS URL
  const imageUrl = params.imageUrl;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/mood-card?emojis=${emojiIds.join(',')}&whisper=${encodeURIComponent(whisper)}&reminder=${encodeURIComponent(reminder)}`,
      siteName: 'Cùng TIGER giữ trọn nhịp sống',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    // Thêm meta tags riêng biệt để đảm bảo Facebook nhận diện
    other: {
      'og:image': imageUrl,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': title,
    },
  };
}

export default function MoodCardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
            TIGER Nhịp Sống
          </h1>
          <p className="text-lg text-gray-600">
            Khám phá cảm xúc của bạn qua emoji
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4">
                  <svg
                    className="animate-spin w-12 h-12 text-purple-600"
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
                </div>
                <p className="text-gray-600">Đang tải mood card...</p>
              </div>
            </div>
          }
        >
          <MoodCardDisplay />
        </Suspense>
      </div>
    </div>
  );
}
