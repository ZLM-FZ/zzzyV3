/**
 * 开发环境默认打印到控制台；生产环境可 localStorage.setItem('DEBUG_EXCEL_EXPORT', '1') 后刷新。
 * 页面「导出调试」区通过 setExcelExportUiLogSink 接收同一份日志（不依赖上述开关）。
 */
export function isExcelExportLogEnabled() {
  try {
    if (typeof localStorage !== "undefined" && localStorage.getItem("DEBUG_EXCEL_EXPORT") === "1") {
      return true;
    }
  } catch (e) {
    void e;
  }
  return typeof process !== "undefined" && process.env && process.env.NODE_ENV !== "production";
}

/** @type {null | ((entry: { line: string, level?: string, delta?: number }) => void)} */
let _uiSink = null;

/**
 * 由 Vue 挂载/卸载时注册，用于「导出调试」面板
 * @param {null | ((entry: { line: string, level?: string, delta?: number }) => void)} fn
 */
export function setExcelExportUiLogSink(fn) {
  _uiSink = fn && typeof fn === "function" ? fn : null;
}

let _t0 = 0;
export function xlLogReset() {
  _t0 = typeof performance !== "undefined" ? performance.now() : 0;
}

function formatDetail(detail) {
  if (detail === undefined) return "";
  if (detail === null) return "null";
  if (typeof detail === "object") {
    try {
      return JSON.stringify(detail);
    } catch (e) {
      return String(detail);
    }
  }
  return String(detail);
}

export function xlLog(phase, detail) {
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  const delta = _t0 ? Math.round(now - _t0) : 0;
  const d = formatDetail(detail);
  const line = d ? `[+${delta}ms] ${phase} ${d}` : `[+${delta}ms] ${phase}`;
  if (_uiSink) {
    _uiSink({ level: "info", delta, line });
  }
  if (!isExcelExportLogEnabled()) return;
  console.info(`[zuodan:excel] +${delta}ms`, phase, detail !== undefined ? detail : "");
}

/**
 * 与原先 console.info/warn 对齐的通用行（拉图细节等）
 * @param {'info'|'warn'|'error'} level
 * @param {...unknown} parts
 */
export function excelExportLog(level, ...parts) {
  const text = parts
    .map((p) => {
      if (p === undefined) return "";
      if (p === null) return "null";
      if (typeof p === "object") {
        try {
          return JSON.stringify(p);
        } catch (e) {
          return String(p);
        }
      }
      return String(p);
    })
    .filter((s) => s !== "")
    .join(" ");
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  const delta = _t0 ? Math.round(now - _t0) : 0;
  const line = `[+${delta}ms] [${level}] ${text}`;
  if (_uiSink) {
    _uiSink({ level, delta, line });
  }
  if (!isExcelExportLogEnabled()) return;
  if (level === "warn" || level === "error") {
    console.warn("[zuodan:excel]", text);
  } else {
    console.info("[zuodan:excel]", text);
  }
}
