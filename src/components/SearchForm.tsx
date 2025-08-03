'use client';

import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { fetchActressId, fetchItemsByActressId, fetchItemsByKeyword } from '../lib/dmmApi';

export type SearchFormHandle = {
  searchWithActress: (name: string) => void;
};

const getAffiliateUrl = (originalUrl: string) => {
  const encodedUrl = encodeURIComponent(originalUrl);
  return `https://al.dmm.co.jp/?lurl=${encodedUrl}&af_id=ashirio-001&ch=search_link&ch_id=link`;
};


type Props = {
  defaultActressName: string;
};

export const SearchForm = forwardRef<SearchFormHandle, Props>(({ defaultActressName }, ref) => {
  const [actressName, setActressName] = useState(defaultActressName);
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const [onlySingle, setOnlySingle] = useState(false);
  const [excludeVR, setExcludeVR] = useState(false);

  useEffect(() => {
    if (defaultActressName) {
      setActressName(defaultActressName);
      handleSearch(defaultActressName, '', onlySingle, excludeVR);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultActressName]);

  const handleSearch = async (name = actressName, word = keyword, single = onlySingle, noVR = excludeVR) => {
  let results: any[] = [];

  if (name && word) {
    const actressId = await fetchActressId(name);
    if (actressId) {
      const actressItems = await fetchItemsByActressId(actressId);
      results = actressItems.filter((item: any) => item.title.includes(word));
    }
  } else if (name) {
    const actressId = await fetchActressId(name);
    if (actressId) {
      results = await fetchItemsByActressId(actressId);
    }
  } else if (word) {
    results = await fetchItemsByKeyword(word);
  }

 // 単体作品のみ
if (single) {
  results = results.filter((item) => {
    return item.iteminfo?.genre?.some((g: any) => g.name === '単体作品');
  });
}

  // ✅ VR除外
  if (noVR) {
    results = results.filter((item) => !item.title.includes('VR'));
  }
  console.log('検索結果', results);

  setItems(results);
  setSearched(true);
};


  useImperativeHandle(ref, () => ({
    searchWithActress: (name: string) => {
      setActressName(name);
      setKeyword('');
      handleSearch(name, '', onlySingle, excludeVR);
    }
  }));

  return (
    <div>
    <div className="search-input-row">
    <input
      type="text"
      value={actressName}
      onChange={(e) => setActressName(e.target.value)}
      placeholder="女優名"
    />
    <input
      type="text"
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
      placeholder="キーワード"
    />
  </div>
     <div className="search-options-row">
    <label>
      <input
        type="checkbox"
        checked={onlySingle}
        onChange={(e) => setOnlySingle(e.target.checked)}
      />
      単体作品のみ
    </label>
    <label>
      <input
        type="checkbox"
        checked={excludeVR}
        onChange={(e) => setExcludeVR(e.target.checked)}
      />
      VR作品を除く
    </label>
    <button onClick={() => handleSearch()}>検索</button>
  </div>

    {searched && (
  <div style={{ marginTop: '1rem' }}>
    {items.length === 0 ? (
      <p>該当する検索結果はありません</p>
    ) : (
     <div className="video-grid">
  {items
    .filter((item) => !!item.imageURL?.large)
    .map((item) => (
      <a
        key={item.content_id}
        href={getAffiliateUrl(item.URL)}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div className="video-card">
          <img src={item.imageURL.large} alt={item.title} style={{ width: '100%' }} />
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{item.title}</p>
        </div>
      </a>
    ))}
</div>

    )}
  </div>
)}
    </div>
  );
});

SearchForm.displayName = 'SearchForm';
