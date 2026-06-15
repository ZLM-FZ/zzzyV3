import ExcelJS from "exceljs";
import { simplifyProductName } from "../excelFormat.js";
import { normalizeImageUrlForFetch } from "./imageUrl.js";
import { buildImageBufferMap, collectReportImageUrls } from "./batchFetchImages.js";
import { xlLog } from "./exportLog.js";
import {
  TEXT_ROW_PT,
  imageAnchorInPicColumn,
  applyCardBorder,
  orderSheetImageRowPt,
  LEGACY_EMPTY_COL_WIDTH,
  REPORT_PIC_COL_WIDTH,
  LEGACY_REPORT_HEADER_ROW_PT,
  REPORT_PRODUCT_NAME_ROW_PT,
  EXPORT_BLOCK_GAP_ROW_PT,
  SHEET_FONT_PT,
  SHEET_FONT_NAME,
} from "./sheetLayout.js";

const REPORT_COL_COUNT = 8;
const REPORT_TOP_TITLE = "报货表";
const REPORT_TITLE_ROW_PT = 30;

const FILL_PIC = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFE5E9F2" },
};

/** 1-based列号 → 字母 */
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

/**
 * @param {import('exceljs').Workbook} workbook
 * @param {Array<Array<{ imgUrl: string, specStr: string, productName: string }>>} chunks
 * @param {{ skipImages?: boolean, onProgress?: (c:number,t:number)=>void, imageFetchConcurrency?: number, logContext?: string }} options
 */
export async function buildReportSheet(workbook, chunks, options) {
  const skipImages = options?.skipImages === true;
  const onProgress = options?.onProgress;
  const logCtx = options?.logContext || "报货";
  xlLog(`${logCtx} buildReportSheet 开始`, { chunks: chunks.length });

  const ws = workbook.addWorksheet("Sheet1", {
    views: [{ state: "frozen", ySplit: 2 }],
  });

  const headerKeys = [];
  for (let j = 0; j < 4; j++) {
    headerKeys.push(`picture-picture-picture${j}`, `empty${j}-`);
  }

  const picRowPt = orderSheetImageRowPt();
  for (let c = 1; c <= 8; c++) {
    ws.getColumn(c).width =
      c % 2 === 1 ? REPORT_PIC_COL_WIDTH : LEGACY_EMPTY_COL_WIDTH;
  }

  const topRow = ws.getRow(1);
  topRow.height = REPORT_TITLE_ROW_PT;
  ws.mergeCells(1, 1, 1, REPORT_COL_COUNT);
  const topCell = ws.getCell(1, 1);
  topCell.value = REPORT_TOP_TITLE;
  topCell.font = { bold: true, name: SHEET_FONT_NAME, size: SHEET_FONT_PT, color: { argb: "FF000000" } };
  topCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  applyCardBorder(topCell);

  const headerRow = ws.getRow(2);
  headerRow.height = LEGACY_REPORT_HEADER_ROW_PT;
  headerKeys.forEach((key, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = key;
    cell.font = { bold: true, name: SHEET_FONT_NAME, size: SHEET_FONT_PT };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    applyCardBorder(cell);
  });

  let imageMap = new Map();
  if (!skipImages) {
    const reportUrls = collectReportImageUrls(chunks);
    xlLog(`${logCtx} 预拉图片`, { cellRefs: reportUrls.length });
    imageMap = await buildImageBufferMap(
      reportUrls,
      options?.imageFetchConcurrency,
      {
        onFetchProgress: (done, total) => onProgress?.(done, total),
      }
    );
  }

  let r0 = 3;
  let blockIdx = 0;
  for (let ci = 0; ci < chunks.length; ci++) {
    blockIdx += 1;
    const slotRow = chunks[ci];
    xlLog(`${logCtx} 写入块`, { chunk: blockIdx, slots: slotRow.filter(Boolean).length });
    const r1 = r0 + 1;
    const r2 = r0 + 2;

    ws.getRow(r0).height = picRowPt;
    ws.getRow(r1).height = TEXT_ROW_PT;
    ws.getRow(r2).height = REPORT_PRODUCT_NAME_ROW_PT;

    for (let j = 0; j < 4; j++) {
      const picCol = j * 2 + 1;
      const emptyCol = j * 2 + 2;
      const item = slotRow[j];

      const picTop = ws.getCell(r0, picCol);
      const picMid = ws.getCell(r1, picCol);
      const picBot = ws.getCell(r2, picCol);
      [picTop, picMid, picBot].forEach((cell) => {
        cell.fill = FILL_PIC;
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.font = { name: SHEET_FONT_NAME, size: SHEET_FONT_PT };
        applyCardBorder(cell);
      });

      picMid.value = item ? item.specStr : "";
      picBot.value = item ? simplifyProductName(item.productName) : "";

      if (item && !skipImages && item.imgUrl) {
        const imgKey = normalizeImageUrlForFetch(item.imgUrl);
        const img = imgKey ? imageMap.get(imgKey) : null;
        if (img) {
          const imageId = workbook.addImage({
            buffer: img.buffer,
            extension: img.ext,
          });
          ws.addImage(imageId, {
            ...imageAnchorInPicColumn(ws, picCol, r0),
          });
        }
      }

      const eLetter = colLet(emptyCol);
      ws.mergeCells(`${eLetter}${r0}:${eLetter}${r2}`);
      const ec = ws.getCell(r0, emptyCol);
      ec.alignment = { horizontal: "center", vertical: "middle" };
      applyCardBorder(ec);
    }

    r0 += 3;
    if (ci < chunks.length - 1) {
      ws.getRow(r0).height = EXPORT_BLOCK_GAP_ROW_PT;
      r0 += 1;
    }
  }

  xlLog(`${logCtx} buildReportSheet 结束`, { chunkRows: blockIdx });
  return ws;
}
