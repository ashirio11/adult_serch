const BASE_URL = 'https://api.dmm.com/affiliate/v3/';
const API_ID = 'huPPFMrFc76bHbCs9nLX';
const AFFILIATE_ID = 'ashirio-990';
const commonParams = `api_id=${API_ID}&affiliate_id=${AFFILIATE_ID}&output=json`;

// 女優検索キャッシュ用Map
const actressCache = new Map<string, any[]>();

// 共通fetch関数（エラーハンドリング付き）
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

// 女優IDを取得
export async function fetchActressId(keyword: string): Promise<string | null> {
  const url = `${BASE_URL}ActressSearch?${commonParams}&keyword=${encodeURIComponent(keyword)}&hits=1&offset=1`;
  const result = await fetchFromDmm<{ actress?: { id: string }[] }>(url);
  return result?.actress?.[0]?.id ?? null;
}

// 女優IDから動画一覧取得
export async function fetchItemsByActressId(actressId: string) {
  const url = `${BASE_URL}ItemList?${commonParams}&site=FANZA&service=digital&floor=videoa&hits=100&sort=date&article[]=actress&article_id[]=${actressId}`;
  const result = await fetchFromDmm<{ items?: any[] }>(url);
  return result?.items ?? [];
}

// キーワードから動画一覧取得
export async function fetchItemsByKeyword(keyword: string) {
  const url = `${BASE_URL}ItemList?${commonParams}&site=FANZA&service=digital&floor=videoa&hits=100&sort=date&keyword=${encodeURIComponent(keyword)}`;
  const result = await fetchFromDmm<{ items?: any[] }>(url);
  return result?.items ?? [];
}

// 女優一覧取得（キャッシュ付き）
async function fetchActressesWithParams(paramsObj: Record<string, string>) {
  // URLSearchParams作成
  const params = new URLSearchParams(commonParams);
  Object.entries(paramsObj).forEach(([key, val]) => {
    if (val) params.append(key, val);
  });

  const cacheKey = `actresses:${params.toString()}`;
  if (actressCache.has(cacheKey)) {
    return actressCache.get(cacheKey)!;
  }

  const url = `${BASE_URL}ActressSearch?${params.toString()}`;
  const result = await fetchFromDmm<{ actress?: any[] }>(url);
  const actresses = result?.actress ?? [];

  actressCache.set(cacheKey, actresses);
  return actresses;
}

// 身長で女優一覧取得（例：gte_height, lte_height）
export async function fetchActressesByHeight(heightMin: string, heightMax: string) {
  return fetchActressesWithParams({
    gte_height: heightMin,
    lte_height: heightMax,
    hits: '50',
    offset: '1',
  });
}

// 年齢で女優一覧取得（例：gte_age, lte_age）
export async function fetchActressesByAge(ageMin: string, ageMax: string) {
  return fetchActressesWithParams({
    gte_age: ageMin,
    lte_age: ageMax,
    hits: '50',
    offset: '1',
  });
}

// カップで女優一覧取得（例：cup）
export async function fetchActressesByCup(cups: string[]) {
  // カップは複数選択があるため、Promise.allで複数リクエスト並列実行
  const promises = cups.map((cup) =>
    fetchActressesWithParams({
      cup,
      hits: '50',
      offset: '1',
    })
  );
  const results = await Promise.all(promises);
  // 重複排除して一つにまとめる
  const allActresses = results.flat();
  const uniqueMap = new Map<string, any>();
  allActresses.forEach((a) => {
    if (!uniqueMap.has(a.id)) uniqueMap.set(a.id, a);
  });
  return Array.from(uniqueMap.values());
}

// まとめて複数条件（身長・年齢・カップ）で女優一覧取得
export async function fetchActressesByMultipleConditions(
  heightMin: string,
  heightMax: string,
  ageMin: string,
  ageMax: string,
  cups: string[]
) {
  // 身長と年齢はまとめて一回のAPI呼び出しで指定可能
  const actressesByHeightAndAge = await fetchActressesWithParams({
    gte_height: heightMin,
    lte_height: heightMax,
    gte_age: ageMin,
    lte_age: ageMax,
    hits: '50',
    offset: '1',
  });

  if (cups.length === 0) return actressesByHeightAndAge;

  // カップでの絞り込みは複数リクエストになるため並列化
  const actressesByCup = await fetchActressesByCup(cups);

  // 身長・年齢とカップの両方にいる女優だけ残す（AND条件）
  const cupIds = new Set(actressesByCup.map((a) => a.id));
  return actressesByHeightAndAge.filter((a) => cupIds.has(a.id));
}
