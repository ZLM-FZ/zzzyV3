/**
 * 拉图 / 写 src 前统一协议，避免 // 与 https:https://
 * 历史数据里若有 _300x，拉图改为 _200x 减轻体积
 */
export function normalizeImageUrlForFetch(raw) {
  if (raw == null) return "";
  const s = String(raw).trim();
  if (!s) return "";
  let out;
  if (/^https?:\/\//i.test(s)) out = s;
  else if (s.startsWith("//")) out = "https:" + s;
  else out = "https://" + s.replace(/^\/+/, "");
  return out.replace(/_300x\./gi, "_200x.");
}
