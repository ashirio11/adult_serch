const BASE_URL = 'https://api.dmm.com/affiliate/v3/';
const API_ID = 'huPPFMrFc76bHbCs9nLX';
const AFFILIATE_ID = 'ashirio-990';
const commonParams = `api_id=${API_ID}&affiliate_id=${AFFILIATE_ID}&output=json`;

// 型定義（必要なら明確化を）
type DmmItem = {
  content_id: string;
  [key: string]: unknown;
};

type DmmActress = {
  id: string;
  name?: string;
  cup?: string;
  [key: string]: unknown;
};

// キャッシュ
const actressCache = new Map<string, DmmActress[]>();

// 共通Fetch関数
async function fetchFromDmm<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return json.result ?? null;
  } catch (error) {
    console.error(`DMM API fetch failed: ${error}`);
    return null;
  }
}

// 女優ID取得
export async function fetchActressId(keyword: string): Promise<string | null> {
  const url = `${BASE_URL}ActressSearch?${commonParams}&keyword=${encodeURIComponent(keyword)}&hits=1`;
  const result = await fetchFromDmm<{ actress?: DmmActress[] }>(url);
  return result?.actress?.[0]?.id ?? null;
}

// 女優ID → 動画一覧取得
export async function fetchItemsByActressId(actressId: string): Promise<DmmItem[]> {
  const url = `${BASE_URL}ItemList?${commonParams}&site=FANZA&service=digital&floor=videoa&hits=100&sort=date&article[]=actress&article_id[]=${actressId}`;
  const result = await fetchFromDmm<{ items?: DmmItem[] }>(url);
  return result?.items ?? [];
}

// キーワード → 動画一覧取得
export async function fetchItemsByKeyword(keyword: string): Promise<DmmItem[]> {
  const url = `${BASE_URL}ItemList?${commonParams}&site=FANZA&service=digital&floor=videoa&hits=100&sort=date&keyword=${encodeURIComponent(keyword)}`;
  const result = await fetchFromDmm<{ items?: DmmItem[] }>(url);
  return result?.items ?? [];
}

// 🔄 女優一覧取得（自由パラメータ + キャッシュ）
export async function fetchActresses(offset = 1): Promise<DmmActress[]> {
  const params = new URLSearchParams(commonParams);
  params.set('offset', offset.toString());
  params.set('hits', '100');

  const cacheKey = `actresses:${offset}`;
  if (actressCache.has(cacheKey)) return actressCache.get(cacheKey)!;

  const url = `${BASE_URL}ActressSearch?${params.toString()}`;
  const result = await fetchFromDmm<{ actress?: DmmActress[] }>(url);
  const actresses = result?.actress ?? [];

  actressCache.set(cacheKey, actresses);
  return actresses;
}
