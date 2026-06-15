//获取参数
// 单件
// 多件
const params = {
  order_sn: '订单编号', //备注
  // total_price:'所有价格',
  'shipping_fee + order_items[i].amount*order_items[i].order_price': '所有价格', //1种
  // 'shipping_fee + order_items[i].item_list[i].amount*order_items[i].order_price':'所有价格',//2种//item_list如果有值先取，没有取上面，其实是1
  'shipping_fee + order_items[i].order_price': '所有价格', //直接取

  'buyer_user.user_name': '', //买家姓名
  'buyer_user.user_id': '', //买家id
  'order_items[i].product.images[0]': '图片', //存在多张，只取第一张（每个）
  'order_items[i].item_model.name': '规格', //存在多张，只取第一张（每个）
  'order_items[i].item_list[i].amount': '数量', //下单数量（每个：后取）---2种一件买了多条那种
  'order_items[i].amount': '数量', //下单数量（每个：先取）---2种
  //截止发货时间
}

//先排除的单
const filterSpec = [
  {
    id: 'spec007',
    key: 'sameBuyer',
    value: '同个买家下多个单',
    class: 'export-extra'
  },
  {
    id: 'specCancel',
    key: 'cancelOrder',
    value: '申请取消的单',
  },
  {
    id: 'spec009',
    key: 'priceOut',
    value: '大于R$230的单',
  },
]
//---------------规格第一版（旧）---------------
export const SPEC2 = [
  {
    id: 'spec000',
    key: 'sem nome e número',
    value: '不定制',
  },
  {
    id: 'spec001',
    key: 'sem nome e número(copa patch)',
    value: '不定制+补丁',
  },
  {
    id: 'spec002',
    key: '10#NEYMAR JR',
    value: '球星号',
  },
  {
    id: 'spec003',
    key: '10#NEYMAR JR(copa patch)',
    value: '球星号+补丁',
  },
  {
    id: 'spec004',

    key: 'Com nome e número',
    value: '定制名称号码',
  },
  {
    id: 'spec005',

    key: 'Com nome e número(copa patch)',
    value: '定制名称号码+补丁',
  },
  {
    id: 'spec0012',
    key: 'Nome+número',
    value: '旧：定制名字+号码',
    class: 'export-extra'
  },
]

const commont = [
  {
    id: 'spec008',
    key: 'otherOrder',
    value: '人工审核单',
    class: 'export-extra'
  },
  ...filterSpec,
]
//按钮
export const downBtn2 = [
  ...SPEC2,
  ...commont
]
//---------------规格其他店（ning）---------------
export const SPEC1 = [
  {
    id: 'spec0011',
    key: 'Sem nome',
    value: '没有名字'
  },
  {
    id: 'spec0012',
    key: 'Nome+número',
    value: '名字+号码'
  },
  {
    id: 'spec0013',
    key: 'Não nome',
    value: '没名字+号码'
  },
]

//按钮
export const downBtn1 = [
  ...SPEC1,
  ...commont
]

//---------------规格第一版（新）---------------
export const SPEC = [
  {
    id: 'spec000',
    key: 'sem nome e número',
    value: '不定制的单',
  },
  {
    id: 'spec111',//除开其他4种，都是定制
    key: 'qiuxinghaoOrder',
    value: '球星号+补丁',
  },
  {
    id: 'spec222',//除开其他4种，都是定制
    key: 'nameNumOrder',
    value: '姓名+号码+补丁',
  }
]
//规格合并最新按钮
export const downBtn = [
  ...SPEC,
  ...commont

]

//尺寸
// const size1 = ['S（P）','M（M）','L（G）','XL（GG）','XXL（2GG）']
// const size2 = ['S=P','M=M','L=G','XL=GG','XXL=2GG']
// const size3 = ['12（1-2 anos）','14','16','18','20','22 (6-7 anos)','24','26','28 (12-13 anos)']
const size = ['S', 'M', 'L', 'XL', 'XXL', '12', '14', '16', '18', '20', '22', '24', '26', '28']
// const size0 = ['12','14','16','18','20','22','24','26','28']//字符串查找，xl，顺序会先比L找到，所以要倒过来
// const size1 = ['XXL','XL','L','M','S',]//字符串查找，xl，顺序会先比L找到，所以要倒过来

export const SIZES = [...size]
