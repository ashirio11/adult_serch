'use client';

import { useRef, useState, useEffect } from 'react';
import { ActressFullSearch } from '../components/ActressFullSearch';
import { SearchForm, SearchFormHandle } from '../components/SearchForm';

export default function Page() {
  const searchFormRef = useRef<SearchFormHandle>(null);
  const scrollTargetRef = useRef<HTMLDivElement>(null); // ✅ スクロール先
  const [selectedActress, setSelectedActress] = useState<string>('');

  useEffect(() => {
    if (selectedActress) {
      searchFormRef.current?.searchWithActress(selectedActress);
    }
  }, [selectedActress]);

  return (
    <main className="container" style={{ padding: '1rem' }}>
      {/* 追加部分 */}
      <h1 className="cute-title">AV女優、動画検索</h1>

      <div>条件を入力するとお気に入りの動画を探せます</div>
      <div>女優さんの検索は30秒程度かかります</div>

      <h2>💖 女優検索</h2>

      <ActressFullSearch
        onActressClick={(name) => {
          setSelectedActress(name);

          // ✅ スクロール処理を追加
          setTimeout(() => {
            scrollTargetRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
      />

      <hr style={{ margin: '2rem 0' }} />

      {/* ✅ スクロール先 */}
      <div ref={scrollTargetRef}></div>

      <h2>🎥 動画検索</h2>
      <SearchForm ref={searchFormRef} defaultActressName={selectedActress} />
    </main>
  );
}
