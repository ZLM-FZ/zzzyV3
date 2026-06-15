<template>
  <div class="home">
    <div class="box">
      <div class="btns-main">
        <span class="margin-ri">订单总条数：{{ orderAllNum }};</span>
        <span class="margin-ri">衣服总件数：{{ goodsAllNum }}</span>
      </div>
      <div class="btns">
        <span v-for="(item, i) in downBtn" :key="item.key" class="btns-item">
          <span class="num margin-bot-4">订单个数：{{ (orderArrsDatas && orderArrsDatas[item.id]?.length) || 0 }}</span>
          <!-- <div class="margin-bot-4">
            <el-button size="small" type="info">单号</el-button>
          </div> -->
          <span class="mar-bot">
            <download-excel :ref="`download-img${i}`" :class="['export-img']" :data="imgExportData[item.id] || []"
                            :name="fileName + '图片-' + item.value + timer + '.xls'">img</download-excel>
          </span>

          <span class="margin-bot-4">
            <download-excel :ref="`download${i}`" :class="['export', item.class]" :data="specExportData[item.id] || []"
                            :name="fileName + item.value + '-' + timer + '.xls'">
              {{ item.value }}
            </download-excel>
          </span>

          <!-- <span class="num">商品个数：{{ (allExportDatas && allExportDatas[item.id]?.goodsImgNum) || 0 }}</span> -->
          <div class="mar-bot0">
            <el-input size="small" style="width: 80px" v-model="allIndex[item.id]" placeholder="开始索引,默认1"></el-input>
          </div>
        </span>
      </div>

      <!-- 静态 -->
      <p class="box-info">
        <span class="zonglan">
          <el-button type="info" @click="exportOrder">全部单号汇总</el-button>
          <el-button class="all-btn" type="success" @click="handleBox">条件汇总</el-button>
          <!-- <download-excel :ref="`downloadAll`" class="export color-67c23a" :fields="dataScreen.fields" :data="dataScreen.exportData" :name="'总览' + fileName + '-' + timer + '.xls'">
            总览数据
          </download-excel> -->
        </span>

        <span>
          <span class="api-text">name：</span>
          <span class="input-span">
            <el-input size="small" v-model="fileName" placeholder="请输入文件名"></el-input>
          </span>
        </span>

        <router-link v-if="!isOrderPage" to="order?type=2" target="_blank">旧版规格</router-link>
        <router-link v-if="!isOrderPage" to="order?type=1" target="_blank">其他店</router-link>
      </p>
    </div>

    <!-- 录入 -->
    <div class="form">
      <Empty ref="empty" @save="save" @scrollTop="scrollTop" />
    </div>

    <!-- 弹窗 -->
    <Box :dialogVisible="boxVisible" @onOk="boxVisible = false" @onCancel="boxVisible = false" />
  </div>
</template>

<script>
import Empty from "./Empty.vue";
import { downBtn2, downBtn1, downBtn } from "../utils/enum";
import { startSort } from "../utils/baseDataSort";
import { cloneDeep as _cloneDeep } from "lodash";
import { startSetExcelDate } from "../utils/main2";
import { getDay } from "../utils/base";
import { saveAs } from "file-saver";
import Box from "./Box.vue";
import { getSnText } from "../utils/ordersnExport";

