import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { AuthSuccessHandler } from '@/components/AuthSuccessHandler';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tiger - Social Mood & Rewards',
  description:
    'Chia sẻ cảm xúc, nhận phần thưởng - Nền tảng kết nối cộng đồng qua những khoảnh khắc ý nghĩa',
  keywords: 'mood, social, rewards, community, vietnam, cảm xúc, cộng đồng',
  authors: [{ name: 'Tiger Team' }],
  openGraph: {
    title: 'Tiger - Social Mood & Rewards',
    description:
      'Chia sẻ cảm xúc, nhận phần thưởng - Nền tảng kết nối cộng đồng qua những khoảnh khắc ý nghĩa',
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tiger - Social Mood & Rewards',
    description:
      'Chia sẻ cảm xúc, nhận phần thưởng - Nền tảng kết nối cộng đồng qua những khoảnh khắc ý nghĩa',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <Providers>
          <AuthSuccessHandler />
          {children}
        </Providers>
      </body>
    </html>
  );
}
