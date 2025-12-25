import type { Metadata } from 'next';
import { Inter, Nunito, Noto_Sans, Prata } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { Providers } from '@/components/Providers';
import { AuthSuccessHandler } from '@/components/AuthSuccessHandler';
import { HeaderWrapper } from '@/components/HeaderWrapper';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });
const nunito = Nunito({ subsets: ['latin', 'vietnamese'], variable: '--font-nunito' });
const notoSans = Noto_Sans({ subsets: ['latin', 'vietnamese'], variable: '--font-noto-sans' });
const prata = Prata({ subsets: ['latin'], weight: '400', variable: '--font-prata' });

export const metadata: Metadata = {
  title: 'TIGER - Social Mood & Rewards 2',
  description:
    'Chia sẻ cảm xúc, nhận phần thưởng - Nền tảng kết nối cộng đồng qua những khoảnh khắc ý nghĩa',
  keywords: 'mood, social, rewards, community, vietnam, cảm xúc, cộng đồng',
  authors: [{ name: 'TIGER Team' }],
  openGraph: {
    title: 'TIGER - Social Mood & Rewards 3',
    description:
      'Chia sẻ cảm xúc, nhận phần thưởng - Nền tảng kết nối cộng đồng qua những khoảnh khắc ý nghĩa',
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TIGER - Social Mood & Rewards 4',
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
    <html lang="vi" data-scroll-behavior="smooth">
      <body className={`${inter.className} ${nunito.variable} ${notoSans.variable} ${prata.variable}`}>
        <Providers>
          <Suspense fallback={null}>
            <AuthSuccessHandler />
          </Suspense>
          <HeaderWrapper />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
