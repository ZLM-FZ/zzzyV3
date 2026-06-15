import { cloneDeep as _cloneDeep, findIndex as _findIndex } from "lodash";
import { jianhaoInit } from './jianhao.js';
import {
  _examine_hasRemark,
  _getSameBuyer,
  _noCustomized
} from "./main-item.js";
const __win_data = JSON.parse(window.localStorage.getItem("__sys4-base"));

/**
 //1、先拿出同个商家
  //3、拿出配置的规格
  //4、找不到规格的人工审核
 * 
 */
export const _allSpecDatas = (allDatasObj) => {
  const _DATA_OBJ = _cloneDeep(allDatasObj);
  // 数据是层层递减的哦,维护一个数据源orderDataSource，递减
  //-------------------相同的买家-------------------
  let _sameBuyerDataSource = []
  if(__win_data['sameBuyerBUyMore']){
    const { moreCodesAndColor } = _getSameBuyer({
      orderDataSource: _DATA_OBJ.orderDataSource,
    });
    _sameBuyerDataSource = getSpecDataBuyer({
      codeColorArrs: moreCodesAndColor,
      _DATA_OBJ,
    });
  }
  //-------------------先拿不定制的：规格是no\NO\'',但是不定制里会有备注了定制信息的（也要分出来）-------------------
  const { noCustOrderCodes,noCustOrderCodesHasRemark } = _noCustomized({
    orderDataSource: _DATA_OBJ.orderDataSource,
  });
  const _nocustomizedDataSource = getSpecData({
    codeArrs: noCustOrderCodes,
    _DATA_OBJ,
  });
  // 不定制写了备注
  const _nocustomizedDataSourceHasRemark = getSpecData({
    codeArrs: noCustOrderCodesHasRemark,
    _DATA_OBJ,
  });
  //-------------------默认定制-------------------
  //-------------------人工定制有备注-------------------
  const _jianhaoDataSource = jianhaoInit(_cloneDeep( _DATA_OBJ.orderDataSource))
  //定制里，但是没写订单备注和客人备注定制姓名号码的，统一为定制没备注
  //-------------------缺少定制信息，有bug，其实用不上了-------------------
  let _examineDataSourceHasNoRemark = []
  if(__win_data['dzNoDzInfo']){
    const { examineHasNoRemarkCodes } = _examine_hasRemark({
      orderDataSource: _DATA_OBJ.orderDataSource,
    });
    _examineDataSourceHasNoRemark = getSpecData({
      codeArrs: examineHasNoRemarkCodes,
      _DATA_OBJ,
    });
  }

  // ---定制，所有都在这里了
  const _examineDataSource = _DATA_OBJ.orderDataSource;

  const obj = {
    doOrdersDataSource: {
      _sameBuyerDataSource,
      _nocustomizedDataSource,
      _nocustomizedDataSourceHasRemark,
      _examineDataSource,
      _examineDataSourceHasNoRemark
    },
    flatDataSource: _DATA_OBJ.flatDataSource,
    allOrderCodes: _DATA_OBJ.allOrderCodes,
    jianhaoDataSource: _jianhaoDataSource,
  };
  return obj;
};

//需要跳出的订单codeArrs，然后原来的数据源删掉跳出的订单，上面单号循环，能保证时间顺序
const getSpecData = ({ codeArrs, _DATA_OBJ }) => {
  const myDatas = [];
  codeArrs?.map((item) => {
    const inx = _findIndex(_DATA_OBJ.orderDataSource, ["orderCode", item]);
    if (inx !== -1) {
      myDatas.push(_DATA_OBJ.orderDataSource[inx]);
      _DATA_OBJ.orderDataSource.splice(inx, 1);
    }
  });
  return myDatas;
};

//同个商家的单独做数据吧,同个商家的，把商家颜色放上去
const getSpecDataBuyer = ({ codeColorArrs, _DATA_OBJ }) => {
  const myDatas = [];
  // 同个商家的，把商家颜色放上去
  codeColorArrs.map((item) => {
    const inx = _findIndex(_DATA_OBJ.orderDataSource, ["orderCode", item.code]);
    if (inx !== -1) {
      //给每个商品加商家颜色
      const obj = _DATA_OBJ.orderDataSource[inx];
      obj.goodsList = obj.goodsList.map((g) => {
        return {
          ...g,
          sBuyColor: item.sBuyColor,
        };
      });

      myDatas.push(obj);
      _DATA_OBJ.orderDataSource.splice(inx, 1);
    }
  });
  return myDatas;
};