export default {
  name: "Main",
  components: {
    Empty,
    Box,
  },
  data: () => {
    return {
      orderArrsDatas: {}, //遍历好的数据
      orderAllNum: 0, //
      goodsAllNum: 0, //
      fileName: "", //文件名
      allIndex: {},
      allExportDatas: {}, //所有导出数据
      specExportData: {}, //规格导出数据
      imgExportData: {}, //excel的图片汇总
      downBtn: [],
      timer: "",
      // json_fields: {},
      // json_data: [],
      // json_meta: [
      //   [
      //     {
      //       key: 'charset',
      //       value: 'utf-8',
      //     },
      //   ],
      // ],
      //数据总览
      dataScreen: {
        exportData: [],
        fields: {},
      },
      lastOrderNum: "",
      isOrderPage: null,
      boxVisible: false,
    };
  },
  beforeMount() {
    this.downBtn = [];
    if (this.$route.query && this.$route.query.type == 1) {
      this.isOrderPage = true;
      this.downBtn = downBtn1;
    } else if (this.$route.query && this.$route.query.type == 2) {
      this.isOrderPage = true;
      this.downBtn = downBtn2;
    } else {
      this.isOrderPage = false;
      this.downBtn = downBtn;
    }
  },
  mounted() {
    this.initDataScreenFields();
  },
  methods: {
    //保存提交转化数据
    save({ data, lastOrderNum }) {
      this.lastOrderNum = lastOrderNum;
      const { group } = data;
      const datas = startSort({ arrs: group });
      //copy一份数据
      this.orderArrsDatas = _cloneDeep(datas);
      // 设置table格式
      this.setExcelTable(datas);
      this.timer = getDay();

      //在全局挂一份数据给其他地方用
      window.__shop_save_datas = {
        ...window.__shop_save_datas,
        fileName: this.fileName,
        timer: this.timer,
        dataSource: JSON.parse(JSON.stringify({ ...this.orderArrsDatas })),
      };
    },
    //设置excel表的table格式
    setExcelTable(datas) {
      let goodsNums = 0;
      let orderNums = 0;
      //转excel
      this.specExportData = datas;
      for (const key in datas) {
        orderNums = orderNums + datas[key].length;
        if (datas[key].length > 0) {
          const res = startSetExcelDate({
            arrDatas: datas[key],
            key,
            defineIndex: this.allIndex[key],
          });

          this.specExportData[key] = res.tableArrs;
          console.log(res, "====imgExportData");
          this.imgExportData[key] = res.imgExportData;

          this.allExportDatas[key] = res;
          goodsNums = goodsNums + res.goodsImgNum;
        }
      }
      this.goodsAllNum = goodsNums;
      this.orderAllNum = orderNums;
      this.$message({
        message: "数据转化成功，快去下载",
        showClose: true,
        type: "success",
        duration: 800,
        offset: 10,
      });
      //结果
      //创建总览导出数据
      this.createExportDataScreen();
    },
    // 总览单独处理导出
    createExportDataScreen() {
      //规格的
      const spec = {};
      for (const key in this.allExportDatas) {
        //订单总数+商品总数
        spec[key] =
          "订单数" +
          this.orderArrsDatas[key].length +
          " / " +
          "结束索引" +
          (this.allExportDatas[key].defineIndex - 1);
      }

      const obj = {
        orderAllNum: this.orderAllNum,
        goodsAllNum: this.goodsAllNum,
        lastOrderNum: this.lastOrderNum,
        fileName: this.fileName + "xx" + this.timer,
        //规格的
        ...spec,
      };
      this.dataScreen.exportData = [obj];
    },
    initDataScreenFields() {
      const dataScreenFields = {
        订单总条数: "orderAllNum",
        衣服总件数: "goodsAllNum",
        最后一条订单单号: "lastOrderNum",
      };
      //注入规格
      this.downBtn.map((item) => {
        dataScreenFields[item.value] = item.id;
        this.$set(this.allIndex, [item.id], 1);
      });

      this.dataScreen.fields = dataScreenFields;
    },
    scrollTop() {
      document.documentElement.scrollTop = document.body.scrollHeight;
    },
    exportOrder() {
      const { allOrder_sn } = window.__shop_save_datas || {};
      if (allOrder_sn) {
        const str = getSnText(allOrder_sn);
        const res = new Blob([str], { type: "text/plain;charset=utf-8" });
        const name = `${this.fileName || ""}汇总全部单号-${this.timer}.txt`;
        saveAs(res, `${name}`);
        this.$message({
          message: "单号汇总，下载成功～",
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
    handleBox() {
      this.boxVisible = true;
    },
  },
};
</script>
<style lang="less" scoped>
.home {
  font-size: 14px;
}
.box {
  top: 60px;
  padding-top: 10px;
  position: fixed;
  width: 100%;
  z-index: 101;
  box-sizing: border-box;
  background-color: #e5e9f2;
  height: 294px;
}

.btns {
  display: flex;
  justify-content: space-around;
  &-item {
    border: 1px solid #409eff;
    padding: 2px;
    border-radius: 4px;
  }
}
.export {
  border-radius: 4px;
  font-size: 14px;
  padding: 2px 8px;
  cursor: pointer;
  color: #fff;
  background-color: #409eff;
  border-color: #67c23a;
  height: 40px;
  line-height: 40px;
  text-align: center;
}
.form {
  padding-top: 290px;
}
.num {
  font-size: 12px;
  display: block;
}
.margin-bot-4 {
  margin-bottom: 4px;
}
.input-index {
  display: inline-block;
  width: 100px;
}
.input-span {
  width: 200px;
  display: inline-block;
}

.btns-main {
  font-weight: bolder;
  font-size: 24px;
}
.margin-ri {
  margin-right: 30px;
}
.api-text {
  color: black;
  font-weight: bolder;
  font-size: 16px;
}
.step {
  font-size: 26px;
  color: red;
}

.zonglan {
  display: flex;
}
.color-67c23a {
  border-color: #67c23a;
  background-color: #67c23a;
}
.box-info {
  display: flex;
  padding-left: 10px;
  padding-right: 10px;
  justify-content: space-around;
  align-items: center;
  margin-top: 30px;
  & > span {
    display: inline-block;
  }
}
.mar-bot {
  margin-bottom: 6px;
  display: block;
}
.mar-bot0 {
  margin-top: 6px;
}

//图片下载
.export-img {
  width: 60px;
  border-radius: 4px;
  font-size: 14px;
  padding: 2px 8px;
  cursor: pointer;
  color: #000;
  background-color: #e6a23c;
  height: 30px;
  line-height: 30px;
  text-align: center;
  margin: auto;
  // border: 1px solid #67c23a;
}
:deep(.el-form-item__label) {
  font-weight: bolder;
}

.export-extra {
  background-color: #ee4d2d;
}
.all-btn {
  height: 44px;
  width: 150px;
}
</style>
