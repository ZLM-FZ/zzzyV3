import {
  chunk as _chunk,
  find as _find,
  flatten as _flatten,
  isEmpty as _isEmpty
} from "lodash";
import { emptyLeftTable, indexOrderTable, orderTable } from "./excelFormat";

export const _orderTabel = (dataObj, downBtns) => {
  const {
    _sameBuyerDataSource,
    _nocustomizedDataSource,
    _examineDataSource,
    _nocustomizedDataSourceHasRemark,
    _examineDataSourceHasNoRemark
  } = dataObj;
  // 同个买家
  let s_idx = 1
  const sObj = _find(downBtns,['valKey','_sameBuyerDataSource'])
  if(!_isEmpty(sObj)){
    s_idx = sObj['startIdx']
  }
  // 定制没备注定制信息
  let e_idx0 = 1
  const emObj = _find(downBtns,['valKey','_examineDataSourceHasNoRemark'])
  if(!_isEmpty(emObj)){
    e_idx0 = emObj['startIdx']
  }
  // 其他
  const n_idx0 = _find(downBtns,['valKey','_nocustomizedDataSource'])['startIdx'] || 1
  const n_idx1 = _find(downBtns,['valKey','_nocustomizedDataSourceHasRemark'])['startIdx'] || 1
  const e_idx1 = _find(downBtns,['valKey','_examineDataSource'])['startIdx'] || 1

  const resObj = {
    // 同个买家下多个订单
    _sameBuyerDataSource: setExcelTabel(
      getAll_goodsList(_sameBuyerDataSource),
      s_idx
    ),
    //不定制
    _nocustomizedDataSource: setExcelTabel(
      getAll_goodsList(_nocustomizedDataSource),
      n_idx0
    ),
    _nocustomizedDataSourceHasRemark: setExcelTabel(
      getAll_goodsList(_nocustomizedDataSourceHasRemark),
      n_idx1
    ),
    //定制，没备注定制信息
    _examineDataSourceHasNoRemark: setExcelTabel(
      getAll_goodsList(_examineDataSourceHasNoRemark),
      e_idx0
    ),
   //人工审核
    _examineDataSource: setExcelTabel(
      getAll_goodsList(_examineDataSource),
      e_idx1
    ),
  };
  // console.log(resObj, "--textColor");
  return resObj;
};

//拿出所有的商品
const getAll_goodsList = (datasAll) => {
  const arr = datasAll?.map((item) => item.goodsList);
  return _flatten(arr);
};

// 去掉no,No,With name and number
const _formatSpec = (str)=>{
  if(str === 'NO' || str === 'No' || str === 'no' || str === 'onlyHasPatch'){
    return ''
  }
  return str
}
/**
 * 做单真 xlsx：与 setExcelTabel 相同分块与序号
 * @param {Array} orderGroupsArray 某一类订单数组（含 goodsList）
 * @param {string|number} startIndexStr startIdx
 */
export function prepareOrderExportChunks(orderGroupsArray, startIndexStr) {
  const goodsList = getAll_goodsList(orderGroupsArray);
  let defineIndex = parseInt(String(startIndexStr), 10);
  if (Number.isNaN(defineIndex)) defineIndex = 1;
  const chunkArrs = _chunk(goodsList, 4);
  return chunkArrs.map((arr) => {
    const row = {
      leftIndex: defineIndex,
      slots: arr.map((item) => ({
        textColor: item.textColor,
        imgUrl: item.imgUrl,
        bdAndgg: item.bdAndgg || "",
        _instruction: item._instruction || "",
        business: item.buyerAccount,
        spec: _formatSpec(item.spec),
        size: item.size,
        order_sn: item.orderCode,
        sBuyColor: item.sBuyColor || "",
        orderRemark: item.orderRemark,
      })),
    };
    defineIndex += 1;
    return row;
  });
}

const setExcelTabel = (arrs, defineIndex) => {
  //先分4块一组
  const chunkArrs = _chunk(arrs, 4);
  //变换成table
  const res = [];
  chunkArrs.map((arr, i) => {
    // 先设置索引table
    let obj = {
      left: indexOrderTable(defineIndex),
    };
    //每一组的小数据
    arr.map((item, j) => {
      obj[`data${j}`] = orderTable({
        textColor: item.textColor,
        img: item.imgUrl,
        DZbuyName: "", //定制的人工加
        DZnumber: "", //定制的自己人工加
        bdAndgg:item.bdAndgg || '', // 补丁
        _instruction:item._instruction || '',
        business: item.buyerAccount,
        spec: _formatSpec(item.spec),// 定制的姓名和号码
        size: item.size,
        order_sn: item.orderCode,
        sBuyColor: item.sBuyColor || "",
        buyerEmail: item.buyerEmail,
        orderRemark: item.orderRemark,
      }); //一定要j,excel的列唯一
      obj[`empty${j}-`] = emptyLeftTable;
    });
    res.push(obj);
    //每一组，defineIndex++
    defineIndex++;
  });

  return res;
};