export const __testDatasObj = {
  flatDataSource: [
    {
      orderCode: "1662292138481449087671",
      size: "L",
      spec: "With name and number",
      number: 1,
      imgUrl:
        "//img.fantaskycdn.com/071189fa405227d3de495d51e8adc8ab_100x.jpeg",
      orderRemark: "Hagi #10",
      buyerAccount: "sunky96@yahoo.com",
      buyerEmail: "sunky96@yahoo.com",
      buyerLiuyan: "留言",
    },
    {
      orderCode: "1395991138489286152387",
      size: "M",
      spec: "No",
      number: 1,
      imgUrl:
        "//img.fantaskycdn.com/aaebeb7633faff6e99276e32e9880b5c_100x.jpeg",
      orderRemark: "",
      buyerAccount: "kasa_25@hotmail.com",
      buyerEmail: "kasa_25@hotmail.com",
      buyerLiuyan: "",
    },
    {
      orderCode: "1395991138489286152387",
      size: "M",
      spec: "No",
      number: 1,
      imgUrl:
        "//img.fantaskycdn.com/1eeacaaef4316da28d489bd67eb0e0ee_100x.jpeg",
      orderRemark: "",
      buyerAccount: "kasa_25@hotmail.com",
      buyerEmail: "kasa_25@hotmail.com",
      buyerLiuyan: "",
    },
    {
      orderCode: "1395991138489286152387",
      size: "L",
      spec: "Other(Add In The Instruction)",
      number: 1,
      imgUrl: "//img.fantaskycdn.com/03d7b847393bba665fe6ffc5ff6623a7_100x.png",
      orderRemark: "",
      buyerAccount: "kasa_25@hotmail.com",
      buyerEmail: "kasa_25@hotmail.com",
      buyerLiuyan: "",
    },
    {
      orderCode: "1395991138583510800288",
      size: "S",
      spec: "No",
      number: 1,
      imgUrl: "//img.fantaskycdn.com/03d7b847393bba665fe6ffc5ff6623a7_100x.png",
      orderRemark: "",
      buyerAccount: "m.kanji1@icloud.com",
      buyerEmail: "m.kanji1@icloud.com",
      buyerLiuyan: "留言",
    },
    {
      orderCode: "1395991138583510800288",
      size: "S",
      spec: "No",
      number: 1,
      imgUrl:
        "//img.fantaskycdn.com/67677fcf7226a7c58409459742ceb9e6_100x.jpeg",
      orderRemark: "",
      buyerAccount: "m.kanji1@icloud.com",
      buyerEmail: "m.kanji1@icloud.com",
      buyerLiuyan: "",
    },
    {
      orderCode: "1395991138623663291000",
      size: "L",
      spec: "Rüdiger #22",
      number: 2,
      imgUrl:
        "//img.fantaskycdn.com/c00ff0a1f92bd0e2bbaf1a0c7718423d_100x.jpeg",
      orderRemark: "备注",
      buyerAccount: "andreas_krell@web.de",
      buyerEmail: "andreas_krell@web.de",
      buyerLiuyan: "",
    },
  ],
  orderDataSource: [
    {
      orderCode: "1662292138481449087671",
      buyerAccount: "sunky96@yahoo.com",
      orderRemark: "Hagi #10",
      goodsList: [
        {
          textColor: "#57e5da",
          spec: "With name and number",
          size: "L",
          number: 1,
          imgUrl:
            "//img.fantaskycdn.com/071189fa405227d3de495d51e8adc8ab_100x.jpeg",
          orderCode: "1662292138481449087671",
          buyerAccount: "sunky96@yahoo.com",
          buyerEmail: "sunky96@yahoo.com",
          buyerLiuyan: "留言",
          orderRemark: "Hagi #10",
        },
      ],
    },
    {
      orderCode: "1395991138489286152387",
      buyerAccount: "kasa_25@hotmail.com",
      orderRemark: "",
      goodsList: [
        {
          textColor: "#d595f3",
          spec: "No",
          size: "M",
          number: 1,
          imgUrl:
            "//img.fantaskycdn.com/aaebeb7633faff6e99276e32e9880b5c_100x.jpeg",
          orderCode: "1395991138489286152387",
          buyerAccount: "kasa_25@hotmail.com",
          buyerEmail: "kasa_25@hotmail.com",
          buyerLiuyan: "",
          orderRemark: "",
        },
        {
          textColor: "#d595f3",
          spec: "No",
          size: "M",
          number: 1,
          imgUrl:
            "//img.fantaskycdn.com/1eeacaaef4316da28d489bd67eb0e0ee_100x.jpeg",
          orderCode: "1395991138489286152387",
          buyerAccount: "kasa_25@hotmail.com",
          buyerEmail: "kasa_25@hotmail.com",
          buyerLiuyan: "",
          orderRemark: "",
        },
        {
          textColor: "#d595f3",
          spec: "Other(Add In The Instruction)",
          size: "L",
          number: 1,
          imgUrl:
            "//img.fantaskycdn.com/03d7b847393bba665fe6ffc5ff6623a7_100x.png",
          orderCode: "1395991138489286152387",
          buyerAccount: "kasa_25@hotmail.com",
          buyerEmail: "kasa_25@hotmail.com",
          buyerLiuyan: "",
          orderRemark: "",
        },
      ],
    },
    {
      orderCode: "1395991138583510800288",
      buyerAccount: "m.kanji1@icloud.com",
      orderRemark: "",
      goodsList: [
        {
          textColor: "#a659a3",
          spec: "No",
          size: "S",
          number: 1,
          imgUrl:
            "//img.fantaskycdn.com/03d7b847393bba665fe6ffc5ff6623a7_100x.png",
          orderCode: "1395991138583510800288",
          buyerAccount: "m.kanji1@icloud.com",
          buyerEmail: "m.kanji1@icloud.com",
          buyerLiuyan: "留言",
          orderRemark: "",
        },
        {
          textColor: "#a659a3",
          spec: "No",
          size: "S",
          number: 1,
          imgUrl:
            "//img.fantaskycdn.com/67677fcf7226a7c58409459742ceb9e6_100x.jpeg",
          orderCode: "1395991138583510800288",
          buyerAccount: "m.kanji1@icloud.com",
          buyerEmail: "m.kanji1@icloud.com",
          buyerLiuyan: "",
          orderRemark: "",
        },
      ],
    },
    {
      orderCode: "1395991138623663291000",
      buyerAccount: "andreas_krell@web.de",
      orderRemark: "备注",
      goodsList: [
        {
          textColor: "#81a622",
          spec: "Rüdiger #22",
          size: "L",
          number: 1,
          imgUrl:
            "//img.fantaskycdn.com/c00ff0a1f92bd0e2bbaf1a0c7718423d_100x.jpeg",
          orderCode: "1395991138623663291000",
          buyerAccount: "andreas_krell@web.de",
          buyerEmail: "andreas_krell@web.de",
          buyerLiuyan: "",
          orderRemark: "备注",
        },
        {
          textColor: "#81a622",
          spec: "Rüdiger #22",
          size: "L",
          number: 1,
          imgUrl:
            "//img.fantaskycdn.com/c00ff0a1f92bd0e2bbaf1a0c7718423d_100x.jpeg",
          orderCode: "1395991138623663291000",
          buyerAccount: "andreas_krell@web.de",
          buyerEmail: "andreas_krell@web.de",
          buyerLiuyan: "",
          orderRemark: "备注",
        },
      ],
    },
  ],
  allOrderCodes: [
    "1662292138481449087671",
    "1395991138489286152387",
    "1395991138583510800288",
    "1395991138623663291000",
  ],
};

