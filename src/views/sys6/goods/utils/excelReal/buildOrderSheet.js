import ExcelJS from "exceljs";
import { normalizeImageUrlForFetch } from "./imageUrl.js";
import { buildImageBufferMap, collectOrderImageUrls } from "./batchFetchImages.js";
import { xlLog } from "./exportLog.js";
import {
  TEXT_ROW_PT,
  estimateOrderRemarkRowHeightPt,
  imageAnchorInDataCell,
  applyCardBorder,
  orderSheetImageRowPt,
  LEGACY_LEFT_COL_WIDTH,
  LEGACY_DATA_COL_WIDTH,
  LEGACY_EMPTY_COL_WIDTH,
  LEGACY_ORDER_HEADER_ROW_PT,
  EXPORT_BLOCK_GAP_ROW_PT,
  SHEET_FONT_PT,
  SHEET_FONT_NAME,
  SHEET_LEFT_INDEX_FONT_PT,
} from "./sheetLayout.js";
import { displayBdAndggCn } from "./patchDisplay.js";

const FILL_ORDER = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFE5E9F2" },
};

const LEFT_LABELS = [
  "买家",
  "购买选项",
  "客户备注定制",
  "补丁/规格",
  "尺寸",
  "订单号",
  "订单备注",
];

function toArgb(css) {
  if (css == null || css === "") return undefined;
  const s = String(css).trim();
  if (s === "red") return "FFFF0000";
  if (s === "blue") return "FF0000FF";
  if (s === "green") return "FF008000";
  if (s.startsWith("#") && s.length >= 7) return "FF" + s.slice(1, 7).toUpperCase();
  return undefined;
}

