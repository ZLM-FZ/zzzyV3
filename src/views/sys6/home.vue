<template>
  <div class="sys4-box">

    <Config :dialogVisible="configVisible" @onOk="configVisible = false" @onCancel="confCancle" />
    <el-button class="conf-btn" @click="configVisible = true">规格金额配置</el-button>
    <el-button class="empt-btn" type="warning" @click="empty">清空全部</el-button>
    <!-- 主内容 -->
    <Upload ref="unploadRef" @onOk="getData" />
    <!-- <el-divider></el-divider> -->
    <Goods ref="goodsRef" v-if="step==='2'" :fileName='fileName' :startIndex="startIndex" :_EXPORT_DATAS="completeDataSource" />
    <!-- {{completeDataSource}} -->
    <div class="zdy-ipt">

下载文件名: <el-input :clear="true" size="small" style="width: 240px;margin-right:16px" v-model="fileName" placeholder="下载文件名"></el-input>
<!-- excel的索引： <el-input size="small" style="width: 60px" v-model="startIndex" placeholder="开始索引,默认1"></el-input> -->
</div>
  </div>
</template>
<script>
import { cloneDeep as _cloneDeep } from "lodash";
import Upload from "./upload/index.vue";
import Goods from "./goods/index.vue";
import Config from "./config";
import { isEmpty as _isEmpty, findIndex as _findIndex } from "lodash";
import { _allSpecDatas, __testDatasObj } from "./utils/main.js";
import { mokeData } from './mock.js'


const __win_data = JSON.parse(window.localStorage.getItem("__sys4-base")) || {};

export default {
  name: "Home",
  components: {
    Upload,
    Goods,
    Config,
  },
  mounted() { },
  data: () => {
    return {
      configVisible: _isEmpty(__win_data) ? true : false,
      completeDataSource: {},
      step:'1',// 1-2-3-4
      fileName: "",
      startIndex: "1",
    };
  },
  methods: {
    getData(objs) {
      // console.log(JSON.stringify(objs),'=====')
      this.completeDataSource = _allSpecDatas(objs);
      this.$message({
        message: "汇总导入成功，快去下载",
        showClose: true,
        type: "success",
        duration: 1500,
        offset: 10,
      });
      this.step ='2'
      console.log(this.completeDataSource, "转的数据");
      // console.log(JSON.stringify(res), "--getData");
    },
    //清空
    empty() {
      this.$refs.unploadRef.empty();
      this.completeDataSource = {};
      this.$refs.goodsRef.empty();
      this.step = '1'
      
    },
    confCancle() {
      this.configVisible = false;
      window.location.reload();
    },
  },
};
</script>
<style lang="less" scoped>
.sys4-box {
  position: relative;
}

.conf-btn {
  position: absolute;
  right: 0px;
  top: 0px;
  box-shadow: 0px 0px 10px #909399;
  z-index: 20;
}

.empt-btn {
  position: absolute;
  top: 0;
  right: 160px;
  z-index: 12;
}
.zdy-ipt {
  display: flex;
  margin-bottom: 24px;
  margin-top: 80px;
}
</style>