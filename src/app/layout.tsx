import '../styles/globals.scss';

export const metadata = {
  title: '商品＆女優検索',
  description: 'FANZA検索ツール',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
