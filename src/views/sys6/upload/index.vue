<template>
  <el-card class="box-card">
    <el-upload action="#" :auto-upload="false" :on-change="onChange" :on-remove="handleRemove" :file-list="fileList" multiple
               accept=".xls,.xlsx">
      第一步：
      <el-button type="primary">选择文件</el-button>
    </el-upload>
    <div class="exp">
      第二步：
      <el-button type="danger" style="width:350px"
                 @click="submit">（选择文件{{fileList.length || 0}}个）-----导入-----（导入成功{{dataSource.length}}个）</el-button>
    </div>

  </el-card>
</template>

<script>
import { _setDataFormat, _restoreDataFormat, _setDataFormatBefore } from "./main";
const xlsx = require("xlsx");
const __win_data = JSON.parse(window.localStorage.getItem("__sys4-base")) || {};

export default {
  data() {
    return {
      fileList: [],
      dataSource: [],
    };
  },
  methods: {
    handleRemove(file, fileList) {
      this.fileList = fileList;
    },
    onChange(file, fileList) {
      this.fileList = fileList;
    },
    empty() {
      this.fileList = [];
      this.dataSource = [];
    },
    async submit() {
      this.dataSource = [];
      await this.fileList.map((item) => {
        this.readerFiles(item);
      });
      setTimeout(() => {
        this.getFlatDataSource();
      }, 500);
    },
    async readerFiles(file) {
      /**
       * 1. 使用原生api去读取好的文件
       * */
      // console.log("原始上传的文件", file);
      // 读取文件不是立马能够读取到的，所以是异步的，使用Promise
      let dataBinary = await new Promise((resolve) => {
        // Web API构造函数FileReader，可实例化对象，去调用其身上方法，去读取解析文件信息
        let reader = new FileReader(); // https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader
        // console.log("实例化对象有各种方法", reader);
        reader.readAsBinaryString(file.raw); // 读取raw的File文件
        reader.onload = (ev) => {
          // console.log("文件解析流程进度事件", ev);
          resolve(ev.target.result); // 将解析好的结果扔出去，以供使用
        };
      });
      // console.log("读取出的流文件", dataBinary);

      /**
       * 2. 使用xlsx插件去解析已经读取好的二进制excel流文件
       * */
      let workBook = xlsx.read(dataBinary, { type: "binary", cellDates: true });
      // excel中有很多的sheet，这里取了第一个sheet：workBook.SheetNames[0]
      let firstWorkSheet = workBook.Sheets[workBook.SheetNames[0]];
      // 分为第一行的数据，和第一行下方的数据
      const header = this.getHeaderRow(firstWorkSheet);
      //   console.log("读取的excel表头数据（第一行）", header);
      const data = xlsx.utils.sheet_to_json(firstWorkSheet);
      // console.log("读取所有excel数据", data);
      this.dataSource.push(data);
    },
    getHeaderRow(sheet) {
      const headers = []; // 定义数组，用于存放解析好的数据
      const range = xlsx.utils.decode_range(sheet["!ref"]); // 读取sheet的单元格数据
      let C;
      const R = range.s.r;
      /* start in the first row */
      for (C = range.s.c; C <= range.e.c; ++C) {
        /* walk every column in the range */
        const cell = sheet[xlsx.utils.encode_cell({ c: C, r: R })];
        /* find the cell in the first row */
        let hdr = "UNKNOWN " + C; // <-- replace with your desired default
        if (cell && cell.t) hdr = xlsx.utils.format_cell(cell);
        headers.push(hdr);
      }
      return headers; // 经过上方一波操作遍历，得到最终的第一行头数据
    },
    //转成一维数组
    setOneArrFormat() {
      const oneDArray = this.dataSource.reduce((accumulator, currentValue) => {
        return accumulator.concat(currentValue);
      }, []);
      return oneDArray;
    },
    // 把excel的key映射回英文
    getFlatDataSource() {
      if (this.dataSource.length === 0) {
        this.$message.error("请先导入数据");
        return;
      }
      let arrs = this.setOneArrFormat();
      // 转格式之前先看有咩有开启过滤禁止处理的订单
      if(__win_data.isFilterJZCL){
        arrs = _setDataFormatBefore(arrs);
      }
      const enArrs = _setDataFormat(arrs);
      const res = _restoreDataFormat(enArrs);

      console.log('结果》》》》》',res )
      this.$emit("onOk", res);

      return res;
    },
  },
};
</script>
<style lang="less" scoped>
.box-card {
  height: 240px;
  overflow-y: auto;
  position: relative;
}
.exp {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0px;
  z-index: 20;
}
:deep(.el-upload-list) {
  display: flex;
  flex-wrap: wrap;
  height: 120px;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.25);
}
:deep(.el-upload-list__item) {
  width: 50%;
}
</style>