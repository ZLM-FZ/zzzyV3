
<template>
  <div>
    <el-table ref="table" :data="tableData" border height="400" style="width: 100%">
      <el-table-column type="index" label="序号" width="50">
      </el-table-column>
      <el-table-column prop="value" label="英文规格">
        <template slot-scope="scope">
          <el-input type="text" placeholder="请输入英文规格" v-show="scope.row.isEdit" v-model="scope.row.value">
          </el-input>
          <span v-show="!scope.row.isEdit">{{scope.row.value}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="label" label="中文规格">
        <template slot-scope="scope">
          <el-input type="text" placeholder="请输入中文规格" v-show="scope.row.isEdit" v-model="scope.row.label">
          </el-input>
          <span v-show="!scope.row.isEdit">{{scope.row.label}}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="150">
        <template slot-scope="scope">
          <el-button v-if="!scope.row.isEdit" @click="edit(scope, true)" size="small">编辑</el-button>
          <el-button v-else-if="scope.row.isEdit" @click="edit(scope, false)" size="small">完成</el-button>
          <el-button @click="del(scope)" type="danger" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="add-list">
      <el-button type="info" icon="el-icon-plus" @click="add()">新增</el-button>
      <el-button style="margin-left:20%" type="primary" @click="submit()">保存</el-button>
    </div>
  </div>
</template>
<script>
import { isEmpty } from "lodash";
export default {
  props: ["data"],
  watch: {
    data: {
      handler: "initData",
      immediate: true,
    },
  },
  data() {
    return {
      tableData: [],
    };
  },
  methods: {
    initData(data) {
      this.tableData = data;
    },
    submit() {
      const _tableData = this.tableData.map((item) => {
        if (isEmpty(item.label) && isEmpty(item.value)) {
          this.$message.error("规则信息不能为空!");
          return;
        }
        return {
          label: item.label.trim(),
          value: item.value.trim(),
        };
      });
      console.log(_tableData, "--_tableData");
      this.$emit("submit", _tableData);
    },
    add() {
      this.defaultState();
      this.tableData.push({
        label: "",
        value: "",
        isEdit: true,
      });
      // 设置滚动条位置
      setTimeout(() => {
        // TODO：暂时写死
        this.$refs.table.bodyWrapper.scrollTop = 9999;
      }, 500);
    },
    edit(item, state) {
      this.defaultState();
      this.$set(this.tableData, item.$index, {
        ...item.row,
        isEdit: state,
      });
    },
    del(item) {
      this.tableData.splice(item.$index, 1);
    },
    // 默认为非编辑状态
    defaultState() {
      this.tableData = this.tableData.map((item) => {
        return {
          ...item,
          isEdit: false,
        };
      });
    },
  },
};
</script>
<style lang="less" scoped>
.add-list {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}
</style>