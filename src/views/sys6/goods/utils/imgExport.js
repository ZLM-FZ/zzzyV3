import {
  findIndex as _findIndex,
  chunk as _chunk,
  map as _map,
  cloneDeep as _cloneDeep,
  flatten as _flatten,
} from "lodash";
import { imgEmptyLeftTable, imgTable } from "./excelFormat.js";

/**
 * 报货真 xlsx 用：与 _exportTabel 相同聚合/排序后按 4 条一组切块（纯数据，无 HTML）
 * @returns {Array<Array<{ imgUrl: string, specStr: string, productName: string }>>}
 */
export function prepareReportImgChunks(flatDataSource) {
  const imgDataSource = _filterLmgData(flatDataSource);
  const sortDataSource = _flatten(_sortDataSource(imgDataSource));
  const rows = sortDataSource.map((item) => ({
    imgUrl: item.imgUrl,
    specStr: _map(item.sizeNum, "size_num_str").join("/"),
    productName: item.productName || "",
  }));
  return _chunk(rows, 4);
}

// 转图片格式
export const _exportTabel = (flatDataSource) => {
  //数据拿图片，整尺寸和数量完毕
  const imgDataSource = _filterLmgData(flatDataSource);
  //给尺寸从小到大排序
  const sortDataSource = _flatten(_sortDataSource(imgDataSource));
  // console.log(sortDataSource, "--sortDataSource");
  //转excel的格式输出
  const exportData = _setExportTabel(sortDataSource);
  return exportData;
};

//-------------生成table----------------
const _setExportTabel = (arr) => {
  const chunkArrs = _chunk(arr, 4);
  const res = [];
  chunkArrs.map((arr0) => {
    let obj = {};
    arr0.map((item, j) => {
      const sNStr = _map(item.sizeNum, "size_num_str").join("/");
      obj[`picture-picture-picture${j}`] = imgTable({
        img: item.imgUrl,
        specStr: sNStr,
        productName: item.productName,
      }); //一定要j,excel的列唯一
      obj[`empty${j}-`] = imgEmptyLeftTable;
    });
    res.push(obj);
  });
  return res;
};
const SizeType = [
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "12",
  "14",
  "16",
  "18",
  "20",
  "22",
  "24",
  "26",
  "28",
  "30",
];
//-------------排序转好的数据源----------------
const _sortDataSource = (arr) => {
  return arr.map((data) => {
    const res = data.sizeNum.sort((a, b) => {
      // 根据数组下标大小判断排序
      return SizeType.indexOf(a.size) - SizeType.indexOf(b.size);
    });
    return { imgUrl: data.imgUrl, sizeNum: res ,productName:data.productName};
  });
};
//-------------尺寸、数量、图片处理----------------
const _filterLmgData = (arr) => {
  const imgOriginalArr = []; //图片源数据
  arr.map((item) => {
    const productName = item.productName || ''
    const href = item.imgUrl;
    //step1: 先找这个图片在不在
    const i = _findIndex(imgOriginalArr, ["imgUrl", href]);
    //step2: 尺寸
    const size = item.size;
    //step3: 当前尺寸的
    const number = item.number;

    //step1：不存在，新加进去
    if (i === -1) {
      const sp = setSizeNum(size, number);
      const obj = {
        imgUrl: href,
        sizeNum: [sp],
        productName,
      };
      imgOriginalArr.push(obj);
    } else {
      //step1:如果已经存在了,图片不变，尺寸和数量变
      setAlreadySize(imgOriginalArr[i], { size, number });
    }
  });

  return imgOriginalArr;
};

//已经存在图片，找这个尺寸存不存在
const setAlreadySize = (obj, { size, number }) => {
  //找size
  const i = _findIndex(obj.sizeNum, ["size", size]);
  //没找到
  if (i === -1) {
    const sp = setSizeNum(size, number);
    obj.sizeNum.push(sp);
  } else {
    obj.sizeNum[i].number += number;
    obj.sizeNum[i].size_num_str = size + obj.sizeNum[i].number;
  }
};

//设置固定数据格式方便转出
const setSizeNum = (size, number) => {
  return {
    size,
    number,
    size_num_str: size + number,
  };
};
