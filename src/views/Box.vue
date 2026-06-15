<template>
  <el-dialog :close-on-click-modal="true" title="按照选中的条件转化数据==>下载" :visible.sync="dialogVisible" width="400px" top="28vh"
             :before-close="onCancel">
    <!-- 内容 -->
    <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAll">全选</el-checkbox>
    <div style="margin-bottom: 10px;"></div>
    <el-checkbox-group v-model="checkedIds" @change="handleChange">
      <el-checkbox v-for="item in datas" :label="item.id" :key="item.id">{{item.value}}</el-checkbox>
    </el-checkbox-group>
    <div class="main-btn">
      <el-input size="small" style="width: 60px" v-model="orderInx" placeholder="开始索引,默认1"></el-input>
      <el-button class="main-btn1" type="danger" @click="onOk">开始转化</el-button>
    </div>

    <!-- ---------- -->
    <span slot="footer" class="dialog-footer">
      <el-button class="order-sn" size="small" type="info" @click="exportSn">单号汇总</el-button>
      <download-excel :ref="`download-img`" :class="['export-img img']" :data="imgExportData || []" :name="imgExportName">下载img
      </download-excel>
      <download-excel :ref="`download`" :class="['export-img doOrder']" :data="specExportData || []" :name="specExportName">
        下载做单
      </download-excel>
    </span>
  </el-dialog>
</template>

<script>
import { downBtn } from "../utils/enum";
import {
  filter as _filter,
  cloneDeep as _cloneDeep,
  includes as _includes,
  find as _find,
  findIndex as _findIndex,
  uniqBy as _uniqBy,
  get as _get,
} from "lodash";
import { setFlatData, setTabelFormat } from "../utils/main2";
import { startSetImgExcelData } from "../utils/imgExport";
import { getSpecSns, snTxtStr } from "../utils/ordersnExport";
import { saveAs } from "file-saver";

const options = _cloneDeep(downBtn);
const initIds = options.map((item) => item.id);
const d = _cloneDeep(initIds);
d.pop();
const checkedIds = d;

export default {
  props: ["dialogVisible"],
  data() {
    return {
      checkAll: false,
      checkedIds: checkedIds,
      datas: options,
      isIndeterminate: true,
      name: "汇总",
      imgExportData: [], //所有图片的数据
      imgExportName: "",
      specExportData: [], //所有做单数据
      specExportName: "",
      snExportData: '', //单号数据
      orderInx: 1,
    };
  },
  computed: {},
  methods: {
    // 多选框
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
    // 弹窗
    onCancel() {
      this.checkAll = false;
      this.checkedIds = checkedIds;
      this.datas = options;
      this.isIndeterminate = true;
      this.imgExportData = [];
      this.imgExportName = "";
      this.specExportData = [];
      this.specExportName = "";
      this.snExportData = '';
      this.orderInx = 1;
      this.$emit("onCancel", {});
    },
    onOk() {
      const {
        dataSource = {},
        fileName,
        timer,
      } = window.__shop_save_datas || {};
      if (dataSource && dataSource.spec000) {
        this.exportImg({ dataSource, fileName, timer });
        this.setSnData({ dataSource, fileName, timer });
        this.exportDoSn({ dataSource, fileName, timer });

        this.$message({
          message: "汇总数据转化成功，快去下载",
          showClose: true,
          type: "success",
          duration: 800,
          offset: 10,
        });
      } else {
        this.$message({
          message: "请先转化数据",
          showClose: true,
          type: "error",
          duration: 800,
          offset: 10,
        });
      }
    },
    // -----------------做单-----------------
    exportDoSn({ dataSource, fileName, timer }) {
      this.specExportName = `${fileName || ""}${this.name}做单-${timer}.xls`;

      const arrdatas = [];
      this.checkedIds.map((item) => {
        const res = setFlatData(dataSource[item], item);
        arrdatas.push(...res.arr);
      });
      console.log(arrdatas, "---做单的数据");
      const tableDatas = setTabelFormat(arrdatas, this.orderInx); //规格的excel格式
      this.specExportData = tableDatas?.arr;
    },
    //-----------------img的汇总-----------------
    exportImg({ dataSource, fileName, timer }) {
      const arrdatas = [];
      this.checkedIds.map((item) => {
        const res = setFlatData(dataSource[item], item);
        arrdatas.push(...res.arr);
      });
      this.imgExportData = startSetImgExcelData(arrdatas); //图片汇总导出
      this.imgExportName = `${fileName || ""}${this.name}报货-${timer}.xls`;
    },
    //-----------------单号-----------------
    setSnData({ dataSource, fileName, timer }) {
      const sn = [];
      this.checkedIds.map((item) => {
        const res = getSpecSns(dataSource[item]);
        sn.push(...res);
      });
      this.snExportData = snTxtStr(sn);
    },
    exportSn() {
      if(!this.snExportData)return
      const { fileName, timer } = window.__shop_save_datas || {};
      const res = new Blob([this.snExportData], {
        type: "text/plain;charset=utf-8",
      });
      const name = `${fileName || ""}${this.name}单号-${timer}.txt`;
      saveAs(res, `${name}`);
    },
  },
};
</script>
<style lang="less" scoped>
.export-img {
  width: 60px;
  border-radius: 4px;
  font-size: 14px;
  padding: 2px 8px;
  cursor: pointer;
  color: #000;
  height: 30px;
  line-height: 30px;
  text-align: center;
  margin-left: 10px;
  // border: 1px solid #67c23a;
}
.img {
  background-color: #e6a23c;
}
.doOrder {
  background-color: #409eff;
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
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
.main-btn {
  margin-left: 20px;
  margin-top: 16px;
  .main-btn1 {
    width: 100%;
  }
}
.order-sn {
  color: #000;
}

:deep(.el-input__inner) {
  border: 1px solid #409eff;
}
</style>
