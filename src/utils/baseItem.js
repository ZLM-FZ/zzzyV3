import { filter as _filter, cloneDeep as _cloneDeep, includes as _includes, 
  find as _find, findIndex as _findIndex, sortBy as _sortBy,uniq as _uniq } from 'lodash'
import { getItem_spec_size, getSku_spec_size, window_href} from './base'

const init = window_href()
let curPage=init.curPage//order-ning店；old-旧店；new-新排序
let which_spec = init.which_spec


//最大金额
export const MAX_PRICE = 230 //R$

//挑出订单
export const getAllOrder = (arr, key = 'orders') => {
  let res = []
  arr.map(item => {
    const d = item.data[key]
    res = res.concat(d)
  })
  return res
}


//获取客户
export const setBuyer = ({
  userBuyMore,
  userBuyOnce,
  item,
  obj,
}) => {
  //获取购买的用户id
  const bol = _find(userBuyOnce, ['user_id', item.user_id])
  if (!bol) {
    userBuyOnce.push(obj)
  } else {
    //如果用户已存在,则购买多个，删了+去多个那，多个那也得查没有再加进去，有就不加了
    userBuyMore.push(obj)
    // 删存的单单个去到多个
    const i = _findIndex(userBuyOnce, ['user_id', item.user_id])
    userBuyMore.push(userBuyOnce[i])//要放回到多个那里
    userBuyOnce.splice(i, 1)
  }
  return {
    userBuyOnce,
    userBuyMore
  }
}

//初版拆分每个独立规格 的单，后定制的都合并一起
const setSameSpecData = (specArrsDatas, spec, item) => {
  //查出规格id
  const specInx = _findIndex(which_spec, ['key', spec])
  if (specInx !== -1) {
    const key = which_spec[specInx].id
    specArrsDatas[key].push(item)
  } else {
    //多件
    specArrsDatas['spec008'].push(item)
  }
}

//新规格合并
const setNewSpecData = (specArrsDatas, spec, item) => {
  // 定制：球星号+补丁
  if(spec ==='sem nome e número(copa patch)' || spec ==='Sem nome número(copa patch)' || spec==='10#NEYMAR JR' || spec === '10#NEYMAR JR(copa patch)'){
    specArrsDatas['spec111'].push(item)
  }else if(spec === 'Com nome e número' || spec === 'Com nome e número(copa patch)' || spec === 'Nome+número' || spec==='Com nome número(copa patch)' 
  || spec==='Sem nome e número+Brasileirão'|| spec==='Sem nome e número+Libertadores'|| spec==='Com nome e número+Brasileirão'|| spec==='Com nome e número+Libertadores'){
    //定制：姓名+号码+补丁
    specArrsDatas['spec222'].push(item)
  }else{
    // if(spec ==='Home（Amarelo）'){

    // }
    const specInx = _findIndex(which_spec, ['key', spec])
    if (specInx !== -1) {
      const key = which_spec[specInx].id
      specArrsDatas[key].push(item)
    } else {
      //多件
      specArrsDatas['spec008'].push(item)
    }
  }
}

//定制与非定制，订单为维度
export const yesDataSort1 = ({ item, specArrsDatas }) => {
  const { order_items, order_sn } = item
  //只单只有一个，商品多件，但是购买多件
  if (order_items.length === 1) {
    // 多规格
    const {bundle_deal_model, item_list} = order_items[0]
    if(item_list.length > 0){

      // 多个规格都一样的
      let isSameSpec = true
      let curSpec = ''
      for (let index = 0; index < item_list.length; index++) {
        const sku = getSku_spec_size(bundle_deal_model[index].name)
        const spec = sku.spec
        if (curSpec === '') {
          curSpec = spec
        } else {
          if (curSpec !== spec) {
            isSameSpec = false
          }
        }
      }
      //都相同
      if (isSameSpec) {
        if(curPage === 'new'){
          setNewSpecData(specArrsDatas, curSpec, item)
        }else{
          setSameSpecData(specArrsDatas, curSpec, item)
        }
        
      } else {
        specArrsDatas['spec008'].push(item)
      }

    
    }else{
      //单规格
      const spec = getItem_spec_size(order_items[0]).spec
      if(curPage === 'new'){
        setNewSpecData(specArrsDatas, spec, item)
      }else{
        setSameSpecData(specArrsDatas, spec, item)
      }
    }
    
  } else {
    //多个规格
    // 多个规格都一样的
    let isSameSpec = true
    let curSpec = ''
    for (let index = 0; index < order_items.length; index++) {
      const spec = getItem_spec_size(order_items[index]).spec
      if (curSpec === '') {
        curSpec = spec
      } else {
        if (curSpec !== spec) {
          isSameSpec = false
        }
      }
    }

    //都相同
    if (isSameSpec) {
      if(curPage === 'new'){
        setNewSpecData(specArrsDatas, curSpec, item)
      }else{
        setSameSpecData(specArrsDatas, curSpec, item)
      }
      
    } else {
      specArrsDatas['spec008'].push(item)
    }
  }
}


//排序，相同的商家排靠近
export const changeSamneBuyerData = (userMoreIds, datas)=>{
  const moreIds = _uniq(userMoreIds)
console.log(datas,'---datas')

  const res = []
  moreIds.map(id=>{
    datas.map(item=>{
      if(id===item.buyer_user.user_id){
        console.log(item.buyer_user.user_id)
        res.push(item)//收集
      }
    })
  })
  return res
}

//--------------优化版--------------
export const yesDataSort = ({ item, specArrsDatas }) => {
  const { order_items, order_sn } = item

  // 是否相同判断
  let isSameSpec = true
  let curSpec = ''
  for (let ii = 0; ii < order_items.length; ii++) {
    const { bundle_deal_model, item_list } = order_items[ii]
    // 多个sku
    if (item_list.length > 0) {
      for (let jj = 0; jj < item_list.length; jj++) {
        const sku = getSku_spec_size(bundle_deal_model[jj].name)
        const spec = sku.spec
        if (!curSpec) {
          curSpec = spec
        } else {
          if (curSpec !== spec) {
            isSameSpec = false
            break
          }
        }
      }
    } else {
      // 单个sku
      const spec = getItem_spec_size(order_items[ii]).spec
      if (!curSpec) {
        curSpec = spec
      } else {
        if (curSpec !== spec) {
          isSameSpec = false
          break
        }
      }
    }

    // 只要一不相同，直接出去不再执行
    if (isSameSpec === false) {
      break
    }
  }
  // ---拿到结果赋值----
  if(isSameSpec){
    if (curPage === 'new') {
      setNewSpecData(specArrsDatas, curSpec, item)
    } else {
      setSameSpecData(specArrsDatas, curSpec, item)
    }
  }else{
    specArrsDatas['spec008'].push(item)
  }
}