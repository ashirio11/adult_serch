'use server';

import {
  fetchActressId,
  fetchItemsByActressId,
  fetchItemsByKeyword,
  fetchActresses,
} from '../lib/dmmApi';

type DmmItem = {
  content_id: string;
  [key: string]: unknown;
};

type DmmActress = {
  id: string;
  cup?: string;
  [key: string]: unknown;
};

export async function searchItems(
  actressName: string,
  keyword: string,
  cups: string[]
): Promise<DmmItem[]> {
  const items: DmmItem[] = [];

  // 1️⃣ 女優名指定 → 女優ID → 動画取得
  if (actressName) {
    const actressId = await fetchActressId(actressName);
    if (actressId) {
      const fetched = await fetchItemsByActressId(actressId);
      items.push(...fetched);
    }
  }

  // 2️⃣ キーワード指定 → 動画取得
  if (keyword) {
    const fetched = await fetchItemsByKeyword(keyword);
    items.push(...fetched);
  }

  // 3️⃣ カップ数指定 → 女優一覧 → 各女優の動画取得
  if (cups.length > 0) {
    let offset = 1;
    let totalFetched = 0;
    const actressIds = new Set<string>();

    while (totalFetched < 300) {
      const actresses: DmmActress[] = await fetchActresses(offset);
      if (actresses.length === 0) break;

      for (const actress of actresses) {
        if (actress.cup && cups.includes(actress.cup) && actress.id) {
          actressIds.add(actress.id);
        }
      }

      totalFetched += actresses.length;
      offset += 100;
    }

    for (const id of actressIds) {
      const fetched = await fetchItemsByActressId(id);
      items.push(...fetched);
    }
  }

  // 4️⃣ 重複削除（content_idベース）
  const uniqueMap = new Map<string, DmmItem>();
  for (const item of items) {
    if (!uniqueMap.has(item.content_id)) {
      uniqueMap.set(item.content_id, item);
    }
  }

  return Array.from(uniqueMap.values()).slice(0, 100); // 最大100件
}
