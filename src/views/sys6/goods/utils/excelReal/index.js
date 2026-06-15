import ExcelJS from "exceljs";
import { prepareReportImgChunks } from "../imgExport.js";
import { prepareReportImgChunksV2 } from "../imgExportV2.js";
import { prepareOrderExportChunks } from "../ordersExport.js";
import { prepareJianhaoSheetRows } from "../jianhaoExcel.js";
import { buildReportSheet } from "./buildReportSheet.js";
import { buildOrderSheet } from "./buildOrderSheet.js";
import { buildJianhaoSheet } from "./buildJianhaoSheet.js";
import { saveWorkbookAs } from "./downloadXlsx.js";
import { xlLog, xlLogReset } from "./exportLog.js";

export const NOCUSTOM_VAL_KEY = "_nocustomizedDataSource";

/** 报货：真 xlsx + 内嵌图（与旧 `_exportTabel` / vue-json-excel 同源数据） */
export async function exportReportXlsx(opts) {
  const { flatDataSource, filename, skipImages, onProgress, imageFetchConcurrency } = opts;
  xlLogReset();
  xlLog("报货 导出开始", { filename });
  const chunks = prepareReportImgChunks(flatDataSource || []);
  let imgSlots = 0;
  for (const row of chunks) {
    for (let j = 0; j < 4; j++) {
      if (row[j] && row[j].imgUrl) imgSlots += 1;
    }
  }
  xlLog("报货 数据就绪", { chunkRows: chunks.length, imageSlots: imgSlots });
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "zuodan";
  await buildReportSheet(workbook, chunks, {
    skipImages,
    onProgress,
    imageFetchConcurrency,
    logContext: "报货",
  });
  xlLog("报货 开始 writeBuffer + 下载", filename);
  await saveWorkbookAs(workbook, filename);
  xlLog("报货 导出结束", "done");
}

/** 报货V2：真 xlsx + 内嵌图（去域名合并相同图片） */
export async function exportReportXlsxV2(opts) {
  const { flatDataSource, filename, skipImages, onProgress, imageFetchConcurrency } = opts;
  xlLogReset();
  xlLog("报货V2 导出开始", { filename });
  const chunks = prepareReportImgChunksV2(flatDataSource || []);
  let imgSlots = 0;
  for (const row of chunks) {
    for (let j = 0; j < 4; j++) {
      if (row[j] && row[j].imgUrl) imgSlots += 1;
    }
  }
  xlLog("报货V2 数据就绪", { chunkRows: chunks.length, imageSlots: imgSlots });
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "zuodan";
  await buildReportSheet(workbook, chunks, {
    skipImages,
    onProgress,
    imageFetchConcurrency,
    logContext: "报货V2",
  });
  xlLog("报货V2 开始 writeBuffer + 下载", filename);
  await saveWorkbookAs(workbook, filename);
  xlLog("报货V2 导出结束", "done");
}

/**
 * 做单某一类：真 xlsx + 内嵌图（与旧 `setExcelTabel` + `orderTable` 同源数据）
 * @param {object} opts
 * @param {string} opts.valKey `_sameBuyerDataSource` | `_nocustomizedDataSource` | …
 */
export async function exportOrderCategoryXlsx(opts) {
  const {
    valKey,
    doOrdersDataSource,
    startIdx,
    fileName,
    timer,
    label,
    imageFetchConcurrency,
    logContext,
    onProgress,
  } = opts;
  xlLogReset();
  const ctx = logContext || label || valKey || "做单";
  xlLog(`${ctx} 导出开始`, { valKey, startIdx });
  const groups = doOrdersDataSource[valKey] || [];
  const chunks = prepareOrderExportChunks(groups, startIdx);
  let imgSlots = 0;
  chunks.forEach((ch) => {
    ch.slots.forEach((s) => {
      if (s && s.imgUrl) imgSlots += 1;
    });
  });
  xlLog("数据就绪", { chunkRows: chunks.length, imageSlots: imgSlots });
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "zuodan";
  await buildOrderSheet(workbook, chunks, {
    logContext: ctx,
    imageFetchConcurrency,
    onProgress,
  });
  const safeLabel = label != null ? label : valKey;
  const filename = `${fileName || ""}做单--${safeLabel}-${timer}.xlsx`;
  xlLog("开始 writeBuffer + 下载", filename);
  await saveWorkbookAs(workbook, filename);
  xlLog(`${ctx} 导出结束`, "done");
}

/** 不定制做单：等价于 `exportOrderCategoryXlsx` + `NOCUSTOM_VAL_KEY` */
export async function exportNocustomizedOrderXlsx(opts) {
  return exportOrderCategoryXlsx({
    ...opts,
    valKey: NOCUSTOM_VAL_KEY,
    logContext: "不定制做单",
  });
}

/** 捡号：真 xlsx + 内嵌图（对齐 `jianhaoExcel.js` 表结构） */
export async function exportJianhaoXlsx(opts) {
  const {
    jianhaoDataSource,
    fileName,
    timer,
    headerDate,
    skipImages,
    imageFetchConcurrency,
    onProgress,
  } = opts;
  xlLogReset();
  xlLog("捡号 导出开始", { fileName, timer });
  const rows = prepareJianhaoSheetRows(jianhaoDataSource || []);
  xlLog("捡号 数据就绪", { rows: rows.length });
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "zuodan";
  await buildJianhaoSheet(workbook, rows, {
    headerDate: headerDate != null ? headerDate : timer,
    skipImages,
    imageFetchConcurrency,
    onProgress,
  });
  const filename = `${fileName || ""}捡号-${timer}.xlsx`;
  xlLog("捡号 开始 writeBuffer + 下载", filename);
  await saveWorkbookAs(workbook, filename);
  xlLog("捡号 导出结束", "done");
}
