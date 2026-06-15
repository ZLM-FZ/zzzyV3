<template>
  <el-form :model="formData" ref="formData" label-width="100px" class="demo-dynamic">
    <div class="block-btn">
      <div class="txtz">
        <div style="margin-bottom:6px">
            <span class="api-text">A-</span>
            <span>get_package_list</span>
        </div>
        <div>
            <span class="api-text">Aa-</span>
            <span>get_shipment_order_list_by_order_ids_multi_shop</span>
        </div>
      </div>
      
        <el-button class="maring-ri-16 main-btn" type="danger" @click="submitForm('formData')">转化数据</el-button>
        <el-button class="maring-ri-16" type="primary" @click="addNextPage">新增下一页</el-button>
        <el-button @click="resetForm('formData')">清空全部数据</el-button>
    </div>
    <div class="content">
      <div class="block-row maring-bot-16" v-for="(group, j) in formData.group" :key="j">
        <el-form-item label="Aa" class="parent-item" :prop="`group.${j}.parent`" :rules="[{ required: true, message: `请输入第${page_number}页的父` }]">
          <el-input type="textarea" :rows="2" v-model="group.parent"></el-input>
        </el-form-item>
        <!-- :label="'Ba' + ( group.childs.length -index)" -->

        <el-form-item
          v-for="(child, index) in group.childs"
          :label="'Ba' + (index + 1)"
          :key="child.key"
          :prop="'group.' + j + '.childs.' + index + '.value'"
          :rules="{
            required: false,
            message: 'Ba不能为空',
            trigger: 'blur',
          }"
        >
          <div class="item">
            <el-input :rows="3" class="maring-ri-16 pointer" type="textarea" v-model="child.value"></el-input>
            <el-button @click.prevent="removeChild(j, child)">删除这条</el-button>
          </div>
        </el-form-item>

        <el-form-item class="btns-item">
          <!-- <span v-if="j === 0" class="step">步骤一</span> -->

          第
          <!-- <span class="block-row-page">{{ formData.group.length-j }}</span> -->
          <span class="block-row-page">{{ j + 1 }}</span>

          页数据：
          <el-button size="medium" class="maring-ri-16" type="warning" @click="addChild(j)">新增一条Ba</el-button>
          <el-button size="small" type="info" @click.prevent="clearCurPage(j)">清空这页数据</el-button>
          <el-button size="small" @click.prevent="removeOnePage(j)">删除这页数据</el-button>
          <span class="child-num">已录Ba数：{{ group.childs.length }}</span>
        </el-form-item>
      </div>
    </div>
  </el-form>
</template>

<script>
import { get as _get, cloneDeep as _cloneDeep } from 'lodash'
const childsItems = [
  {
    value: '',
    key: Date.now() + 1,
  },
  {
    value: '',
    key: Date.now() + 2,
  },
  {
    value: '',
    key: Date.now() + 3,
  },
  {
    value: '',
    key: Date.now() + 4,
  },
  {
    value: '',
    key: Date.now() + 5,
  },
  {
    value: '',
    key: Date.now() + 6,
  },
  {
    value: '',
    key: Date.now() + 7,
  },
  {
    value: '',
    key: Date.now() + 8,
  },
]
export default {
  data() {
    return {
      page_number: 1, //第一页
      formData: {
        group: [
          {
            parent: '',
            childs: _cloneDeep(childsItems),
          },
        ],
      },
    }
  },
  methods: {
    //新增下一页
    addNextPage() {
      this.$emit('scrollTop')

      this.formData.group.push({
        parent: '',
        childs: _cloneDeep(childsItems),
        key: Date.now(),
      })
    },
    //删除一个Ba
    removeOnePage(inx) {
      const { group } = this.formData
      group.splice(inx, 1)
    },
    clearCurPage(inx) {
      const { group } = this.formData
      group[inx].parent = ''
      group[inx].childs = []
    },
    //提交
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          //取出最后一页的最后一个数据，做为结束订单号
          const lastOrderNum = this.getLastOrderNum() || ''
          this.$emit('save', { data: JSON.parse(JSON.stringify(this.formData)), lastOrderNum })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },

    //重置
    resetForm(formName) {
      window.__shop_save_datas = {
        fileName:'',
        timer:'',
        dataSource:[],
        allOrder_sn:[],
      }
      this.$refs[formName].resetFields()
    },
    //删除一个Ba
    removeChild(pInx, item) {
      const { group } = this.formData
      var index = group[pInx].childs.indexOf(item)
      if (index !== -1) {
        group[pInx].childs.splice(index, 1)
      }
    },
    //新增一个Ba
    addChild(pInx) {
      const { group } = this.formData
      const len = group[pInx].childs.length
      if (len > 7) {
        alert('一页最多8个Ba，小心仔细检查是否录重复页了')
      }
      group[pInx].childs.push({
        value: '',
        key: Date.now(),
      })
    },

    //获取最后一个单号
    getLastOrderNum() {
      const inx = this.page_number - 1
      const pageApiData = this.getGroup(inx)
      //取最后一组数据
      const allArr = _get(pageApiData, 'data.package_list') //所有数据只取data数组数据
      const len = allArr.length //所有订单条数
      const obj = allArr[len - 1] //最后一条单
      const res = _get(obj, 'order_sn')
      return res
    },

    // 获取指定的group对象
    getGroup(inx) {
      const { group } = this.formData
      const str = group[inx].parent //最后一页数据
      const obj = JSON.parse(str)
      return obj
    },
  },
}
</script>
<style lang="less" scoped>
.item {
  display: flex;
}
.maring-ri-16 {
  margin-right: 16px;
}
.maring-bot-16 {
  margin-bottom: 16px;
}
.pointer {
  cursor: pointer;
}
.content {
  padding-top: 60px;
}
.btns-item {
  text-align: right;
}
.block-btn {
  padding-top: 10px;
  background-color: #e5e9f2;
  padding-bottom: 10px;
  position: fixed;
  width: 100%;
  z-index: 102;
}
.block-row {
  background-color: #fafafa;
  border: 2px solid #dcdfe6;
  padding-top: 20px;
  &-page {
    color: red;
    font-weight: bolder;
  }
}

.parent-item {
  border: red;
}
.step {
  font-size: 26px;
  color: red;
}
// .position-relative{
//    position: relative;
// }
.child-num {
  margin-right: 20px;
  color: red;
  font-size: 14px;
}
.parent-item {
  :deep(.el-textarea__inner) {
    border: 1px solid black;
  }
}
.api-text {
  color: black;
  font-weight: bolder;
  font-size: 16px;
}
.txtz{
  position: absolute;
  right: 0;
}
.main-btn{
  width: 200px;
}
</style>
