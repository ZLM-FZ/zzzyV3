<template>
  <div>
    <div class="main-btn">
      第三步：<el-button class="main-btn1" style="color: #000000;font-weight: bolder;font-size: 16px;" type="success" @click="onOk">{{buttonText}}</el-button>
    </div>
    <el-divider></el-divider>
    第四步：
    <div class="step4-bar">
      <el-button class="order-sn" size="small" type="info" @click="exportSn">
        <i class="el-icon-download"></i>单号汇总
      </el-button>

      <template v-if="!exportUiNew">
        <download-excel :class="['export-img img']" :data="imgExport.data || []" :name="imgExport.name">
          <i class="el-icon-download"></i>下载img
        </download-excel>
        <download-excel :class="['export-img img']" :data="imgExportV2.data || []" :name="imgExportV2.name">
          <i class="el-icon-download"></i>下载imgV2
        </download-excel>
      </template>
      <template v-else>
        <el-button
          :class="['export-img', 'img']"
          size="small"
          :loading="newExportLoading === 'img'"
          @click="downloadNewImgXlsx"
        >
          <i class="el-icon-download"></i>下载img
        </el-button>
        <el-button
          :class="['export-img', 'img']"
          size="small"
          :loading="newExportLoading === 'imgV2'"
          @click="downloadNewImgV2Xlsx"
        >
          <i class="el-icon-download"></i>下载imgV2
        </el-button>
      </template>

      <div class="line"></div>

      <template v-if="!exportUiNew">
        <span v-for="item in downBtns" :key="item.value" class="order-btn-wrap">
          <el-input size="small" style="width: 80px" v-model="item.startIdx" placeholder="开始索引,默认1"></el-input>
          <download-excel :class="['export-img doOrder']" :data="orderExportObj[item.valKey] || []"
                          :name="`${fileName}做单--${item.label}-${timer}.xlsx`">
            <i class="el-icon-download"></i>
            {{item.label}}
            <span v-if="_EXPORT_DATAS.doOrdersDataSource">
              （{{_EXPORT_DATAS.doOrdersDataSource[item.valKey].length>0?_EXPORT_DATAS.doOrdersDataSource[item.valKey].length:'无'}}）
            </span>
          </download-excel>
        </span>
        <download-excel :class="['export-img img']" :data="jianhaoExport.data || []" :name="jianhaoExport.name">
          <i class="el-icon-download"></i>捡号
        </download-excel>
      </template>

      <template v-else>
        <span v-for="item in downBtns" :key="'new-' + item.value" class="order-btn-wrap">
          <el-input size="small" style="width: 80px" v-model="item.startIdx" placeholder="开始索引,默认1"></el-input>
          <el-button
            :class="['export-img', 'doOrder']"
            size="small"
            :loading="newExportLoading === item.valKey"
            @click="downloadNewOrderXlsx(item)"
          >
            <i class="el-icon-download"></i>
            {{ item.label }}
            <span v-if="_EXPORT_DATAS.doOrdersDataSource">
              （{{ _EXPORT_DATAS.doOrdersDataSource[item.valKey].length > 0 ? _EXPORT_DATAS.doOrdersDataSource[item.valKey].length : '无' }}）
            </span>
          </el-button>
        </span>
        <el-button
          :class="['export-img', 'img']"
          size="small"
          :loading="newExportLoading === 'jianhao'"
          @click="downloadNewJianhaoXlsx"
        >
          <i class="el-icon-download"></i>捡号
        </el-button>
      </template>

      <el-button
        class="toggle-new-export"
        size="small"
        type="primary"
        plain
        @click="exportUiNew = !exportUiNew"
      >
        {{ exportUiNew ? '切回旧版导出' : '切换新版导出' }}
      </el-button>
    </div>

    <el-collapse v-model="exportDebugCollapse" class="export-debug-outer">
      <el-collapse-item name="debug">
        <template slot="title">
          <span class="export-debug-title">导出调试（真 xlsx 进度与日志）</span>
          <el-switch
            v-model="exportDebugToUi"
            active-text="记录到界面"
            inactive-text="仅控制台"
            class="export-debug-switch"
            @click.native.stop
          />
        </template>
        <div class="export-debug-toolbar">
          <el-button type="text" size="small" @click="clearExportDebug">清空日志</el-button>
        </div>
        <pre ref="exportDebugScroll" class="export-debug-pre">{{ exportDebugText }}</pre>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { saveAs } from "file-saver";
