import {
  findIndex as _findIndex,
  map as _map,
  uniq as _uniq,
  uniqBy as _uniqBy,
  find as _find,
  cloneDeep as _cloneDeep,
  some as _some,
  includes as _includes,
  every as _every,
  compact as _compact,
  has as _has,
  isEmpty as _isEmpty,
  toLower as _toLower,
} from "lodash";
import { _setColor } from "../upload/basicConf.js";

const __win_data = JSON.parse(window.localStorage.getItem("__sys4-base"));
const specBtns = __win_data?.btns;

//查相同买家
export const _getSameBuyer = ({ orderDataSource }) => {
  const userBuyOnce = [];
  const userBuyMore = [];
  const buyOnceOrderCodes = [];
  const buyMoreOrderCodes = [];
  const moreCodesAndColor = [];
  //只有这里知道谁跟谁相同

  orderDataSource.map((item) => {
    const sBuyColor = _setColor();
    const inx = userBuyOnce.indexOf(item.buyerAccount);
    //如果不曾存在这个单，加进去
    if (inx === -1) {
      userBuyOnce.push(item.buyerAccount);
      buyOnceOrderCodes.push(item.orderCode);
    } else {
      userBuyMore.push(item.buyerAccount); //名字可能重复了，但是单号没重复
      //订单号给到多个里，因为订单号一定不同
      buyMoreOrderCodes.push(buyOnceOrderCodes[inx]);
      buyMoreOrderCodes.push(item.orderCode);
      //商家颜色要保持一样，所以多一个格式回来
      moreCodesAndColor.push({ code: buyOnceOrderCodes[inx], sBuyColor });
      moreCodesAndColor.push({ code: item.orderCode, sBuyColor });

      //单个里排除
      userBuyOnce.splice(inx, 1); //存在多个，你删
      buyOnceOrderCodes.splice(inx, 1);
    }
  });
  return {
    //这些没用上，就不返回出去了
    // userBuyOnce,
    // userBuyMore: Array.from(new Set(userBuyMore)),
    // buyOnceOrderCodes,
    moreCodesAndColor: _uniqBy(moreCodesAndColor, "code"),
    buyMoreOrderCodes: _uniq(buyMoreOrderCodes),
  };
};

//---------------------不定制---------------------
export const _noCustomized = ({ orderDataSource }) => {
  //单独判断不定制全等才行。（因为不定制规格固定了）
  const specFunc = ({ key, orderDataSource }) => {
    const obj = _find(specBtns, ["value", key]);
    const options = obj.specs; //正常对比的所有的规格

    const orderCode = [];
    const _instructionOrderCode = []
    orderDataSource.map((item) => {
      //拿出所有商品的所有规格(去重)
      const goods = _map(item.goodsList, "spec");
      const specOptions = _uniq(goods); //去重
      //被对比的所有商品规格
      //所有商品的规格都符合不定制的规格，才算是不定制
      // const res = _some(options, (value) => _includes(specOptions, value));
      // console.log(res,'===111')
      let result = !_some(specOptions, function (value) {
        return !_includes(options, value);
      });
      // console.log(result,'===22222',res)
      // console.log(options,'===',specOptions)
      // 购买不定制的，又备注了定制信息
      const _instructionList =_compact(_uniq(_map(item.goodsList, "_instruction")))
      if (result) {
        if(_instructionList.length>0){
          _instructionOrderCode.push(item.orderCode)
        }else{
          orderCode.push(item.orderCode);
        }
      }
    });
    return {
      orderCode,
      _instructionOrderCode
    };
  };
  const noCustOrderCodesObj = specFunc({
    key: "sys4-noCustomized",
    orderDataSource,
  });
  return {
    noCustOrderCodes: _uniq(noCustOrderCodesObj.orderCode),
    noCustOrderCodesHasRemark:_uniq(noCustOrderCodesObj._instructionOrderCode)
  };
};

//---------------------默认定制--------------------
export const _customized_default = ({ orderDataSource }) => {
  //单独判断不定制全等才行。（因为不定制规格固定了）
  const specFunc = ({ orderDataSource }) => {
    // 现在没有这个rgSpec，因为只要不是定制的，都人工审核
    const options = _map(__win_data?.rgSpec, "value"); //正常对比的所有的规格

    const orderCode = [];
    orderDataSource.map((item) => {
      //拿出所有商品的所有规格(去重)
      const goods = _map(item.goodsList, "spec");
      const specOptions = _uniq(goods); //去重
      //被对比的所有商品规格specOptions,都不存在在对比规格里options，才算是对的
      let result = _every(specOptions, function (value) {
        return !_includes(options, value);
      });
      // console.log(result,specOptions,'==默认定制==',options)
      if (result) {
        orderCode.push(item.orderCode);
      }
    });
    return orderCode;
  };
  const custDefaultOrderCodes = specFunc({
    orderDataSource,
  });
  return {
    custDefaultOrderCodes: _uniq(custDefaultOrderCodes),
  };
};
//---------------------人工定制：有备注---------------------
export const _examine_hasRemark = ({ orderDataSource }) => {
  const examine_hasRemark_Codes = [];
  orderDataSource.map((item) => {
    // 判断有咩有定制信息,true-是定制；false-不是定制
    const res_spec = _some(item.goodsList, item => {
      const spec = _toLower(item.spec);
      return spec!== 'no' && spec!== '';
    });
  // 判断有咩有备注定制信息，true-有备注定制信息，false-没有
    const res_instruction =  _some(item.goodsList, (obj) => _has(obj, '_instruction') &&!_isEmpty(obj['_instruction']));
    // 定制里，但是没写订单备注和客人备注定制姓名号码的，统一为定制没备注
    if (!item.orderRemark && !res_instruction && !res_spec) {
      examine_hasRemark_Codes.push(item.orderCode);
    }
  });
  return {
    examineHasNoRemarkCodes: _uniq(examine_hasRemark_Codes),
  };
};
