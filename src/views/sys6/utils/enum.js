//把中文key转英文
export const _setKeyCnToEn = {
  订单号: "orderCode",
  // 订单金额: "amount",//注释金额大于多少的
  产品规格: "spec", //独立多次
  商品尺寸: "size", //独立多次，(没有，自己后面组装的)
  产品总数: "number", //独立多次
  商品图片网址: "imgUrl", //独立多次
  订单备注: "orderRemark", //????多这个条件
  买家账号: "buyerAccount",
  买家Email: "buyerEmail",
  买家留言: "buyerLiuyan", //多一个买家留言
  产品名称: "productName",// 产品名称
  //   买家支付运费: "buyerPayFreight",
};

//补丁：买家自己备注
export const _SPEC_customized_rengong = [
  {
    value: "La Liga Patch",
    label: "西甲联赛",
  },
  {
    value: "UCL Patch",
    label: "欧洲冠军联赛",
  },
  {
    value: "UCL",
    label: "欧洲冠军联赛",
  },
  {
    value: "EURO 2024 Patch",
    label: "欧洲足球锦标赛",
  },
  {
    value: "Serie A Patch",
    label: "意大利足球甲级联赛",
  },
  {
    value: "America's Cup Patch",
    label: "南美洲杯",
  },
  {
    value: "EPL Patch",
    label: "英格兰足球超级联赛",
  },
  {
    value: "EPL",
    label: "英格兰足球超级联赛",
  },
  {
    value: "Bundesliga Patch",
    label: "德国足球甲级联赛",
  },
  {
    value: "Ligue 1 Patch",
    label: "法国足球甲级联赛",
  },
];
export const _SPEC_nocustomized = [
  {
    value: "NO",
    label: "不定制",
  },
  {
    value: "No",
    label: "不定制",
  },
  {
    value: "no",
    label: "不定制",
  },
  {
    value: "",
    label: "不定制",
  },
  //除了这3个规格，剩下都是定制
  // {
  //   value: "sem nome e número",
  //   label: "没有姓名和号码",
  // },
  // {
  //   value: "sem nome e número+Brasileirão",
  //   label: "没有姓名和号码+Brasileirão",
  // },
  // {
  //   value: "sem nome e número+Libertadores",
  //   label: "没有名字和号码+解放者",
  // },
  // {
  //   value: "sem nome e número(UCL Patch)",
  //   label: "没有姓名和号码（UCL 补丁）",
  // },
  // {
  //   value: "sem nome e número(SERIE A)",
  //   label: "无姓名和编号（A 系列）",
  // },
  // {
  //   value: "sem nome e número(LIGUE Patch)",
  //   label: "没有姓名和号码（CALL 补丁）",
  // },
  // {
  //   value: "sem nome e número(EPL Patch)",
  //   label: "没有姓名和号码（EPL 补丁）",
  // },
  // {
  //   value: "sem nome e número(Laliga Patch)",
  //   label: "没有姓名和号码（Laliga 补丁）",
  // },
  // {
  //   value: "Com nome e número",
  //   label: "有名字和号码",
  // },
  // {
  //   value: "Com nome e número+Brasileirão",
  //   label: "带有姓名和号码+Brasileirão",
  // },
  // {
  //   value: "Com nome e número+Libertadores",
  //   label: "yy有姓名和号码+解放者队yy",
  // },
  // {
  //   value: "Com nome e número(UCL Patch)",
  //   label: "有姓名和号码（UCL 补丁）",
  // },
  // {
  //   value: "Com nome e número(SERIE A)",
  //   label: "带有姓名和号码（A 系列）",
  // },
  // {
  //   value: "Com nome e número(LIGUE Patch)",
  //   label: "带姓名和号码（CALL 补丁）",
  // },
  // {
  //   value: "Com nome e número(EPL Patch)",
  //   label: "带姓名和号码（EPL 补丁）",
  // },
  // {
  //   value: "Com nome e número(Laliga Patch)",
  //   label: "带有姓名和号码（Laliga 补丁）",
  // },
];
export const _SIZE = [
  {
    value: "S",
  },
  {
    value: "M",
  },
  {
    value: "L",
  },
  {
    value: "XL",
  },
  {
    value: "XXL",
  },
  {
    value: "XXXL",
  },
  {
    value: "XXXXL",
  },
  {
    value: "3XL",
  },
  {
    value: "4XL",
  },
  // {
  //   value: "S=P",
  // },
  // {
  //   value: "M=M",
  // },
  // {
  //   value: "L=G",
  // },
  // {
  //   value: "XL=GG",
  // },
  // {
  //   value: "XXL=2GG",
  // },
  {
    value: "16#(3-4 anos)",
  },
  {
    value: "18#(4-5 anos)",
  },
  {
    value: "20#(5-6 anos)",
  },
  {
    value: "22#(7-8  anos)",
  },
  {
    value: "24#(8-9 anos)",
  },
  {
    value: "26#(10-11 anos)",
  },
  {
    value: "28#(12-13 anos)",
  },
];
export const _MONEY = "230";

//按钮，只取key
const getKeys = (arr) => {
  return arr.map((item) => item.value);
};

export const _BTNS = [
  {
    value: "sys4-sameBuyer",
    label: "同个买家下多个单", //大于230的也在里面
    valKey: "_sameBuyerDataSource",
  },
  {
    value: "sys4-noCustomized",
    specs: getKeys(_SPEC_nocustomized),
    label: "不定制", //不定制
    valKey: "_nocustomizedDataSource",
  },
  {
    value: "sys4-noCustomizedHasRemark",
    specs: getKeys(_SPEC_nocustomized),
    label: "不定制+备注定制信息", //不定制
    valKey: "_nocustomizedDataSourceHasRemark",
  },
  //定制分为：普通定制（不需要买家自己备注名字号码）；定制人工有备注（买家自己备注名字号码）；定制人工没备注
  {
    value: "sys4-examine",
    label: "定制", //定制人工的单，同时没备注
    valKey: "_examineDataSource",
  },
  {
    value: "sys4-examineHasNoRemark",
    label: "定制+缺少定制信息", //定制确没备注定制信息
    valKey: "_examineDataSourceHasNoRemark",
  },
];
