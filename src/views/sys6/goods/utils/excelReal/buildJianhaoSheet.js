import ExcelJS from "exceljs";
import { normalizeImageUrlForFetch } from "./imageUrl.js";
import { buildImageBufferMap } from "./batchFetchImages.js";
import {
  applyCardBorder,
  imageRowHeightPt,
  SHEET_FONT_NAME,
  SHEET_FONT_PT,
} from "./sheetLayout.js";
import { displayBdAndggCn } from "./patchDisplay.js";

const JIANHAO_IMG = 150;
const JIANHAO_COL_COUNT = 9;
/** 捡号表顶行通栏标题（与旧版 HTML 表一致） */
const JIANHAO_TOP_TITLE = "优先捡A号";
/** 姓名和号码、臂章、款式、数量列正文字号（磅） */
const JIANHAO_EMPH_PT = 13;
const HEADER_FILL = { argb: "FFFEFF41" };
const TITLE_ROW_PT = 30;

function toArgb(css) {
  if (css == null || css === "") return undefined;
  const s = String(css).trim();
  if (s === "red") return "FFFF0000";
  if (s === "blue") return "FF0000FF";
  if (s === "green") return "FF008000";
  if (s.startsWith("#") && s.length >= 7) return "FF" + s.slice(1, 7).toUpperCase();
  return undefined;
}

/**
 * @param {import('exceljs').Workbook} workbook
 * @param {Array<{ imgUrl?: string, prodName: string, displayName: string, armPatch: string, typeLabel: string, number: *, size: *, orderCode: *, textColor?: string }>} rows
 * @param {{ skipImages?: boolean, imageFetchConcurrency?: number, headerDate?: string, onProgress?: (done:number,total:number)=>void }} options
 */
export async function buildJianhaoSheet(workbook, rows, options) {
  const skipImages = options?.skipImages === true;
  const headerDate = options?.headerDate != null ? String(options.headerDate) : "";

  const ws = workbook.addWorksheet("Sheet1", {
    views: [{ state: "frozen", ySplit: 2 }],
  });

  const titles = [
    `衬衫${headerDate}`,
    "款式",
    "姓名和号码",
    "胸章",
    "臂章",
    "款式",
    "数量",
    "码数",
    "订单号",
  ];
  const colWidths = [22, 38, 38, 10, 28, 12, 12, 12, 38];
  colWidths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  const top = ws.getRow(1);
  top.height = TITLE_ROW_PT;
  ws.mergeCells(1, 1, 1, JIANHAO_COL_COUNT);
  const topCell = ws.getCell(1, 1);
  topCell.value = JIANHAO_TOP_TITLE;
  topCell.font = { bold: true, name: SHEET_FONT_NAME, size: SHEET_FONT_PT, color: { argb: "FF000000" } };
  topCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  applyCardBorder(topCell);

  const hdr = ws.getRow(2);
  hdr.height = 36;
  titles.forEach((t, i) => {
    const c = i + 1;
    const cell = hdr.getCell(c);
    cell.value = t;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: HEADER_FILL,
    };
    cell.font = { bold: true, name: SHEET_FONT_NAME, size: SHEET_FONT_PT };
    const centerish = c >= 6 && c <= 8;
    cell.alignment = {
      horizontal: centerish ? "center" : "left",
      vertical: "middle",
      wrapText: true,
    };
    applyCardBorder(cell);
  });

  let imageMap = new Map();
  if (!skipImages && rows.length) {
    const urls = [];
    for (const row of rows) {
      if (row && row.imgUrl) urls.push(row.imgUrl);
    }
    imageMap = await buildImageBufferMap(urls, options?.imageFetchConcurrency, {
      onFetchProgress: options?.onProgress,
    });
  }

  const imgRowPt = imageRowHeightPt(JIANHAO_IMG, 18);
  let r = 3;
  for (const row of rows) {
    ws.getRow(r).height = imgRowPt;
    for (let c = 1; c <= 9; c++) {
      const cell = ws.getCell(r, c);
      applyCardBorder(cell);
      const centerish = c >= 6 && c <= 8;
      cell.alignment = {
        horizontal: centerish ? "center" : "left",
        vertical: "middle",
        wrapText: true,
      };
      cell.font = { name: SHEET_FONT_NAME, size: SHEET_FONT_PT };
    }

    ws.getCell(r, 2).value = row.prodName;

    const nameCell = ws.getCell(r, 3);
    nameCell.value = row.displayName;
    nameCell.font = {
      name: SHEET_FONT_NAME,
      size: JIANHAO_EMPH_PT,
      bold: true,
      color: { argb: "FFFF0000" },
    };

    ws.getCell(r, 4).value = "\u00a0";

    const arm = ws.getCell(r, 5);
    arm.value = displayBdAndggCn(row.armPatch);
    arm.font = { name: SHEET_FONT_NAME, size: JIANHAO_EMPH_PT, bold: true };

    const typeCell = ws.getCell(r, 6);
    typeCell.value = row.typeLabel;
    typeCell.font = { name: SHEET_FONT_NAME, size: JIANHAO_EMPH_PT, bold: true };

    const numCell = ws.getCell(r, 7);
    numCell.value = row.number;
    numCell.font = { name: SHEET_FONT_NAME, size: JIANHAO_EMPH_PT, bold: true };

    ws.getCell(r, 8).value = row.size;

    const oc = ws.getCell(r, 9);
    oc.value = "\u00a0" + String(row.orderCode || "");
    oc.numFmt = "@";
    const ocArgb = toArgb(row.textColor) || "FF000000";
    oc.font = { name: SHEET_FONT_NAME, size: SHEET_FONT_PT, color: { argb: ocArgb } };

    if (!skipImages && row.imgUrl) {
      const key = normalizeImageUrlForFetch(row.imgUrl);
      const img = key ? imageMap.get(key) : null;
      if (img) {
        const imageId = workbook.addImage({
          buffer: img.buffer,
          extension: img.ext,
        });
        const wCh = ws.getColumn(1).width ?? 22;
        const colPx = Math.max(80, wCh * 7 + 5);
        const xFrac = Math.max(
          0.04,
          Math.min(0.42, (colPx - JIANHAO_IMG) / 2 / colPx)
        );
        ws.addImage(imageId, {
          tl: { col: xFrac, row: r - 1 + 0.06 },
          ext: { width: JIANHAO_IMG, height: JIANHAO_IMG },
          editAs: "oneCell",
        });
      }
    }
    r += 1;
  }

  return ws;
}
