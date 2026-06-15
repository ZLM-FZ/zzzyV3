import { normalizeImageUrlForFetch } from "./imageUrl.js";
import { excelExportLog } from "./exportLog.js";

function shortUrl(u) {
  if (!u) return "";
  return u.length > 72 ? `${u.slice(0, 36)}…${u.slice(-28)}` : u;
}

/**
 * @returns {Promise<{ buffer: ArrayBuffer, ext: 'jpeg'|'png' }|null>}
 */
export async function fetchImageBuffer(url, meta) {
  const u = normalizeImageUrlForFetch(url);
  if (!u || !/^https?:\/\//i.test(u)) {
    excelExportLog("info", "fetchImage skip (bad url)", meta || "", shortUrl(String(url)));
    return null;
  }
  const t0 = typeof performance !== "undefined" ? performance.now() : 0;
  excelExportLog("info", "fetchImage start", meta || "", shortUrl(u));
  try {
    const res = await fetch(u);
    if (!res.ok) {
      const ms = typeof performance !== "undefined" ? Math.round(performance.now() - t0) : 0;
      excelExportLog("warn", "fetchImage http fail", meta || "", String(res.status), `${ms}ms`);
      return null;
    }
    const buffer = await res.arrayBuffer();
    const ct = res.headers.get("content-type") || "";
    const ext = ct.includes("png") ? "png" : "jpeg";
    {
      const ms = typeof performance !== "undefined" ? Math.round(performance.now() - t0) : 0;
      excelExportLog(
        "info",
        "fetchImage ok",
        meta || "",
        `${ms}ms`,
        `${Math.round(buffer.byteLength / 1024)}KB`,
        ext
      );
    }
    return { buffer, ext };
  } catch (e) {
    const ms = typeof performance !== "undefined" ? Math.round(performance.now() - t0) : 0;
    excelExportLog("warn", "fetchImage error", meta || "", `${ms}ms`, e && e.message);
    return null;
  }
}