// export const _EXPORT_DATAS = {
//   doOrdersDataSource: {
//     _sameBuyerDataSource: [
//       {
//         orderCode: "24010537X5TU001",
//         amount: 81.22,
//         buyerAccount: "xiangtong",
//         goodsList: [
//           {
//             textColor: "#978502",
//             spec: "Com nome e número",
//             size: "XXL",
//             number: 1,
//             imgUrl:
//               "https://s-cf-tw.shopeesz.com/file/cn-11134211-7r98o-llxxig4odujo68_tn",
//             orderCode: "24010537X5TU001",
//             buyerAccount: "xiangtong",
//             sBuyColor: "#546cb3",
//           },
//         ],
//       },
//       {
//         orderCode: "24010537X5TU002",
//         amount: 86.22,
//         buyerAccount: "xiangtong",
//         goodsList: [
//           {
//             textColor: "#aebffa",
//             spec: "Com nome e número",
//             size: "XXL",
//             number: 1,
//             imgUrl:
//               "https://s-cf-tw.shopeesz.com/file/cn-11134211-7r98o-llxxig4odujo68_tn",
//             orderCode: "24010537X5TU002",
//             buyerAccount: "xiangtong",
//             sBuyColor: "#546cb3",
//           },
//           {
//             textColor: "#aebffa",
//             spec: "Com nome e número",
//             size: "XXL",
//             number: 1,
//             imgUrl:
//               "https://s-cf-tw.shopeesz.com/file/cn-11134211-7r98o-llxxig4odujo68_tn",
//             orderCode: "24010537X5TU002",
//             buyerAccount: "xiangtong",
//             sBuyColor: "#546cb3",
//           },
//         ],
//       },
//       {
//         orderCode: "24010676MJGPC7",
//         amount: 88.22,
//         buyerAccount: "ryan_augusto_sg",
//         goodsList: [
//           {
//             textColor: "#44c240",
//             spec: "Com nome e número（1）",
//             size: "M",
//             number: 1,
//             imgUrl:
//               "https://s-cf-tw.shopeesz.com/file/cn-11134207-7r98o-lm1faxqo2e3ofa_tn",
//             orderCode: "24010676MJGPC7",
//             buyerAccount: "ryan_augusto_sg",
//             sBuyColor: "#b0b28f",
//           },
//         ],
//       },
//       {
//         orderCode: "240105379D4MBX",
//         amount: 88.22,
//         buyerAccount: "ryan_augusto_sg",
//         goodsList: [
//           {
//             textColor: "#706085",
//             spec: "Com nome e número（1）",
//             size: "M",
//             number: 1,
//             imgUrl:
//               "https://s-cf-tw.shopeesz.com/file/cn-11134207-7r98o-lm1isfrikb3655_tn",
//             orderCode: "240105379D4MBX",
//             buyerAccount: "ryan_augusto_sg",
//             sBuyColor: "#b0b28f",
//           },
//         ],
//       },
//     ],
//     _more230DataSource: [
//       {
//         orderCode: "24010676F8T1WU",
//         amount: 175.23,
//         buyerAccount: "danielepires7",
//         goodsList: [
//           {
//             textColor: "#b8133a",
//             spec: "Com nome e número（2）",
//             size: "S",
//             number: 1,
//             imgUrl:
//               "https://s-cf-tw.shopeesz.com/file/cn-11134207-7r98o-lm1faxqo3so41e_tn",
//             orderCode: "24010676F8T1WU",
//             buyerAccount: "danielepires7",
//           },
//           {
//             textColor: "#baea8a",
//             spec: "Com nome e número",
//             size: "M",
//             number: 1,
//             imgUrl:
//               "https://s-cf-tw.shopeesz.com/file/cn-11134211-7r98o-llxmmnxagd0kfa_tn",
//             orderCode: "24010676F8T1WU",
//             buyerAccount: "danielepires7",
//           },
//         ],
//       },
//       {
//         orderCode: "24010676DJDJKG",
//         amount: 248.95,
//         buyerAccount: "castor80",
//         goodsList: [
//           {
//             textColor: "#6db528",
//             spec: "sem nome e número",
//             size: "L",
//             number: 1,
//             imgUrl:
//               "https://s-cf-tw.shopeesz.com/file/sg-11134201-7rbk9-lmu2ev9j8815b8_tn",
//             orderCode: "24010676DJDJKG",
//             buyerAccount: "castor80",
//           },
//           {
//             textColor: "#55787e",
//             spec: "Com nome e número",
//             size: "XL",
//             number: 1,
//             imgUrl:
//               "https://s-cf-tw.shopeesz.com/file/cn-11134211-7r98o-lmsx7ohi4zqc1d_tn",
//             orderCode: "24010676DJDJKG",
//             buyerAccount: "castor80",
//           },
//           {
//             textColor: "#55787e",
//             spec: "Com nome e número",
//             size: "XL",
//             number: 1,
//             imgUrl:
//               "https://s-cf-tw.shopeesz.com/file/cn-11134211-7r98o-lmsx7ohi4zqc1d_tn",
//             orderCode: "24010676DJDJKG",
//             buyerAccount: "castor80",
//           },
//         ],
//       },
//     ],
//     _customizedDataSource_default: [
//       {
//         orderCode: "2401053781800B",
//         amount: 159.52,
//         buyerAccount: "hanielmorais",
//         goodsList: [
//           {
//             textColor: "#279104",
//             spec: "sem nome e número（2）",
//             size: "M",
//             number: 1,
//             imgUrl:
//               "https://s-cf-tw.shopeesz.com/file/cn-11134207-7r98o-lm0n5q9xkj6qbc_tn",
//             orderCode: "2401053781800B",
//             buyerAccount: "hanielmorais",
//           },
//           {
//             textColor: "#ab16a3",
//             spec: "Com nome e número",
//             size: "M",
//             number: 1,
//             imgUrl:
//               "https://s-cf-tw.shopeesz.com/file/cn-11134211-7r98o-llxmssftsobm31_tn",
//             orderCode: "2401053781800B",
//             buyerAccount: "hanielmorais",
//           },
//           {
//             textColor: "#ab16a3",
//             spec: "Com nome e número",
//             size: "M",
//             number: 1,
//             imgUrl:
//               "https://s-cf-tw.shopeesz.com/file/cn-11134211-7r98o-llxmssftsobm31_tn",
//             orderCode: "2401053781800B",
//             buyerAccount: "hanielmorais",
//           },
//           {
//             textColor: "#ab16a3",
//             spec: "Com nome e número",
//             size: "M",
//             number: 1,
//             imgUrl:
//               "https://s-cf-tw.shopeesz.com/file/cn-11134211-7r98o-llxmssftsobm31_tn",
//             orderCode: "2401053781800B",
//             buyerAccount: "hanielmorais",
//           },
//         ],
//       },
//       {
//         orderCode: "24010537X5TUSF",
//         amount: 88.22,
//         buyerAccount: "joogetlio269",
//         goodsList: [
//           {
//             textColor: "#6f6ee8",
//             spec: "Com nome e número",
//             size: "XXL",
//             number: 1,
//             imgUrl:
//               "https://s-cf-tw.shopeesz.com/file/cn-11134211-7r98o-llxxig4odujo68_tn",
//             orderCode: "24010537X5TUSF",
//             buyerAccount: "joogetlio269",
//           },
//         ],
//       },
//     ],
//     _nocustomizedDataSource: [
//       {
//         orderCode: "24010679F6P7V3",
//         amount: 145.01,
//         buyerAccount: "milenacampregher072",
//         goodsList: [
//           {
//             textColor: "#db83ce",
//             spec: "sem nome e número",
//             size: "S",
//             number: 1,
//             imgUrl:
//               "https://s-cf-tw.shopeesz.com/file/sg-11134201-7qvf1-lilfqdu4nthi9c_tn",
//             orderCode: "24010679F6P7V3",
//             buyerAccount: "milenacampregher072",
//           },
//           {
//             textColor: "#ac0073",
//             spec: "sem nome e número",
//             size: "M",
//             number: 1,
//             imgUrl:
//               "https://s-cf-tw.shopeesz.com/file/sg-11134201-7qvf1-lilfqdu4nthi9c_tn",
//             orderCode: "24010679F6P7V3",
//             buyerAccount: "milenacampregher072",
//           },
//         ],
//       },
//     ],
//     _examineDataSource: [],
//   },
//   flatDataSource: [
//     {
//       orderCode: "24010676F8T1WU",
//       amount: 175.23,
//       spec: "Com nome e número（2）",
//       size: "S",
//       number: 1,
//       imgUrl:
//         "https://s-cf-tw.shopeesz.com/file/cn-11134207-7r98o-lm1faxqo3so41e_tn",
//       buyerAccount: "danielepires7",
//     },
//     {
//       orderCode: "24010676F8T1WU",
//       amount: 175.23,
//       spec: "Com nome e número",
//       size: "M",
//       number: 1,
//       imgUrl:
//         "https://s-cf-tw.shopeesz.com/file/cn-11134211-7r98o-llxmmnxagd0kfa_tn",
//       buyerAccount: "danielepires7",
//     },
//     {
//       orderCode: "24010676DJDJKG",
//       amount: 248.95,
//       spec: "sem nome e número",
//       size: "L",
//       number: 1,
//       imgUrl:
//         "https://s-cf-tw.shopeesz.com/file/sg-11134201-7rbk9-lmu2ev9j8815b8_tn",
//       buyerAccount: "castor80",
//     },
//     {
//       orderCode: "24010676DJDJKG",
//       amount: 248.95,
//       spec: "Com nome e número",
//       size: "XL",
//       number: 2,
//       imgUrl:
//         "https://s-cf-tw.shopeesz.com/file/cn-11134211-7r98o-lmsx7ohi4zqc1d_tn",
//       buyerAccount: "castor80",
//     },
//     {
//       orderCode: "24010676MJGPC7",
//       amount: 88.22,
//       spec: "Com nome e número（1）",
//       size: "M",
//       number: 1,
//       imgUrl:
//         "https://s-cf-tw.shopeesz.com/file/cn-11134207-7r98o-lm1faxqo2e3ofa_tn",
//       buyerAccount: "ryan_augusto_sg",
//     },
//     {
//       orderCode: "24010679F6P7V3",
//       amount: 145.01,
//       spec: "sem nome e número",
//       size: "S",
//       number: 1,
//       imgUrl:
//         "https://s-cf-tw.shopeesz.com/file/sg-11134201-7qvf1-lilfqdu4nthi9c_tn",
//       buyerAccount: "milenacampregher072",
//     },
//     {
//       orderCode: "24010679F6P7V3",
//       amount: 145.01,
//       spec: "sem nome e número",
//       size: "M",
//       number: 1,
//       imgUrl:
//         "https://s-cf-tw.shopeesz.com/file/sg-11134201-7qvf1-lilfqdu4nthi9c_tn",
//       buyerAccount: "milenacampregher072",
//     },
//     {
//       orderCode: "2401053781800B",
//       amount: 159.52,
//       spec: "sem nome e número（2）",
//       size: "M",
//       number: 1,
//       imgUrl:
//         "https://s-cf-tw.shopeesz.com/file/cn-11134207-7r98o-lm0n5q9xkj6qbc_tn",
//       buyerAccount: "hanielmorais",
//     },
//     {
//       orderCode: "2401053781800B",
//       amount: 159.52,
//       spec: "Com nome e número",
//       size: "M",
//       number: 3,
//       imgUrl:
//         "https://s-cf-tw.shopeesz.com/file/cn-11134211-7r98o-llxmssftsobm31_tn",
//       buyerAccount: "hanielmorais",
//     },
//     {
//       orderCode: "240105379D4MBX",
//       amount: 88.22,
//       spec: "Com nome e número（1）",
//       size: "M",
//       number: 1,
//       imgUrl:
//         "https://s-cf-tw.shopeesz.com/file/cn-11134207-7r98o-lm1isfrikb3655_tn",
//       buyerAccount: "henriquegmv",
//     },
//     {
//       orderCode: "24010537X5TUSF",
//       amount: 88.22,
//       spec: "Com nome e número",
//       size: "XXL",
//       number: 1,
//       imgUrl:
//         "https://s-cf-tw.shopeesz.com/file/cn-11134211-7r98o-llxxig4odujo68_tn",
//       buyerAccount: "joogetlio269",
//     },
//     {
//       orderCode: "24010537X5TU002",
//       amount: 86.22,
//       spec: "Com nome e número",
//       size: "XXL",
//       number: 2,
//       imgUrl:
//         "https://s-cf-tw.shopeesz.com/file/cn-11134211-7r98o-llxxig4odujo68_tn",
//       buyerAccount: "xiangtong",
//     },
//     {
//       orderCode: "24010537X5TU001",
//       amount: 81.22,
//       spec: "Com nome e número",
//       size: "XXL",
//       number: 1,
//       imgUrl:
//         "https://s-cf-tw.shopeesz.com/file/cn-11134211-7r98o-llxxig4odujo68_tn",
//       buyerAccount: "xiangtong",
//     },
//   ],
//   allOrderCodes: [
//     "24010676F8T1WU",
//     "24010676DJDJKG",
//     "24010676MJGPC7",
//     "24010679F6P7V3",
//     "2401053781800B",
//     "240105379D4MBX",
//     "24010537X5TUSF",
//     "24010537X5TU002",
//     "24010537X5TU001",
//   ],
// };
