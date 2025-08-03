import '../styles/globals.scss';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AV女優・動画検索 | あなた好みの厳選作品を発見',
  description: 'AV女優や動画を、あなたの好みに合わせて厳選。検索・絞り込みも簡単。最速でお気に入り作品に出会える！',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