import {
  cloneDeep as _cloneDeep,
  findIndex as _findIndex
} from "lodash";
import { _exportTabel as _exportImg } from "./utils/imgExport.js";
import { _exportTabelV2 as _exportImgV2 } from "./utils/imgExportV2.js";
import {
  exportReportXlsx,
  exportReportXlsxV2,
  exportOrderCategoryXlsx,
  exportJianhaoXlsx,
} from "./utils/excelReal/index.js";
import { jianhaoExcelInit } from './utils/jianhaoExcel.js';
import { _snTxtStr, getDay } from "./utils/main.js";
import { _orderTabel as _exportOrder } from "./utils/ordersExport.js";
import { setExcelExportUiLogSink } from "./utils/excelReal/exportLog.js";

const __win_data = JSON.parse(window.localStorage.getItem("__sys4-base"));

const options = _cloneDeep(__win_data?.btns);
const initIds = options?.map((item) => item.value);
const d = _cloneDeep(initIds);
const checkedIds = d;

export default {
  components: {},
  props: {
    fileName: {
      type: String,
      default: "",
    },
    startIndex: {
      type: String,
      default: "1",
    },
    _EXPORT_DATAS: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      exportUiNew: true,
      newExportLoading: "",
      checkAll: false,
      checkedIds: checkedIds,
      buttonText: "导出excel：1、下载之前先填顺序 2、再点我生成下载数据",
      timer: "",
      jianhaoExport: {
        data: [],
        name: "",
      },
      imgExport: {
        data: [],
        name: "",
      },
      imgExportV2: {
        data: [],
        name: "",
      },
      orderExport: {
        data: [],
        name: "",
      },
      orderExportObj: {},
      curStep: "3",
      downBtns: [],
      exportDebugCollapse: ["debug"],
      exportDebugLines: [],
      exportDebugMaxLines: 800,
      exportDebugToUi: true,
    };
  },
  computed: {
    exportDebugText() {
      return this.exportDebugLines.join("\n");
    },
  },
  mounted() {
    const btn = __win_data?.btns || [];
    if (!__win_data["sameBuyerBUyMore"]) {
      const inx = _findIndex(btn, ["value", "sys4-sameBuyer"]);
      if (inx !== -1) {
        btn.splice(inx, 1);
      }
    }
    if (!__win_data["dzNoDzInfo"]) {
      const inx = _findIndex(btn, ["value", "sys4-examineHasNoRemark"]);
      if (inx !== -1) {
        btn.splice(inx, 1);
      }
    }
    this.downBtns = btn.map((item) => {
      return { ...item, startIdx: "1" };
    });
    this._excelUiLogSink = (entry) => {
      this.onExcelExportUiLog(entry);
    };
    setExcelExportUiLogSink(this._excelUiLogSink);
  },
  beforeDestroy() {
    setExcelExportUiLogSink(null);
  },
  methods: {
    onExcelExportUiLog(entry) {
      if (!this.exportDebugToUi) return;
      const line = entry && entry.line ? String(entry.line) : "";
      if (!line) return;
      const ts = new Date().toLocaleTimeString();
      this.exportDebugLines.push(`[${ts}] ${line}`);
      if (this.exportDebugLines.length > this.exportDebugMaxLines) {
        this.exportDebugLines.splice(0, this.exportDebugLines.length - this.exportDebugMaxLines);
      }
      this.$nextTick(() => {
        const el = this.$refs.exportDebugScroll;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
    clearExportDebug() {
      this.exportDebugLines = [];
    },
    makeImgProgress(label) {
      return (done, total) => {
        this.onExcelExportUiLog({ line: `【${label}】拉图进度 ${done}/${total}` });
      };
    },
    startExportDebugSession(title) {
      this.clearExportDebug();
      this.onExcelExportUiLog({ line: `──────── ${title} ────────` });
    },
    ensureExportReady() {
      if (!this.imgExport.data || !this.imgExport.data.length) {
        this.$message.error("请先点击第三步生成导出数据");
        return false;
      }
      return true;
    },
    async downloadNewImgXlsx() {
      if (!this.ensureExportReady()) return;
      this.startExportDebugSession("报货真 xlsx");
      this.newExportLoading = "img";
      try {
        await exportReportXlsx({
          flatDataSource: this._EXPORT_DATAS.flatDataSource,
          filename: this.imgExport.name,
          onProgress: this.makeImgProgress("报货"),
        });
        this.$message.success("已下载报货表（真 xlsx）");
      } catch (e) {
        console.error(e);
        this.onExcelExportUiLog({ line: `[error] 报货导出失败：${e && e.message ? e.message : e}` });
        this.$message.error("报货导出失败");
      } finally {
        this.newExportLoading = "";
      }
    },
    async downloadNewImgV2Xlsx() {
      if (!this.ensureExportReady()) return;
      this.startExportDebugSession("报货V2真 xlsx");
      this.newExportLoading = "imgV2";
      try {
        await exportReportXlsxV2({
          flatDataSource: this._EXPORT_DATAS.flatDataSource,
          filename: this.imgExportV2.name,
          onProgress: this.makeImgProgress("报货V2"),
        });
        this.$message.success("已下载报货表V2（真 xlsx）");
      } catch (e) {
        console.error(e);
        this.onExcelExportUiLog({ line: `[error] 报货V2导出失败：${e && e.message ? e.message : e}` });
        this.$message.error("报货V2导出失败");
      } finally {
        this.newExportLoading = "";
      }
    },
    async downloadNewOrderXlsx(item) {
      if (!this.ensureExportReady()) return;
      this.startExportDebugSession(`做单：${item.label || item.valKey}`);
      this.newExportLoading = item.valKey;
      try {
        await exportOrderCategoryXlsx({
          valKey: item.valKey,
          doOrdersDataSource: this._EXPORT_DATAS.doOrdersDataSource,
          startIdx: item.startIdx,
          fileName: this.fileName,
          timer: this.timer,
          label: item.label,
          onProgress: this.makeImgProgress(item.label || "做单"),
        });
        this.$message.success(`已下载${item.label}（真 xlsx）`);
      } catch (e) {
        console.error(e);
        this.onExcelExportUiLog({
          line: `[error] ${item.label}导出失败：${e && e.message ? e.message : e}`,
        });
        this.$message.error(`${item.label}导出失败`);
      } finally {
        this.newExportLoading = "";
      }
    },
    async downloadNewJianhaoXlsx() {
      if (!this.ensureExportReady()) return;
      this.startExportDebugSession("捡号真 xlsx");
      this.newExportLoading = "jianhao";
      try {
        await exportJianhaoXlsx({
          jianhaoDataSource: this._EXPORT_DATAS.jianhaoDataSource,
          fileName: this.fileName,
          timer: this.timer,
          onProgress: this.makeImgProgress("捡号"),
        });
        this.$message.success("已下载捡号（真 xlsx）");
      } catch (e) {
        console.error(e);
        this.onExcelExportUiLog({ line: `[error] 捡号导出失败：${e && e.message ? e.message : e}` });
        this.$message.error("捡号导出失败");
      } finally {
        this.newExportLoading = "";
      }
    },
    onOk() {
      if (!this._EXPORT_DATAS.allOrderCodes) {
        this.$message.error("请先导入数据");
        return;
      }
      this.timer = getDay();
      this.exportImg(this._EXPORT_DATAS.flatDataSource);
      this.exportImgV2();
      this.exportJianhao();
      this.exportOrders(this._EXPORT_DATAS.doOrdersDataSource);
      this.$message.success("导出成功，快去下载");
      this.curStep = "4";
    },
    exportOrders() {
      this.orderExportObj = _exportOrder(
        this._EXPORT_DATAS.doOrdersDataSource,
        this.downBtns
      );
    },
    exportImg() {
      this.imgExport.data = _exportImg(this._EXPORT_DATAS.flatDataSource);
      this.imgExport.name = `${this.fileName || ""}报货-${this.timer}.xlsx`;
    },
    exportImgV2() {
      this.imgExportV2.data = _exportImgV2(this._EXPORT_DATAS.flatDataSource);
      this.imgExportV2.name = `${this.fileName || ""}报货V2-${this.timer}.xlsx`;
    },
    exportJianhao() {
      const resdata = jianhaoExcelInit(this._EXPORT_DATAS.jianhaoDataSource);
      this.jianhaoExport.data = [{ "优先捡A号": resdata }];
      this.jianhaoExport.name = `${this.fileName || ""}捡号-${this.timer}.xlsx`;
    },
    exportSn() {
      if (!this._EXPORT_DATAS.allOrderCodes) return;
      const codes4 = _snTxtStr(this._EXPORT_DATAS.allOrderCodes);
      const res = new Blob([codes4], {
        type: "text/plain;charset=utf-8",
      });
      const name = `${this.fileName || ""}单号-${this.timer}.txt`;
      saveAs(res, `${name}`);
    },
    handleCheckAll(val) {
      this.checkedIds = val ? initIds : [];
      this.isIndeterminate = false;
    },
    handleChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.datas.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.datas.length;
    },
    empty() {
      this.orderExportObj = {};
      this.orderExport.data = [];
      this.orderExport.name = "";
      this.imgExport.data = [];
      this.imgExport.name = "";
      this.jianhaoExport.data = [];
      this.jianhaoExport.name = "";
      this.curStep = "3";
    },
  },
};
</script>
<style lang="less" scoped>
.step4-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  width: 100%;
}
.order-btn-wrap {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
}
.toggle-new-export {
  margin-left: auto;
}
.export-img {
  border-radius: 4px;
  font-size: 14px;
  padding: 2px 8px;
  cursor: pointer;
  color: #000;
  min-height: 30px;
  line-height: 30px;
  text-align: center;
  margin-left: 8px;
}
.img {
  background-color: #e6a23c;
}
.doOrder {
  background-color: #409eff;
}
.is-disabled-new {
  opacity: 0.65;
  cursor: not-allowed;
}
:deep(.el-dialog__body) {
  text-align: left;
}
:deep(.el-checkbox) {
  display: block;
  margin-bottom: 8px;
}
:deep(.el-dialog__body) {
  padding: 0 20px;
}
.main-btn {
  margin-left: 20px;
  margin-top: 16px;
  .main-btn1 {
    width: 100%;
    margin-bottom: 8px;
  }
}
.order-sn {
  color: #000;
}
:deep(.el-input__inner) {
  border: 1px solid #409eff;
}
.line {
  margin-left: 16px;
  margin-right: 8px;
  width: 1px;
  height: 36px;
  background-color: #dcdfe6;
}
.export-debug-outer {
  margin: 16px 20px 24px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
.export-debug-title {
  font-weight: 600;
  margin-right: 16px;
}
.export-debug-switch {
  vertical-align: middle;
}
.export-debug-toolbar {
  margin-bottom: 8px;
}
.export-debug-pre {
  margin: 0;
  max-height: 280px;
  overflow: auto;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.45;
  font-family: ui-monospace, Menlo, Monaco, Consolas, monospace;
  color: #303133;
  background: #f6f8fa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
