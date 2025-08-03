'use server';

import {
  fetchActressId,
  fetchItemsByActressId,
  fetchItemsByKeyword,
  fetchActresses
} from '../lib/dmmApi';

export async function searchItems(actressName: string, keyword: string, cups: string[]) {
  let items: any[] = [];

  // 1️⃣ 女優名指定
  if (actressName) {
    const actressId = await fetchActressId(actressName);
    if (actressId) {
      const res = await fetchItemsByActressId(actressId);
      items.push(...(res.result?.items || []));
    }
  }

  // 2️⃣ キーワード指定
  if (keyword) {
    const res = await fetchItemsByKeyword(keyword);
    items.push(...(res.result?.items || []));
  }

  // 3️⃣ カップ数指定
  if (cups.length > 0) {
    let offset = 1;
    let totalFetched = 0;
    const actressIds = new Set<string>();

    while (totalFetched < 300) {  // 300件まで回す（必要に応じて調整）
      const res = await fetchActresses(offset);
      const actresses = res.result?.actress || [];
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
      const res = await fetchItemsByActressId(id);
      items.push(...(res.result?.items || []));
    }
  }

  // 4️⃣ 重複削除
  const uniqueMap = new Map<string, any>();
  for (const item of items) {
    if (!uniqueMap.has(item.content_id)) {
      uniqueMap.set(item.content_id, item);
    }
  }

  return Array.from(uniqueMap.values()).slice(0, 100);
}