function colLet(c) {
  let s = "";
  let n = c;
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export async function buildOrderSheet(workbook, chunks, options) {
  const skipImages = options?.skipImages === true;
  const logCtx = options?.logContext || "做单";
  xlLog(`${logCtx} buildOrderSheet 开始`, { chunks: chunks.length });

  let imageMap = new Map();
  if (!skipImages) {
    const urls = collectOrderImageUrls(chunks);
    xlLog(`${logCtx} 预拉图片`, { cellRefs: urls.length });
    imageMap = await buildImageBufferMap(urls, options?.imageFetchConcurrency, {
      onFetchProgress: options?.onProgress,
    });
  }

  const ws = workbook.addWorksheet("Sheet1", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  const headers = ["left"];
  for (let j = 0; j < 4; j++) {
    headers.push(`data${j}`, `empty${j}-`);
  }
  const imgRowPt = orderSheetImageRowPt();
  for (let c = 1; c <= 9; c++) {
    ws.getColumn(c).width =
      c === 1
        ? LEGACY_LEFT_COL_WIDTH
        : c % 2 === 0
          ? LEGACY_DATA_COL_WIDTH
          : LEGACY_EMPTY_COL_WIDTH;
  }

  const hr = ws.getRow(1);
  hr.height = LEGACY_ORDER_HEADER_ROW_PT;
  headers.forEach((h, i) => {
    const cell = hr.getCell(i + 1);
    cell.value = h;
    cell.font = {
      bold: true,
      name: SHEET_FONT_NAME,
      size: SHEET_FONT_PT,
    };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    applyCardBorder(cell);
  });

  let r0 = 2;
  const rowsInBlock = 8;
  let chunkIdx = 0;
  for (const chunk of chunks) {
    chunkIdx += 1;
    xlLog(`${logCtx} 写入块`, { chunk: chunkIdx, leftIndex: chunk.leftIndex, slots: chunk.slots.length });
    let remarkRowPt = estimateOrderRemarkRowHeightPt("", LEGACY_DATA_COL_WIDTH);
    for (const s of chunk.slots) {
      if (!s) continue;
      remarkRowPt = Math.max(
        remarkRowPt,
        estimateOrderRemarkRowHeightPt(s.orderRemark, LEGACY_DATA_COL_WIDTH)
      );
    }
    for (let k = 0; k < rowsInBlock; k++) {
      let h = k === 0 ? imgRowPt : TEXT_ROW_PT;
      if (k === 7) h = remarkRowPt;
      ws.getRow(r0 + k).height = h;
    }

    for (let k = 0; k < 8; k++) {
      const cell = ws.getCell(r0 + k, 1);
      applyCardBorder(cell);
      cell.alignment = {
        horizontal: "center",
        vertical: k === 7 ? "top" : "middle",
        wrapText: true,
      };
      if (k === 0) {
        cell.value = String(chunk.leftIndex);
        cell.numFmt = "@";
        cell.font = {
          name: SHEET_FONT_NAME,
          size: SHEET_LEFT_INDEX_FONT_PT,
          bold: true,
          color: { argb: "FFFF0004" },
        };
      } else {
        cell.value = LEFT_LABELS[k - 1];
        cell.font = { name: SHEET_FONT_NAME, size: SHEET_FONT_PT };
      }
    }

    for (let j = 0; j < 4; j++) {
      const dataCol = 2 + j * 2;
      const emptyCol = 3 + j * 2;
      const slot = chunk.slots[j];

      for (let k = 0; k < 8; k++) {
        const cell = ws.getCell(r0 + k, dataCol);
        cell.fill = FILL_ORDER;
        cell.font = { name: SHEET_FONT_NAME, size: SHEET_FONT_PT };
        cell.alignment = {
          horizontal: "center",
          vertical: k === 7 ? "top" : "middle",
          wrapText: true,
        };
        applyCardBorder(cell);
      }

      if (slot) {
        const bg = toArgb(slot.sBuyColor || slot.textColor);
        const biz = ws.getCell(r0 + 1, dataCol);
        biz.value = slot.business;
        if (bg) {
          biz.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: bg },
          };
        }

        ws.getCell(r0 + 2, dataCol).value = slot.spec;
        const ins = ws.getCell(r0 + 3, dataCol);
        ins.value = slot._instruction;
        ins.font = { name: SHEET_FONT_NAME, size: SHEET_FONT_PT, color: { argb: "FF008000" } };

        ws.getCell(r0 + 4, dataCol).value = displayBdAndggCn(slot.bdAndgg);

        const sz = ws.getCell(r0 + 5, dataCol);
        sz.value = slot.size;
        sz.font = { name: SHEET_FONT_NAME, size: SHEET_FONT_PT, color: { argb: "FFFF0000" } };

        const sn = ws.getCell(r0 + 6, dataCol);
        sn.value = "\u00a0" + String(slot.order_sn || "");
        sn.numFmt = "@";
        const snColor = slot.sBuyColor ? slot.textColor : "blue";
        const snArgb = toArgb(snColor) || "FF0000FF";
        sn.font = { name: SHEET_FONT_NAME, size: SHEET_FONT_PT, color: { argb: snArgb }, underline: false };

        ws.getCell(r0 + 7, dataCol).value = slot.orderRemark;

        if (!skipImages && slot.imgUrl) {
          const imgKey = normalizeImageUrlForFetch(slot.imgUrl);
          const img = imgKey ? imageMap.get(imgKey) : null;
          if (img) {
            const imageId = workbook.addImage({
              buffer: img.buffer,
              extension: img.ext,
            });
            ws.addImage(imageId, {
              ...imageAnchorInDataCell(ws, dataCol, r0),
            });
          }
        }
      }

      const eLet = colLet(emptyCol);
      ws.mergeCells(`${eLet}${r0}:${eLet}${r0 + rowsInBlock - 1}`);
      const ec = ws.getCell(r0, emptyCol);
      ec.alignment = { horizontal: "center", vertical: "middle" };
      applyCardBorder(ec);
    }

    r0 += rowsInBlock;
    if (chunkIdx < chunks.length) {
      ws.getRow(r0).height = EXPORT_BLOCK_GAP_ROW_PT;
      r0 += 1;
    }
  }

  xlLog(`${logCtx} buildOrderSheet 结束`, { chunkRows: chunkIdx });
  return ws;
}
