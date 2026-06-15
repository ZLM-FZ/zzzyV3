import { _setKeyCnToEn } from "../utils/enum.js";
import { cloneDeep as _cloneDeep, findIndex as _findIndex,some as _some,has as _has } from "lodash";
import { _removeSizeSymbol, _setColor,_splitChangPingGuiGe,_splitChangPingGuiGeOld, _setCnPatch,_setCnModel,_setCnSpecification} from "./basicConf.js";

// 
  export const _setDataFormatBefore = (datas) => {
    // 有些小秘没加订单标识，兼容一下
    const result = _some(datas, (obj) => _has(obj, '订单标识'));
    if(!result){
      return datas
    }

    const res =[]
    datas.map(item=>{
      for (const key in item) {
        if(key === '订单标识' && (item[key] === '无标识' || item[key] === '')){
          res.push(item) 
        }
      }
    })
    return res
  }
//把excel表中文key转英文
export const _setDataFormat = (datas) => {
  return datas.map((item) => {
    const obj = {};
    for (const key in item) {
      const val = item[key];
      const enKey = _setKeyCnToEn[key];
      //如果是产品规格，把规格和尺寸分出来
      if (key === "产品规格") {
        obj['_cpggAllInfo']=val
        //钥匙扣，袜子没有size
        if (val.indexOf("Size") === -1) {
          obj['bdAndgg'] = ''
          // 如果是袜子,袜子一定不定制
          if(val.indexOf('MODEL') !== -1){
            obj["size"] = _setCnModel(val.replace('MODEL:','')) 
            obj["spec"] = 'No'
          }else{
            obj["size"] = null;
            obj["spec"] = val;
          }
        } else {
          // 先把拿到的产品规格，规格里包含了（尺寸、补丁、是否定制）
          const strObj = _splitChangPingGuiGe(val)
          // 尺寸
          obj["size"] = strObj['size'] 
          // 定制
          obj["spec"] = strObj['customItems'] // 定制的姓名和号码
          obj["_customItems"] = _setCnPatch(strObj['customPatch'])
          // 定制：自己加了定制信息，跟备注放一起
          obj["_instruction"] = strObj['instruction'] || strObj['nameAndNumber'] || strObj['players']
          // 补丁
          obj["_customPatch"] = _setCnPatch(strObj['customPatch'])
          //重要，只有补丁，没有定制信息和号码，也算是定制
          // 所以要加一个判断
          if(obj["spec"] === 'NO' || obj["spec"] === 'No'  || obj["spec"] === 'no' ||obj["spec"] === ''){
            if(obj["_customPatch"]){
              obj["spec"]='onlyHasPatch'// 有补丁
            }
          }
          // 套装类型
          obj["_specification"] = _setCnSpecification(strObj['specification'] )
          // 补丁/规格
          obj['bdAndgg'] = obj["_customPatch"] || obj["_specification"]
        }
      } else if(key === "商品图片网址"){
        // 略图换 200px，平衡清晰度与体积
        obj[enKey] = val.replace("_100x.", "_200x.");
      } else {
        if (enKey) {
          obj[enKey] = val;
        }
      }
    }
    return obj;
  });
};

//还原订单数据，之前拿到的数据是平铺开的
export const _restoreDataFormat = (datas) => {
  const arrs = _cloneDeep(datas);
  const allOrderCodes = []; //所有单号
  const orders = [];
  arrs.map((item) => {
    const inx = allOrderCodes.indexOf(item.orderCode);
    const goods = [];
    const textColor = _setColor();
    for (let i = 0; i < item.number; i++) {
      goods.push({
        ...item,
        textColor,
        spec: item.spec,
        size: item.size,
        number: 1,
        imgUrl: item.imgUrl,
        orderCode: item.orderCode,
        buyerAccount: item.buyerAccount,
        buyerEmail: item.buyerEmail,
        buyerLiuyan: item.buyerLiuyan,
        orderRemark: item.orderRemark,
        productName: item.productName,
      });
    }
    //如果不曾存在这个单，加进去
    if (inx === -1) {
      allOrderCodes.push(item.orderCode);
      const obj = {
        orderCode: item.orderCode,
        amount: item.amount,
        buyerAccount: item.buyerAccount,
        orderRemark: item.orderRemark,
      };

      orders.push({ ...obj, goodsList: goods });
    } else {
      let allG = orders[inx].goodsList.concat(goods);
      //统一他们的颜色
      allG = allG.map((item) => {
        return { ...item, textColor };
      });
      //如果存在，只需要加商品即可了
      orders[inx].goodsList = allG;
    }
  });
  const obj = {
    flatDataSource: arrs,
    orderDataSource: orders,
    allOrderCodes,
  };
  return obj;
};
