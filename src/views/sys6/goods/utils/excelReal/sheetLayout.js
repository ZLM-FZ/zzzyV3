/**
 * exceljs：行高为磅；图片 `ext` 为像素（对齐 excelFormat 160×160）
 * 勿用 tl+br 双格锚点拉伸：Excel 易把水平框算成极窄 → 图变竖条畸变
 */
export const PX_TO_ROW_PT = 72 / 96;

/** 含商品图的首行行高（磅），须兜住 160px 图 + 上边距，避免压到下一行 */
export function imageRowHeightPt(imageHeightPx, extraPadPt = 22) {
  const fromPx = Math.ceil(imageHeightPx * PX_TO_ROW_PT);
  return Math.min(409, fromPx + extraPadPt);
}

/** 正文行高（磅），与早期真 xlsx / HTML 默认行接近 */
export const TEXT_ROW_PT = 20;

/** 做单表「订单备注」行相对正文行高的倍数（长文换行，下限；实际行高会按字数动态加大） */
export const ORDER_REMARK_ROW_HEIGHT_MULT = 3;

/** 整张表正文字号（磅），做单/报货共用 */
export const SHEET_FONT_PT = 10;
export const SHEET_FONT_NAME = "Microsoft YaHei";

/** 备注行：每估算换行约占用磅值（字高 + 行距），上限受 Excel 行高 409 限制 */
const REMARK_LINE_HEIGHT_PT = Math.max(15, Math.round(SHEET_FONT_PT * 1.5));
const REMARK_ROW_PAD_PT = 8;

/**
 * 按列宽（Excel 字符宽）粗估换行行数，用于订单备注行高，避免长文仍被裁切。
 * @param {string} [text]
 * @param {number} columnWidthCh `ws.getColumn` 的 width，与 LEGACY_DATA_COL_WIDTH 一致
 */
export function estimateOrderRemarkRowHeightPt(text, columnWidthCh) {
  const colW = columnWidthCh > 0 ? columnWidthCh : LEGACY_DATA_COL_WIDTH;
  const charsPerLine = Math.max(10, Math.round(colW * 0.82));
  const s = String(text ?? "").replace(/\r\n/g, "\n");
  let lines = 0;
  if (!s.trim()) {
    lines = 1;
  } else {
    for (const raw of s.split("\n")) {
      const p = raw.length ? raw : " ";
      lines += Math.max(1, Math.ceil(p.length / charsPerLine));
    }
  }
  const fromContent = lines * REMARK_LINE_HEIGHT_PT + REMARK_ROW_PAD_PT;
  const floor = TEXT_ROW_PT * ORDER_REMARK_ROW_HEIGHT_MULT;
  return Math.min(409, Math.max(floor, fromContent));
}

/** 做单 A 列仅红色组序号（indexOrderTable 大号数字） */
export const SHEET_LEFT_INDEX_FONT_PT = 54;

export const EMBED_IMAGE_W = 200;
export const EMBED_IMAGE_H = 200;

/** parity：200px 宽 ÷ ~7px/字符宽 ≈ 29 */
export const LEGACY_DATA_COL_WIDTH = 38;
/** 窄间隔列，仍能完整显示表头 `empty0-` */
export const LEGACY_EMPTY_COL_WIDTH = 10;
export const LEGACY_LEFT_COL_WIDTH = 19;

export const LEGACY_ORDER_HEADER_ROW_PT = 26;
export const LEGACY_REPORT_HEADER_ROW_PT = 28;
/** 报货表每格第三行（产品/款式名），高于尺码行便于长名换行 */
export const REPORT_PRODUCT_NAME_ROW_PT = 40;
/** 报货表含商品图的数据列宽（Excel 字符宽），宽于做单同款列以留白 */
export const REPORT_PIC_COL_WIDTH = 42;
/** 四列为一组换行时插入的空白分隔行高度（磅） */
export const EXPORT_BLOCK_GAP_ROW_PT = 18;

/** 首行 td height=200 时的额外磅值，与 160px 图 + 上下留白一致 */
export const LEGACY_IMAGE_ROW_EXTRA_PT = 16;

/**
 * 单格锚点 + 固定 ext；水平按列宽约等于居中（对齐旧 td align=center）
 * @param {import('exceljs').Worksheet} ws
 */
export function imageAnchorInDataCell(ws, dataCol1Based, excelRow1Based) {
  const wCh = ws.getColumn(dataCol1Based).width ?? LEGACY_DATA_COL_WIDTH;
  const colPx = Math.max(80, wCh * 7 + 5);
  const xFrac = Math.max(
    0.04,
    Math.min(0.42, (colPx - EMBED_IMAGE_W) / 2 / colPx)
  );
  const c0 = dataCol1Based - 1;
  const r0 = excelRow1Based - 1;
  return {
    tl: { col: c0 + xFrac, row: r0 + 0.06 },
    ext: { width: EMBED_IMAGE_W, height: EMBED_IMAGE_H },
    editAs: "oneCell",
  };
}

export function imageAnchorInPicColumn(ws, picCol1Based, excelRow1Based) {
  return imageAnchorInDataCell(ws, picCol1Based, excelRow1Based);
}

/** 细线，与旧版 `border="1"` / parity 文档一致 */
export const EXCEL_CARD_BORDER_SIDE = {
  style: "thin",
  color: { argb: "FF000000" },
};

export function applyCardBorder(cell) {
  cell.border = {
    top: EXCEL_CARD_BORDER_SIDE,
    left: EXCEL_CARD_BORDER_SIDE,
    bottom: EXCEL_CARD_BORDER_SIDE,
    right: EXCEL_CARD_BORDER_SIDE,
  };
}

/** 旧版做单/报货 `<td height=200 width=200>` 首行占位（像素） */
export const LEGACY_IMAGE_TD_PX = 200;

export function orderSheetImageRowPt() {
  return imageRowHeightPt(LEGACY_IMAGE_TD_PX, LEGACY_IMAGE_ROW_EXTRA_PT);
}
