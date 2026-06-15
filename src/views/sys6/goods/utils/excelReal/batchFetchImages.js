import { normalizeImageUrlForFetch } from "./imageUrl.js";
import { fetchImageBuffer } from "./fetchImage.js";
import { excelExportLog } from "./exportLog.js";

/** 默认并发：同一 CDN 过高可能被限流，6～8 较稳 */
export const DEFAULT_IMAGE_FETCH_CONCURRENCY = 8;

/**
 * 对唯一 URL 并发 fetch，返回 Map（key 为 normalizeImageUrlForFetch 结果）
 * @param {string[]} rawUrls
 * @param {number} [concurrency]
 * @param {{ onFetchProgress?: (done: number, total: number) => void }} [opts]
 * @returns {Promise<Map<string, { buffer: ArrayBuffer, ext: string } | null>>}
 */
export async function buildImageBufferMap(rawUrls, concurrency, opts) {
  const limit = concurrency ?? DEFAULT_IMAGE_FETCH_CONCURRENCY;
  const onFetchProgress = opts?.onFetchProgress;
  const entries = [];
  const seen = new Set();
  for (const raw of rawUrls) {
    if (raw == null || String(raw).trim() === "") continue;
    const key = normalizeImageUrlForFetch(raw);
    if (!key || !/^https?:\/\//i.test(key)) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({ key, raw });
  }
  const map = new Map();
  if (entries.length === 0) return map;

  const pool = Math.min(Math.max(1, limit), entries.length);
  let next = 0;
  let completed = 0;
  const t0 = typeof performance !== "undefined" ? performance.now() : 0;
  excelExportLog("info", "批量拉图开始", JSON.stringify({ uniqueUrls: entries.length, concurrency: pool }));

  async function worker() {
    let i;
    while ((i = next++) < entries.length) {
      const { key, raw } = entries[i];
      const result = await fetchImageBuffer(raw, {
        batch: `${i + 1}/${entries.length}`,
      });
      map.set(key, result);
      completed += 1;
      onFetchProgress?.(completed, entries.length);
    }
  }

  await Promise.all(Array.from({ length: pool }, () => worker()));

  {
    const ms = typeof performance !== "undefined" ? Math.round(performance.now() - t0) : 0;
    const ok = [...map.values()].filter(Boolean).length;
    excelExportLog("info", "批量拉图结束", `${ms}ms`, `成功 ${ok}/${entries.length}`);
  }

  return map;
}

/** 从做单 chunks 收集 imgUrl */
export function collectOrderImageUrls(chunks) {
  const out = [];
  for (const ch of chunks) {
    for (const s of ch.slots || []) {
      if (s && s.imgUrl) out.push(s.imgUrl);
    }
  }
  return out;
}

/** 从报货 chunks 收集 imgUrl */
export function collectReportImageUrls(chunks) {
  const out = [];
  for (const row of chunks) {
    for (let j = 0; j < 4; j++) {
      const it = row[j];
      if (it && it.imgUrl) out.push(it.imgUrl);
    }
  }
  return out;
}
