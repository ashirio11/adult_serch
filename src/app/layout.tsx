export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <title>AV女優・動画検索 | あなた好みの厳選作品を発見</title>
        <meta
          name="description"
          content="AV女優や動画を、あなたの好みに合わせて厳選。検索・絞り込みも簡単。最速でお気に入り作品に出会える！"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <meta name="google-site-verification" content="4gUtlL7KwbUJHn8PUnCLWin8_P86TfkWOTHGUcEyGV0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
