<template>
  <el-dialog :append-to-body="true" :close-on-click-modal="false" :visible.sync="dialogVisible" title="配置信息" width="70%"
    height="500px" :before-close="onCancel">
    <el-tabs value="customized" @tab-click="handleClick" class="demo-dynamic">
      <!-- <el-tab-pane label="金额" name="priceLimit">
        <el-form :model="formData" ref="formData">
          <el-form-item prop="money" :rules="[{ required: true, message: '不能为空保存', trigger: 'blur' },]">
            <el-input v-model="formData.money" placeholder="设置超过多少钱拿出这个单"></el-input>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="saveMoney('formData')">保存</el-button>
      </el-tab-pane> -->
      <!-- （不需要买家备注规格不填了） -->
      <el-tab-pane :label="`补丁（${formData.patch.length}）`" name="customized">
        <SpecTable :data="formData.patch" @submit="customizedSubmit" />
      </el-tab-pane>
      <el-tab-pane :label="`不定制（${formData.ndzSpec.length}）`" name="noCustomized">
        <SpecTable :data="formData.ndzSpec" @submit="noCustomizedSubmit" />
      </el-tab-pane>

      <el-tab-pane :label="`规格`" name="btns">
        <div v-for="item in formData.btns" :key="item.value">
          <p>{{ item.label }}</p>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="`其他`" name="orther">
        <p>
          <span>是否过滤禁止处理订单：</span>
          <el-switch v-model="formData.isFilterJZCL" active-color="#13ce66">
          </el-switch>
        </p>
        <p>
          <span>补丁是否使用中文：(关-中文、开-英文)</span>
          <el-switch v-model="formData.isPathUseEN" active-color="#13ce66">
          </el-switch>
        </p>
        <p>
          <span>是否开启同个买家购买多件：</span>
          <el-switch v-model="formData.sameBuyerBUyMore" active-color="#13ce66">
          </el-switch>
        </p>
        <p>
          <span>是否开启【定制+缺少定制信息】：</span>
          <el-switch v-model="formData.dzNoDzInfo" active-color="#13ce66">
          </el-switch>
        </p>
        <el-button style="margin-left:20%;margin-bottom: 34px;" type="primary" @click="submit3()">保存</el-button>
        <img class="imgSize" src="@/assets/step/image11.png" alt="Dynamic Image">
      </el-tab-pane>
      <el-tab-pane :label="`使用教程`" name="step">
        <p>导出方式+导出模板：</p>
        <img class="imgSize" src="@/assets/image.png" alt="Dynamic Image">
        <!-- <p>小秘配置选项：9个 </p>
        <el-alert
          style="margin-bottom: 20px;"
          class="stepT"
          title="订单号、产品规格、商品图片网址、产品总数、订单备注、买家账号、买家Email、买家留言、订单标识、"
          type="error"
          :closable="false">
        </el-alert>
        <img class="imgSize" src="@/assets/step/image0.png" alt="Dynamic Image">
        <img class="imgSize" src="@/assets/step/image1-0.png" alt="Dynamic Image">
        <img class="imgSize" src="@/assets/step/image1-1.png" alt="Dynamic Image">
        <img class="imgSize" src="@/assets/step/image1-2.png" alt="Dynamic Image">
        <img class="imgSize" src="@/assets/step/image2.png" alt="Dynamic Image">
        <img class="imgSize" src="@/assets/step/image3.png" alt="Dynamic Image">
        <img class="imgSize" src="@/assets/step/image4.png" alt="Dynamic Image">
        <img class="imgSize" src="@/assets/step/image5.png" alt="Dynamic Image">
        <img class="imgSize" src="@/assets/step/image6.png" alt="Dynamic Image">
        <el-alert
          title="其他流程也可以看："
          type="info"
          :closable="false">
        </el-alert>
        <img class="imgSize" src="@/assets/step/image10.png" alt="Dynamic Image">
        <img class="imgSize" src="@/assets/step/image10-1.png" alt="Dynamic Image"> -->
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>
<script>
import { findIndex as _findIndex, isEmpty as _isEmpty } from "lodash";
import { _BTNS, _MONEY, _SPEC_customized_rengong, _SPEC_nocustomized } from "../utils/enum.js";
import SpecTable from "./SpecTable.vue";
const __win_data = JSON.parse(window.localStorage.getItem("__sys4-base")) || {};
console.log(!_isEmpty(__win_data) ? __win_data.btns : _BTNS, 44454);
export default {
  components: {
    SpecTable,
  },
  props: ["dialogVisible"],   
  data() {
    return {
      formData: {
        isPathUseEN: !_isEmpty(__win_data) && __win_data.isPathUseEN,
        sameBuyerBUyMore: !_isEmpty(__win_data) && __win_data.sameBuyerBUyMore,
        dzNoDzInfo: !_isEmpty(__win_data) && __win_data.dzNoDzInfo,
        isFilterJZCL: !_isEmpty(__win_data) && __win_data.isFilterJZCL,
        ndzSpec: !_isEmpty(__win_data) ? __win_data.ndzSpec : _SPEC_nocustomized, //不定制
        // dzSpec: !_isEmpty(__win_data) ? __win_data.dzSpec : [], //定制
        patch: !_isEmpty(__win_data) ? __win_data.patch : _SPEC_customized_rengong, //定制:买家自己备注的规格
        money: !_isEmpty(__win_data) ? __win_data.money : _MONEY, //按钮
        btns: !_isEmpty(__win_data) ? __win_data.btns : _BTNS, //按钮
      },
    };
  },
  methods: {
    handleClick(tab, event) {
      // console.log(tab, event);
    },

    // 弹窗
    onCancel() {
      this.$emit("onCancel");
    },
    //-------保存定制--------
    customizedSubmit(data) {
      console.log("查看定制规则======", data);
      this.formData.patch = data;
      this.specLocalData();
    },
    //-------保存不定制--------
    noCustomizedSubmit(data) {
      console.log("查看不定制规则======", data);
      this.formData.ndzSpec = data;
      this.specLocalData();
    },
    //-------保存金额--------
    //保存数据
    specLocalData() {
      const ndzInx = _findIndex(_BTNS, ["value", "sys4-noCustomized"]);
      this.formData.btns[ndzInx].specs = this.getKeys(this.formData.ndzSpec);

      // //每次保存都属性按钮
      window.localStorage.setItem("__sys4-base", JSON.stringify(this.formData));
      this.$message.success("配置成功");
    },
    //
    getKeys(arr) {
      return arr.map((item) => item.value);
    },
    submit3(){
      window.localStorage.setItem("__sys4-base", JSON.stringify(this.formData));
      this.$message.success("配置成功");
    }
  },
};
</script>
<style lang="less" scoped>
:deep(.el-dialog__body) {
  padding: 0 20px 20px;
}

.display-flex {
  display: flex;
  align-items: center;
}

.demo-dynamic {
  height: 500px;
  overflow-y: auto;
}

.imgSize {
  width: 100%;
}

.stepT {
  font-weight: bold;
  margin-bottom: 24px;
  color: #000;
}
</style>