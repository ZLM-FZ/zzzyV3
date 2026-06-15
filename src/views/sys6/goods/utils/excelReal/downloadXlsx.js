import { saveAs } from "file-saver";
import { isExcelExportLogEnabled } from "./exportLog.js";

/**
 * @param {import('exceljs').Workbook} workbook
 * @param {string} filename
 */
export async function saveWorkbookAs(workbook, filename) {
  const t0 = typeof performance !== "undefined" ? performance.now() : 0;
  const buf = await workbook.xlsx.writeBuffer();
  if (isExcelExportLogEnabled()) {
    const ms = typeof performance !== "undefined" ? Math.round(performance.now() - t0) : 0;
    console.info(
      "[zuodan:excel] writeBuffer 完成",
      `${ms}ms`,
      `约 ${Math.round(buf.byteLength / 1024)}KB`
    );
  }
  const name =
    filename && filename.endsWith(".xlsx") ? filename : `${filename || "export"}.xlsx`;
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, name);
}
