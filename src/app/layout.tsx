import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>AV女優・動画検索 | あなた好みの厳選作品を発見</title>
        <meta name="description" content="AV女優や動画を、あなたの好みに合わせて厳選。検索・絞り込みも簡単。最速でお気に入り作品に出会える！" />

        {/* OGPタグ */}
        <meta property="og:title" content="AV女優・動画検索 | あなた好みの厳選作品を発見" />
        <meta property="og:description" content="あなたの好みに合わせたAV女優・動画を検索できるサービスです。" />
        <meta property="og:image" content="https://yourdomain.com/ogp.jpg" />
        <meta property="og:url" content="https://adult-serch-hnsz.vercel.app/" />
        <meta property="og:type" content="website" />
      </Head>
      {/* コンテンツ */}
    </>
  );
}
